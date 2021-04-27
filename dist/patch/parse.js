"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyHunkIntegrity = exports.parsePatchFile = exports.interpretParsedPatchFile = exports.EXECUTABLE_FILE_MODE = exports.NON_EXECUTABLE_FILE_MODE = exports.parseHunkHeaderLine = void 0;
const assertNever_1 = require("../assertNever");
exports.parseHunkHeaderLine = (headerLine) => {
    const match = headerLine
        .trim()
        .match(/^@@ -(\d+)(,(\d+))? \+(\d+)(,(\d+))? @@.*/);
    if (!match) {
        throw new Error(`Bad header line: '${headerLine}'`);
    }
    return {
        original: {
            start: Math.max(Number(match[1]), 1),
            length: Number(match[3] || 1),
        },
        patched: {
            start: Math.max(Number(match[4]), 1),
            length: Number(match[6] || 1),
        },
    };
};
exports.NON_EXECUTABLE_FILE_MODE = 0o644;
exports.EXECUTABLE_FILE_MODE = 0o755;
const emptyFilePatch = () => ({
    diffLineFromPath: null,
    diffLineToPath: null,
    oldMode: null,
    newMode: null,
    deletedFileMode: null,
    newFileMode: null,
    renameFrom: null,
    renameTo: null,
    beforeHash: null,
    afterHash: null,
    fromPath: null,
    toPath: null,
    hunks: null,
});
const emptyHunk = (headerLine) => ({
    header: exports.parseHunkHeaderLine(headerLine),
    parts: [],
});
const hunkLinetypes = {
    "@": "header",
    "-": "deletion",
    "+": "insertion",
    " ": "context",
    "\\": "pragma",
    // Treat blank lines as context
    undefined: "context",
    "\r": "context",
};
function parsePatchLines(lines, { supportLegacyDiffs }) {
    const result = [];
    let currentFilePatch = emptyFilePatch();
    let state = "parsing header";
    let currentHunk = null;
    let currentHunkMutationPart = null;
    function commitHunk() {
        if (currentHunk) {
            if (currentHunkMutationPart) {
                currentHunk.parts.push(currentHunkMutationPart);
                currentHunkMutationPart = null;
            }
            currentFilePatch.hunks.push(currentHunk);
            currentHunk = null;
        }
    }
    function commitFilePatch() {
        commitHunk();
        result.push(currentFilePatch);
        currentFilePatch = emptyFilePatch();
    }
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (state === "parsing header") {
            if (line.startsWith("@@")) {
                state = "parsing hunks";
                currentFilePatch.hunks = [];
                i--;
            }
            else if (line.startsWith("diff --git ")) {
                if (currentFilePatch && currentFilePatch.diffLineFromPath) {
                    commitFilePatch();
                }
                const match = line.match(/^diff --git a\/(.*?) b\/(.*?)\s*$/);
                if (!match) {
                    throw new Error("Bad diff line: " + line);
                }
                currentFilePatch.diffLineFromPath = match[1];
                currentFilePatch.diffLineToPath = match[2];
            }
            else if (line.startsWith("old mode ")) {
                currentFilePatch.oldMode = line.slice("old mode ".length).trim();
            }
            else if (line.startsWith("new mode ")) {
                currentFilePatch.newMode = line.slice("new mode ".length).trim();
            }
            else if (line.startsWith("deleted file mode ")) {
                currentFilePatch.deletedFileMode = line
                    .slice("deleted file mode ".length)
                    .trim();
            }
            else if (line.startsWith("new file mode ")) {
                currentFilePatch.newFileMode = line
                    .slice("new file mode ".length)
                    .trim();
            }
            else if (line.startsWith("rename from ")) {
                currentFilePatch.renameFrom = line.slice("rename from ".length).trim();
            }
            else if (line.startsWith("rename to ")) {
                currentFilePatch.renameTo = line.slice("rename to ".length).trim();
            }
            else if (line.startsWith("index ")) {
                const match = line.match(/(\w+)\.\.(\w+)/);
                if (!match) {
                    continue;
                }
                currentFilePatch.beforeHash = match[1];
                currentFilePatch.afterHash = match[2];
            }
            else if (line.startsWith("--- ")) {
                currentFilePatch.fromPath = line.slice("--- a/".length).trim();
            }
            else if (line.startsWith("+++ ")) {
                currentFilePatch.toPath = line.slice("+++ b/".length).trim();
            }
        }
        else {
            if (supportLegacyDiffs && line.startsWith("--- a/")) {
                state = "parsing header";
                commitFilePatch();
                i--;
                continue;
            }
            // parsing hunks
            const lineType = hunkLinetypes[line[0]] || null;
            switch (lineType) {
                case "header":
                    commitHunk();
                    currentHunk = emptyHunk(line);
                    break;
                case null:
                    // unrecognized, bail out
                    state = "parsing header";
                    commitFilePatch();
                    i--;
                    break;
                case "pragma":
                    if (!line.startsWith("\\ No newline at end of file")) {
                        throw new Error("Unrecognized pragma in patch file: " + line);
                    }
                    if (!currentHunkMutationPart) {
                        throw new Error("Bad parser state: No newline at EOF pragma encountered without context");
                    }
                    currentHunkMutationPart.noNewlineAtEndOfFile = true;
                    break;
                case "insertion":
                case "deletion":
                case "context":
                    if (!currentHunk) {
                        throw new Error("Bad parser state: Hunk lines encountered before hunk header");
                    }
                    if (currentHunkMutationPart &&
                        currentHunkMutationPart.type !== lineType) {
                        currentHunk.parts.push(currentHunkMutationPart);
                        currentHunkMutationPart = null;
                    }
                    if (!currentHunkMutationPart) {
                        currentHunkMutationPart = {
                            type: lineType,
                            lines: [],
                            noNewlineAtEndOfFile: false,
                        };
                    }
                    currentHunkMutationPart.lines.push(line.slice(1));
                    break;
                default:
                    // exhausitveness check
                    assertNever_1.assertNever(lineType);
            }
        }
    }
    commitFilePatch();
    for (const { hunks } of result) {
        if (hunks) {
            for (const hunk of hunks) {
                verifyHunkIntegrity(hunk);
            }
        }
    }
    return result;
}
function interpretParsedPatchFile(files) {
    const result = [];
    for (const file of files) {
        const { diffLineFromPath, diffLineToPath, oldMode, newMode, deletedFileMode, newFileMode, renameFrom, renameTo, beforeHash, afterHash, fromPath, toPath, hunks, } = file;
        const type = renameFrom
            ? "rename"
            : deletedFileMode
                ? "file deletion"
                : newFileMode
                    ? "file creation"
                    : hunks && hunks.length > 0
                        ? "patch"
                        : "mode change";
        let destinationFilePath = null;
        switch (type) {
            case "rename":
                if (!renameFrom || !renameTo) {
                    throw new Error("Bad parser state: rename from & to not given");
                }
                result.push({
                    type: "rename",
                    fromPath: renameFrom,
                    toPath: renameTo,
                });
                destinationFilePath = renameTo;
                break;
            case "file deletion": {
                const path = diffLineFromPath || fromPath;
                if (!path) {
                    throw new Error("Bad parse state: no path given for file deletion");
                }
                result.push({
                    type: "file deletion",
                    hunk: (hunks && hunks[0]) || null,
                    path,
                    mode: parseFileMode(deletedFileMode),
                    hash: beforeHash,
                });
                break;
            }
            case "file creation": {
                const path = diffLineToPath || toPath;
                if (!path) {
                    throw new Error("Bad parse state: no path given for file creation");
                }
                result.push({
                    type: "file creation",
                    hunk: (hunks && hunks[0]) || null,
                    path,
                    mode: parseFileMode(newFileMode),
                    hash: afterHash,
                });
                break;
            }
            case "patch":
            case "mode change":
                destinationFilePath = toPath || diffLineToPath;
                break;
            default:
                assertNever_1.assertNever(type);
        }
        if (destinationFilePath && oldMode && newMode && oldMode !== newMode) {
            result.push({
                type: "mode change",
                path: destinationFilePath,
                oldMode: parseFileMode(oldMode),
                newMode: parseFileMode(newMode),
            });
        }
        if (destinationFilePath && hunks && hunks.length) {
            result.push({
                type: "patch",
                path: destinationFilePath,
                hunks,
                beforeHash,
                afterHash,
            });
        }
    }
    return result;
}
exports.interpretParsedPatchFile = interpretParsedPatchFile;
function parseFileMode(mode) {
    // tslint:disable-next-line:no-bitwise
    const parsedMode = parseInt(mode, 8) & 0o777;
    if (parsedMode !== exports.NON_EXECUTABLE_FILE_MODE &&
        parsedMode !== exports.EXECUTABLE_FILE_MODE) {
        throw new Error("Unexpected file mode string: " + mode);
    }
    return parsedMode;
}
function parsePatchFile(file) {
    const lines = file.split(/\n/g);
    if (lines[lines.length - 1] === "") {
        lines.pop();
    }
    try {
        return interpretParsedPatchFile(parsePatchLines(lines, { supportLegacyDiffs: false }));
    }
    catch (e) {
        if (e instanceof Error &&
            e.message === "hunk header integrity check failed") {
            return interpretParsedPatchFile(parsePatchLines(lines, { supportLegacyDiffs: true }));
        }
        throw e;
    }
}
exports.parsePatchFile = parsePatchFile;
function verifyHunkIntegrity(hunk) {
    // verify hunk integrity
    let originalLength = 0;
    let patchedLength = 0;
    for (const { type, lines } of hunk.parts) {
        switch (type) {
            case "context":
                patchedLength += lines.length;
                originalLength += lines.length;
                break;
            case "deletion":
                originalLength += lines.length;
                break;
            case "insertion":
                patchedLength += lines.length;
                break;
            default:
                assertNever_1.assertNever(type);
        }
    }
    if (originalLength !== hunk.header.original.length ||
        patchedLength !== hunk.header.patched.length) {
        throw new Error("hunk header integrity check failed");
    }
}
exports.verifyHunkIntegrity = verifyHunkIntegrity;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGF0Y2gvcGFyc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsZ0RBQTRDO0FBYS9CLFFBQUEsbUJBQW1CLEdBQUcsQ0FBQyxVQUFrQixFQUFjLEVBQUU7SUFDcEUsTUFBTSxLQUFLLEdBQUcsVUFBVTtTQUNyQixJQUFJLEVBQUU7U0FDTixLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQTtJQUNyRCxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsVUFBVSxHQUFHLENBQUMsQ0FBQTtLQUNwRDtJQUVELE9BQU87UUFDTCxRQUFRLEVBQUU7WUFDUixLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM5QjtRQUNELE9BQU8sRUFBRTtZQUNQLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDcEMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlCO0tBQ0YsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVZLFFBQUEsd0JBQXdCLEdBQUcsS0FBSyxDQUFBO0FBQ2hDLFFBQUEsb0JBQW9CLEdBQUcsS0FBSyxDQUFBO0FBK0V6QyxNQUFNLGNBQWMsR0FBRyxHQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZDLGdCQUFnQixFQUFFLElBQUk7SUFDdEIsY0FBYyxFQUFFLElBQUk7SUFDcEIsT0FBTyxFQUFFLElBQUk7SUFDYixPQUFPLEVBQUUsSUFBSTtJQUNiLGVBQWUsRUFB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RUFDNUM7UUFDQSxNQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUE7S0FDdEQ7QUFDSCxDQUFDO0FBM0JELGtEQTJCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFzc2VydE5ldmVyIH0gZnJvbSBcIi4uL2Fzc2VydE5ldmVyXCJcblxuZXhwb3J0IGludGVyZmFjZSBIdW5rSGVhZGVyIHtcbiAgb3JpZ2luYWw6IHtcbiAgICBzdGFydDogbnVtYmVyXG4gICAgbGVuZ3RoOiBudW1iZXJcbiAgfVxuICBwYXRjaGVkOiB7XG4gICAgc3RhcnQ6IG51bWJlclxuICAgIGxlbmd0aDogbnVtYmVyXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHBhcnNlSHVua0hlYWRlckxpbmUgPSAoaGVhZGVyTGluZTogc3RyaW5nKTogSHVua0hlYWRlciA9PiB7XG4gIGNvbnN0IG1hdGNoID0gaGVhZGVyTGluZVxuICAgIC50cmltKClcbiAgICAubWF0Y2goL15AQCAtKFxcZCspKCwoXFxkKykpPyBcXCsoXFxkKykoLChcXGQrKSk/IEBALiovKVxuICBpZiAoIW1hdGNoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBCYWQgaGVhZGVyIGxpbmU6ICcke2hlYWRlckxpbmV9J2ApXG4gIH1cblxuICByZXR1cm4ge1xuICAgIG9yaWdpbmFsOiB7XG4gICAgICBzdGFydDogTWF0aC5tYXgoTnVtYmVyKG1hdGNoWzFdKSwgMSksXG4gICAgICBsZW5ndGg6IE51bWJlcihtYXRjaFszXSB8fCAxKSxcbiAgICB9LFxuICAgIHBhdGNoZWQ6IHtcbiAgICAgIHN0YXJ0OiBNYXRoLm1heChOdW1iZXIobWF0Y2hbNF0pLCAxKSxcbiAgICAgIGxlbmd0aDogTnVtYmVyKG1hdGNoWzZdIHx8IDEpLFxuICAgIH0sXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IE5PTl9FWEVDVVRBQkxFX0ZJTEVfTU9ERSA9IDBvNjQ0XG5leHBvcnQgY29uc3QgRVhFQ1VUQUJMRV9GSUxFX01PREUgPSAwbzc1NVxuXG50eXBlIEZpbGVNb2RlID0gdHlwZW9mIE5PTl9FWEVDVVRBQkxFX0ZJTEVfTU9ERSB8IHR5cGVvZiBFWEVDVVRBQkxFX0ZJTEVfTU9ERVxuXG5pbnRlcmZhY2UgUGF0Y2hNdXRhdGlvblBhcnQge1xuICB0eXBlOiBcImNvbnRleHRcIiB8IFwiaW5zZXJ0aW9uXCIgfCBcImRlbGV0aW9uXCJcbiAgbGluZXM6IHN0cmluZ1tdXG4gIG5vTmV3bGluZUF0RW5kT2ZGaWxlOiBib29sZWFuXG59XG5cbmludGVyZmFjZSBGaWxlUmVuYW1lIHtcbiAgdHlwZTogXCJyZW5hbWVcIlxuICBmcm9tUGF0aDogc3RyaW5nXG4gIHRvUGF0aDogc3RyaW5nXG59XG5cbmludGVyZmFjZSBGaWxlTW9kZUNoYW5nZSB7XG4gIHR5cGU6IFwibW9kZSBjaGFuZ2VcIlxuICBwYXRoOiBzdHJpbmdcbiAgb2xkTW9kZTogRmlsZU1vZGVcbiAgbmV3TW9kZTogRmlsZU1vZGVcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGaWxlUGF0Y2gge1xuICB0eXBlOiBcInBhdGNoXCJcbiAgcGF0aDogc3RyaW5nXG4gIGh1bmtzOiBIdW5rW11cbiAgYmVmb3JlSGFzaDogc3RyaW5nIHwgbnVsbFxuICBhZnRlckhhc2g6IHN0cmluZyB8IG51bGxcbn1cblxuaW50ZXJmYWNlIEZpbGVEZWxldGlvbiB7XG4gIHR5cGU6IFwiZmlsZSBkZWxldGlvblwiXG4gIHBhdGg6IHN0cmluZ1xuICBtb2RlOiBGaWxlTW9kZVxuICBodW5rOiBIdW5rIHwgbnVsbFxuICBoYXNoOiBzdHJpbmcgfCBudWxsXG59XG5cbmludGVyZmFjZSBGaWxlQ3JlYXRpb24ge1xuICB0eXBlOiBcImZpbGUgY3JlYXRpb25cIlxuICBtb2RlOiBGaWxlTW9kZVxuICBwYXRoOiBzdHJpbmdcbiAgaHVuazogSHVuayB8IG51bGxcbiAgaGFzaDogc3RyaW5nIHwgbnVsbFxufVxuXG5leHBvcnQgdHlwZSBQYXRjaEZpbGVQYXJ0ID1cbiAgfCBGaWxlUGF0Y2hcbiAgfCBGaWxlRGVsZXRpb25cbiAgfCBGaWxlQ3JlYXRpb25cbiAgfCBGaWxlUmVuYW1lXG4gIHwgRmlsZU1vZGVDaGFuZ2VcblxuZXhwb3J0IHR5cGUgUGFyc2VkUGF0Y2hGaWxlID0gUGF0Y2hGaWxlUGFydFtdXG5cbnR5cGUgU3RhdGUgPSBcInBhcnNpbmcgaGVhZGVyXCIgfCBcInBhcnNpbmcgaHVua3NcIlxuXG5pbnRlcmZhY2UgRmlsZURlZXRzIHtcbiAgZGlmZkxpbmVGcm9tUGF0aDogc3RyaW5nIHwgbnVsbFxuICBkaWZmTGluZVRvUGF0aDogc3RyaW5nIHwgbnVsbFxuICBvbGRNb2RlOiBzdHJpbmcgfCBudWxsXG4gIG5ld01vZGU6IHN0cmluZyB8IG51bGxcbiAgZGVsZXRlZEZpbGVNb2RlOiBzdHJpbmcgfCBudWxsXG4gIG5ld0ZpbGVNb2RlOiBzdHJpbmcgfCBudWxsXG4gIHJlbmFtZUZyb206IHN0cmluZyB8IG51bGxcbiAgcmVuYW1lVG86IHN0cmluZyB8IG51bGxcbiAgYmVmb3JlSGFzaDogc3RyaW5nIHwgbnVsbFxuICBhZnRlckhhc2g6IHN0cmluZyB8IG51bGxcbiAgZnJvbVBhdGg6IHN0cmluZyB8IG51bGxcbiAgdG9QYXRoOiBzdHJpbmcgfCBudWxsXG4gIGh1bmtzOiBIdW5rW10gfCBudWxsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSHVuayB7XG4gIGhlYWRlcjogSHVua0hlYWRlclxuICBwYXJ0czogUGF0Y2hNdXRhdGlvblBhcnRbXVxufVxuXG5jb25zdCBlbXB0eUZpbGVQYXRjaCA9ICgpOiBGaWxlRGVldHMgPT4gKHtcbiAgZGlmZkxpbmVGcm9tUGF0aDogbnVsbCxcbiAgZGlmZkxpbmVUb1BhdGg6IG51bGwsXG4gIG9sZE1vZGU6IG51bGwsXG4gIG5ld01vZGU6IG51bGwsXG4gIGRlbGV0ZWRGaWxlTW9kZTogbnVsbCxcbiAgbmV3RmlsZU1vZGU6IG51bGwsXG4gIHJlbmFtZUZyb206IG51bGwsXG4gIHJlbmFtZVRvOiBudWxsLFxuICBiZWZvcmVIYXNoOiBudWxsLFxuICBhZnRlckhhc2g6IG51bGwsXG4gIGZyb21QYXRoOiBudWxsLFxuICB0b1BhdGg6IG51bGwsXG4gIGh1bmtzOiBudWxsLFxufSlcblxuY29uc3QgZW1wdHlIdW5rID0gKGhlYWRlckxpbmU6IHN0cmluZyk6IEh1bmsgPT4gKHtcbiAgaGVhZGVyOiBwYXJzZUh1bmtIZWFkZXJMaW5lKGhlYWRlckxpbmUpLFxuICBwYXJ0czogW10sXG59KVxuXG5jb25zdCBodW5rTGluZXR5cGVzOiB7XG4gIFtrOiBzdHJpbmddOiBQYXRjaE11dGF0aW9uUGFydFtcInR5cGVcIl0gfCBcInByYWdtYVwiIHwgXCJoZWFkZXJcIlxufSA9IHtcbiAgXCJAXCI6IFwiaGVhZGVyXCIsXG4gIFwiLVwiOiBcImRlbGV0aW9uXCIsXG4gIFwiK1wiOiBcImluc2VydGlvblwiLFxuICBcIiBcIjogXCJjb250ZXh0XCIsXG4gIFwiXFxcXFwiOiBcInByYWdtYVwiLFxuICAvLyBUcmVhdCBibGFuayBsaW5lcyBhcyBjb250ZXh0XG4gIHVuZGVmaW5lZDogXCJjb250ZXh0XCIsXG4gIFwiXFxyXCI6IFwiY29udGV4dFwiLFxufVxuXG5mdW5jdGlvbiBwYXJzZVBhdGNoTGluZXMoXG4gIGxpbmVzOiBzdHJpbmdbXSxcbiAgeyBzdXBwb3J0TGVnYWN5RGlmZnMgfTogeyBzdXBwb3J0TGVnYWN5RGlmZnM6IGJvb2xlYW4gfSxcbik6IEZpbGVEZWV0c1tdIHtcbiAgY29uc3QgcmVzdWx0OiBGaWxlRGVldHNbXSA9IFtdXG4gIGxldCBjdXJyZW50RmlsZVBhdGNoOiBGaWxlRGVldHMgPSBlbXB0eUZpbGVQYXRjaCgpXG4gIGxldCBzdGF0ZTogU3RhdGUgPSBcInBhcnNpbmcgaGVhZGVyXCJcbiAgbGV0IGN1cnJlbnRIdW5rOiBIdW5rIHwgbnVsbCA9IG51bGxcbiAgbGV0IGN1cnJlbnRIdW5rTXV0YXRpb25QYXJ0OiBQYXRjaE11dGF0aW9uUGFydCB8IG51bGwgPSBudWxsXG5cbiAgZnVuY3Rpb24gY29tbWl0SHVuaygpIHtcbiAgICBpZiAoY3VycmVudEh1bmspIHtcbiAgICAgIGlmIChjdXJyZW50SHVua011dGF0aW9uUGFydCkge1xuICAgICAgICBjdXJyZW50SHVuay5wYXJ0cy5wdXNoKGN1cnJlbnRIdW5rTXV0YXRpb25QYXJ0KVxuICAgICAgICBjdXJyZW50SHVua011dGF0aW9uUGFydCA9IG51bGxcbiAgICAgIH1cbiAgICAgIGN1cnJlbnRGaWxlUGF0Y2guaHVua3MhLnB1c2goY3VycmVudEh1bmspXG4gICAgICBjdXJyZW50SHVuayA9IG51bGxcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb21taXRGaWxlUGF0Y2goKSB7XG4gICAgY29tbWl0SHVuaygpXG4gICAgcmVzdWx0LnB1c2goY3VycmVudEZpbGVQYXRjaClcbiAgICBjdXJyZW50RmlsZVBhdGNoID0gZW1wdHlGaWxlUGF0Y2goKVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tpXVxuXG4gICAgaWYgKHN0YXRlID09PSBcInBhcnNpbmcgaGVhZGVyXCIpIHtcbiAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJAQFwiKSkge1xuICAgICAgICBzdGF0ZSA9IFwicGFyc2luZyBodW5rc1wiXG4gICAgICAgIGN1cnJlbnRGaWxlUGF0Y2guaHVua3MgPSBbXVxuICAgICAgICBpLS1cbiAgICAgIH0gZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwiZGlmZiAtLWdpdCBcIikpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRGaWxlUGF0Y2ggJiYgY3VycmVudEZpbGVQYXRjaC5kaWZmTGluZUZyb21QYXRoKSB7XG4gICAgICAgICAgY29tbWl0RmlsZVBhdGNoKClcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2goL15kaWZmIC0tZ2l0IGFcXC8oLio/KSBiXFwvKC4qPylcXHMqJC8pXG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCYWQgZGlmZiBsaW5lOiBcIiArIGxpbmUpXG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudEZpbGVQYXRjaC5kaWZmTGluZUZyb21QYXRoID0gbWF0Y2hbMV1cbiAgICAgICAgY3VycmVudEZpbGVQYXRjaC5kaWZmTGluZVRvUGF0aCA9IG1hdGNoWzJdXG4gICAgICB9IGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcIm9sZCBtb2RlIFwiKSkge1xuICAgICAgICBjdXJyZW50RmlsZVBhdGNoLm9sZE1vZGUgPSBsaW5lLnNsaWNlKFwib2xkIG1vZGUgXCIubGVuZ3RoKS50cmltKClcbiAgICAgIH0gZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwibmV3IG1vZGUgXCIpKSB7XG4gICAgICAgIGN1cnJlbnRGaWxlUGF0Y2gubmV3TW9kZSA9IGxpbmUuc2xpY2UoXCJuZXcgbW9kZSBcIi5sZW5ndGgpLnRyaW0oKVxuICAgICAgfSBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJkZWxldGVkIGZpbGUgbW9kZSBcIikpIHtcbiAgICAgICAgY3VycmVudEZpbGVQYXRjaC5kZWxldGVkRmlsZU1vZGUgPSBsaW5lXG4gICAgICAgICAgLnNsaWNlKFwiZGVsZXRlZCBmaWxlIG1vZGUgXCIubGVuZ3RoKVxuICAgICAgICAgIC50cmltKClcbiAgICAgIH0gZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwibmV3IGZpbGUgbW9kZSBcIikpIHtcbiAgICAgICAgY3VycmVudEZpbGVQYXRjaC5uZXdGaWxlTW9kZSA9IGxpbmVcbiAgICAgICAgICAuc2xpY2UoXCJuZXcgZmlsZSBtb2RlIFwiLmxlbmd0aClcbiAgICAgICAgICAudHJpbSgpXG4gICAgICB9IGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcInJlbmFtZSBmcm9tIFwiKSkge1xuICAgICAgICBjdXJyZW50RmlsZVBhdGNoLnJlbmFtZUZyb20gPSBsaW5lLnNsaWNlKFwicmVuYW1lIGZyb20gXCIubGVuZ3RoKS50cmltKClcbiAgICAgIH0gZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwicmVuYW1lIHRvIFwiKSkge1xuICAgICAgICBjdXJyZW50RmlsZVBhdGNoLnJlbmFtZVRvID0gbGluZS5zbGljZShcInJlbmFtZSB0byBcIi5sZW5ndGgpLnRyaW0oKVxuICAgICAgfSBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJpbmRleCBcIikpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKC8oXFx3KylcXC5cXC4oXFx3KykvKVxuICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50RmlsZVBhdGNoLmJlZm9yZUhhc2ggPSBtYXRjaFsxXVxuICAgICAgICBjdXJyZW50RmlsZVBhdGNoLmFmdGVySGFzaCA9IG1hdGNoWzJdXG4gICAgICB9IGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcIi0tLSBcIikpIHtcbiAgICAgICAgY3VycmVudEZpbGVQYXRjaC5mcm9tUGF0aCA9IGxpbmUuc2xpY2UoXCItLS0gYS9cIi5sZW5ndGgpLnRyaW0oKVxuICAgICAgfSBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCIrKysgXCIpKSB7XG4gICAgICAgIGN1cnJlbnRGaWxlUGF0Y2gudG9QYXRoID0gbGluZS5zbGljZShcIisrKyBiL1wiLmxlbmd0aCkudHJpbSgpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzdXBwb3J0TGVnYWN5RGlmZnMgJiYgbGluZS5zdGFydHNXaXRoKFwiLS0tIGEvXCIpKSB7XG4gICAgICAgIHN0YXRlID0gXCJwYXJzaW5nIGhlYWRlclwiXG4gICAgICAgIGNvbW1pdEZpbGVQYXRjaCgpXG4gICAgICAgIGktLVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgLy8gcGFyc2luZyBodW5rc1xuICAgICAgY29uc3QgbGluZVR5cGUgPSBodW5rTGluZXR5cGVzW2xpbmVbMF1dIHx8IG51bGxcbiAgICAgIHN3aXRjaCAobGluZVR5cGUpIHtcbiAgICAgICAgY2FzZSBcImhlYWRlclwiOlxuICAgICAgICAgIGNvbW1pdEh1bmsoKVxuICAgICAgICAgIGN1cnJlbnRIdW5rID0gZW1wdHlIdW5rKGxpbmUpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBudWxsOlxuICAgICAgICAgIC8vIHVucmVjb2duaXplZCwgYmFpbCBvdXRcbiAgICAgICAgICBzdGF0ZSA9IFwicGFyc2luZyBoZWFkZXJcIlxuICAgICAgICAgIGNvbW1pdEZpbGVQYXRjaCgpXG4gICAgICAgICAgaS0tXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcInByYWdtYVwiOlxuICAgICAgICAgIGlmICghbGluZS5zdGFydHNXaXRoKFwiXFxcXCBObyBuZXdsaW5lIGF0IGVuZCBvZiBmaWxlXCIpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnJlY29nbml6ZWQgcHJhZ21hIGluIHBhdGNoIGZpbGU6IFwiICsgbGluZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFjdXJyZW50SHVua011dGF0aW9uUGFydCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBcIkJhZCBwYXJzZXIgc3RhdGU6IE5vIG5ld2xpbmUgYXQgRU9GIHByYWdtYSBlbmNvdW50ZXJlZCB3aXRob3V0IGNvbnRleHRcIixcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgY3VycmVudEh1bmtNdXRhdGlvblBhcnQubm9OZXdsaW5lQXRFbmRPZkZpbGUgPSB0cnVlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcImluc2VydGlvblwiOlxuICAgICAgICBjYXNlIFwiZGVsZXRpb25cIjpcbiAgICAgICAgY2FzZSBcImNvbnRleHRcIjpcbiAgICAgICAgICBpZiAoIWN1cnJlbnRIdW5rKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIFwiQmFkIHBhcnNlciBzdGF0ZTogSHVuayBsaW5lcyBlbmNvdW50ZXJlZCBiZWZvcmUgaHVuayBoZWFkZXJcIixcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgY3VycmVudEh1bmtNdXRhdGlvblBhcnQgJiZcbiAgICAgICAgICAgIGN1cnJlbnRIdW5rTXV0YXRpb25QYXJ0LnR5cGUgIT09IGxpbmVUeXBlXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBjdXJyZW50SHVuay5wYXJ0cy5wdXNoKGN1cnJlbnRIdW5rTXV0YXRpb25QYXJ0KVxuICAgICAgICAgICAgY3VycmVudEh1bmtNdXRhdGlvblBhcnQgPSBudWxsXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghY3VycmVudEh1bmtNdXRhdGlvblBhcnQpIHtcbiAgICAgICAgICAgIGN1cnJlbnRIdW5rTXV0YXRpb25QYXJ0ID0ge1xuICAgICAgICAgICAgICB0eXBlOiBsaW5lVHlwZSxcbiAgICAgICAgICAgICAgbGluZXM6IFtdLFxuICAgICAgICAgICAgICBub05ld2xpbmVBdEVuZE9mRmlsZTogZmFsc2UsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGN1cnJlbnRIdW5rTXV0YXRpb25QYXJ0LmxpbmVzLnB1c2gobGluZS5zbGljZSgxKSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIGV4aGF1c2l0dmVuZXNzIGNoZWNrXG4gICAgICAgICAgYXNzZXJ0TmV2ZXIobGluZVR5cGUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29tbWl0RmlsZVBhdGNoKClcblxuICBmb3IgKGNvbnN0IHsgaHVua3MgfSBvZiByZXN1bHQpIHtcbiAgICBpZiAoaHVua3MpIHtcbiAgICAgIGZvciAoY29uc3QgaHVuayBvZiBodW5rcykge1xuICAgICAgICB2ZXJpZnlIdW5rSW50ZWdyaXR5KGh1bmspXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJwcmV0UGFyc2VkUGF0Y2hGaWxlKGZpbGVzOiBGaWxlRGVldHNbXSk6IFBhcnNlZFBhdGNoRmlsZSB7XG4gIGNvbnN0IHJlc3VsdDogUGFyc2VkUGF0Y2hGaWxlID0gW11cblxuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICBjb25zdCB7XG4gICAgICBkaWZmTGluZUZyb21QYXRoLFxuICAgICAgZGlmZkxpbmVUb1BhdGgsXG4gICAgICBvbGRNb2RlLFxuICAgICAgbmV3TW9kZSxcbiAgICAgIGRlbGV0ZWRGaWxlTW9kZSxcbiAgICAgIG5ld0ZpbGVNb2RlLFxuICAgICAgcmVuYW1lRnJvbSxcbiAgICAgIHJlbmFtZVRvLFxuICAgICAgYmVmb3JlSGFzaCxcbiAgICAgIGFmdGVySGFzaCxcbiAgICAgIGZyb21QYXRoLFxuICAgICAgdG9QYXRoLFxuICAgICAgaHVua3MsXG4gICAgfSA9IGZpbGVcbiAgICBjb25zdCB0eXBlOiBQYXRjaEZpbGVQYXJ0W1widHlwZVwiXSA9IHJlbmFtZUZyb21cbiAgICAgID8gXCJyZW5hbWVcIlxuICAgICAgOiBkZWxldGVkRmlsZU1vZGVcbiAgICAgID8gXCJmaWxlIGRlbGV0aW9uXCJcbiAgICAgIDogbmV3RmlsZU1vZGVcbiAgICAgID8gXCJmaWxlIGNyZWF0aW9uXCJcbiAgICAgIDogaHVua3MgJiYgaHVua3MubGVuZ3RoID4gMFxuICAgICAgPyBcInBhdGNoXCJcbiAgICAgIDogXCJtb2RlIGNoYW5nZVwiXG5cbiAgICBsZXQgZGVzdGluYXRpb25GaWxlUGF0aDogc3RyaW5nIHwgbnVsbCA9IG51bGxcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJyZW5hbWVcIjpcbiAgICAgICAgaWYgKCFyZW5hbWVGcm9tIHx8ICFyZW5hbWVUbykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJhZCBwYXJzZXIgc3RhdGU6IHJlbmFtZSBmcm9tICYgdG8gbm90IGdpdmVuXCIpXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwicmVuYW1lXCIsXG4gICAgICAgICAgZnJvbVBhdGg6IHJlbmFtZUZyb20sXG4gICAgICAgICAgdG9QYXRoOiByZW5hbWVUbyxcbiAgICAgICAgfSlcbiAgICAgICAgZGVzdGluYXRpb25GaWxlUGF0aCA9IHJlbmFtZVRvXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFwiZmlsZSBkZWxldGlvblwiOiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBkaWZmTGluZUZyb21QYXRoIHx8IGZyb21QYXRoXG4gICAgICAgIGlmICghcGF0aCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJhZCBwYXJzZSBzdGF0ZTogbm8gcGF0aCBnaXZlbiBmb3IgZmlsZSBkZWxldGlvblwiKVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcImZpbGUgZGVsZXRpb25cIixcbiAgICAgICAgICBodW5rOiAoaHVua3MgJiYgaHVua3NbMF0pIHx8IG51bGwsXG4gICAgICAgICAgcGF0aCxcbiAgICAgICAgICBtb2RlOiBwYXJzZUZpbGVNb2RlKGRlbGV0ZWRGaWxlTW9kZSEpLFxuICAgICAgICAgIGhhc2g6IGJlZm9yZUhhc2gsXG4gICAgICAgIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjYXNlIFwiZmlsZSBjcmVhdGlvblwiOiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBkaWZmTGluZVRvUGF0aCB8fCB0b1BhdGhcbiAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQmFkIHBhcnNlIHN0YXRlOiBubyBwYXRoIGdpdmVuIGZvciBmaWxlIGNyZWF0aW9uXCIpXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZmlsZSBjcmVhdGlvblwiLFxuICAgICAgICAgIGh1bms6IChodW5rcyAmJiBodW5rc1swXSkgfHwgbnVsbCxcbiAgICAgICAgICBwYXRoLFxuICAgICAgICAgIG1vZGU6IHBhcnNlRmlsZU1vZGUobmV3RmlsZU1vZGUhKSxcbiAgICAgICAgICBoYXNoOiBhZnRlckhhc2gsXG4gICAgICAgIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjYXNlIFwicGF0Y2hcIjpcbiAgICAgIGNhc2UgXCJtb2RlIGNoYW5nZVwiOlxuICAgICAgICBkZXN0aW5hdGlvbkZpbGVQYXRoID0gdG9QYXRoIHx8IGRpZmZMaW5lVG9QYXRoXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhc3NlcnROZXZlcih0eXBlKVxuICAgIH1cblxuICAgIGlmIChkZXN0aW5hdGlvbkZpbGVQYXRoICYmIG9sZE1vZGUgJiYgbmV3TW9kZSAmJiBvbGRNb2RlICE9PSBuZXdNb2RlKSB7XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIHR5cGU6IFwibW9kZSBjaGFuZ2VcIixcbiAgICAgICAgcGF0aDogZGVzdGluYXRpb25GaWxlUGF0aCxcbiAgICAgICAgb2xkTW9kZTogcGFyc2VGaWxlTW9kZShvbGRNb2RlKSxcbiAgICAgICAgbmV3TW9kZTogcGFyc2VGaWxlTW9kZShuZXdNb2RlKSxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKGRlc3RpbmF0aW9uRmlsZVBhdGggJiYgaHVua3MgJiYgaHVua3MubGVuZ3RoKSB7XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIHR5cGU6IFwicGF0Y2hcIixcbiAgICAgICAgcGF0aDogZGVzdGluYXRpb25GaWxlUGF0aCxcbiAgICAgICAgaHVua3MsXG4gICAgICAgIGJlZm9yZUhhc2gsXG4gICAgICAgIGFmdGVySGFzaCxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBwYXJzZUZpbGVNb2RlKG1vZGU6IHN0cmluZyk6IEZpbGVNb2RlIHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWJpdHdpc2VcbiAgY29uc3QgcGFyc2VkTW9kZSA9IHBhcnNlSW50KG1vZGUsIDgpICYgMG83NzdcbiAgaWYgKFxuICAgIHBhcnNlZE1vZGUgIT09IE5PTl9FWEVDVVRBQkxFX0ZJTEVfTU9ERSAmJlxuICAgIHBhcnNlZE1vZGUgIT09IEVYRUNVVEFCTEVfRklMRV9NT0RFXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgZmlsZSBtb2RlIHN0cmluZzogXCIgKyBtb2RlKVxuICB9XG4gIHJldHVybiBwYXJzZWRNb2RlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBhdGNoRmlsZShmaWxlOiBzdHJpbmcpOiBQYXJzZWRQYXRjaEZpbGUge1xuICBjb25zdCBsaW5lcyA9IGZpbGUuc3BsaXQoL1xcbi9nKVxuICBpZiAobGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09IFwiXCIpIHtcbiAgICBsaW5lcy5wb3AoKVxuICB9XG4gIHRyeSB7XG4gICAgcmV0dXJuIGludGVycHJldFBhcnNlZFBhdGNoRmlsZShcbiAgICAgIHBhcnNlUGF0Y2hMaW5lcyhsaW5lcywgeyBzdXBwb3J0TGVnYWN5RGlmZnM6IGZhbHNlIH0pLFxuICAgIClcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChcbiAgICAgIGUgaW5zdGFuY2VvZiBFcnJvciAmJlxuICAgICAgZS5tZXNzYWdlID09PSBcImh1bmsgaGVhZGVyIGludGVncml0eSBjaGVjayBmYWlsZWRcIlxuICAgICkge1xuICAgICAgcmV0dXJuIGludGVycHJldFBhcnNlZFBhdGNoRmlsZShcbiAgICAgICAgcGFyc2VQYXRjaExpbmVzKGxpbmVzLCB7IHN1cHBvcnRMZWdhY3lEaWZmczogdHJ1ZSB9KSxcbiAgICAgIClcbiAgICB9XG4gICAgdGhyb3cgZVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlIdW5rSW50ZWdyaXR5KGh1bms6IEh1bmspIHtcbiAgLy8gdmVyaWZ5IGh1bmsgaW50ZWdyaXR5XG4gIGxldCBvcmlnaW5hbExlbmd0aCA9IDBcbiAgbGV0IHBhdGNoZWRMZW5ndGggPSAwXG4gIGZvciAoY29uc3QgeyB0eXBlLCBsaW5lcyB9IG9mIGh1bmsucGFydHMpIHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJjb250ZXh0XCI6XG4gICAgICAgIHBhdGNoZWRMZW5ndGggKz0gbGluZXMubGVuZ3RoXG4gICAgICAgIG9yaWdpbmFsTGVuZ3RoICs9IGxpbmVzLmxlbmd0aFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcImRlbGV0aW9uXCI6XG4gICAgICAgIG9yaWdpbmFsTGVuZ3RoICs9IGxpbmVzLmxlbmd0aFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcImluc2VydGlvblwiOlxuICAgICAgICBwYXRjaGVkTGVuZ3RoICs9IGxpbmVzLmxlbmd0aFxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXJ0TmV2ZXIodHlwZSlcbiAgICB9XG4gIH1cblxuICBpZiAoXG4gICAgb3JpZ2luYWxMZW5ndGggIT09IGh1bmsuaGVhZGVyLm9yaWdpbmFsLmxlbmd0aCB8fFxuICAgIHBhdGNoZWRMZW5ndGggIT09IGh1bmsuaGVhZGVyLnBhdGNoZWQubGVuZ3RoXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcihcImh1bmsgaGVhZGVyIGludGVncml0eSBjaGVjayBmYWlsZWRcIilcbiAgfVxufVxuIl19