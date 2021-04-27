"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reversePatch = void 0;
const parse_1 = require("./parse");
const assertNever_1 = require("../assertNever");
function reverseHunk(hunk) {
    const header = {
        original: hunk.header.patched,
        patched: hunk.header.original,
    };
    const parts = [];
    for (const part of hunk.parts) {
        switch (part.type) {
            case "context":
                parts.push(part);
                break;
            case "deletion":
                parts.push({
                    type: "insertion",
                    lines: part.lines,
                    noNewlineAtEndOfFile: part.noNewlineAtEndOfFile,
                });
                break;
            case "insertion":
                parts.push({
                    type: "deletion",
                    lines: part.lines,
                    noNewlineAtEndOfFile: part.noNewlineAtEndOfFile,
                });
                break;
            default:
                assertNever_1.assertNever(part.type);
        }
    }
    // swap insertions and deletions over so deletions always come first
    for (let i = 0; i < parts.length - 1; i++) {
        if (parts[i].type === "insertion" && parts[i + 1].type === "deletion") {
            const tmp = parts[i];
            parts[i] = parts[i + 1];
            parts[i + 1] = tmp;
            i += 1;
        }
    }
    const result = {
        header,
        parts,
    };
    parse_1.verifyHunkIntegrity(result);
    return result;
}
function reversePatchPart(part) {
    switch (part.type) {
        case "file creation":
            return {
                type: "file deletion",
                path: part.path,
                hash: part.hash,
                hunk: part.hunk && reverseHunk(part.hunk),
                mode: part.mode,
            };
        case "file deletion":
            return {
                type: "file creation",
                path: part.path,
                hunk: part.hunk && reverseHunk(part.hunk),
                mode: part.mode,
                hash: part.hash,
            };
        case "rename":
            return {
                type: "rename",
                fromPath: part.toPath,
                toPath: part.fromPath,
            };
        case "patch":
            return {
                type: "patch",
                path: part.path,
                hunks: part.hunks.map(reverseHunk),
                beforeHash: part.afterHash,
                afterHash: part.beforeHash,
            };
        case "mode change":
            return {
                type: "mode change",
                path: part.path,
                newMode: part.oldMode,
                oldMode: part.newMode,
            };
    }
}
exports.reversePatch = (patch) => {
    return patch.map(reversePatchPart).reverse();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV2ZXJzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRjaC9yZXZlcnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQU1nQjtBQUNoQixnREFBNEM7QUFFNUMsU0FBUyxXQUFXLENBQUMsSUFBVTtJQUM3QixNQUFNLE1BQU0sR0FBZTtRQUN6QixRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPO1FBQzdCLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7S0FDOUIsQ0FBQTtJQUNELE1BQU0sS0FBSyxHQUFrQixFQUFFLENBQUE7SUFFL0IsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQzdCLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNqQixLQUFLLFNBQVM7Z0JBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDaEIsTUFBSztZQUNQLEtBQUssVUFBVTtnQkFDYixLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNULElBQUksRUFBRSxXQUFXO29CQUNqQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7b0JBQ2pCLG9CQUFvQixFQUFFLElBQUksQ0FBQyxvQkFBb0I7aUJBQ2hELENBQUMsQ0FBQTtnQkFDRixNQUFLO1lBQ1AsS0FBSyxXQUFXO2dCQUNkLEtBQUssQ0FBQyxJQUFJLENBQUM7b0JBQ1QsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztvQkFDakIsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLG9CQUFvQjtpQkFDaEQsQ0FBQyxDQUFBO2dCQUNGLE1BQUs7WUFDUDtnQkFDRSx5QkFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUN6QjtLQUNGO0lBRUQsb0VBQW9FO0lBQ3BFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN6QyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtZQUNyRSxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDcEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDdkIsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDbEIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUNQO0tBQ0Y7SUFFRCxNQUFNLE1BQU0sR0FBUztRQUNuQixNQUFNO1FBQ04sS0FBSztLQUNOLENBQUE7SUFFRCwyQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUUzQixPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLElBQW1CO0lBQzNDLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNqQixLQUFLLGVBQWU7WUFDbEIsT0FBTztnQkFDTCxJQUFJLEVBQUUsZUFBZTtnQkFDckIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDekMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2FBQ2hCLENBQUE7UUFDSCxLQUFLLGVBQWU7WUFDbEIsT0FBTztnQkFDTCxJQUFJLEVBQUUsZUFBZTtnQkFDckIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUN6QyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2FBQ2hCLENBQUE7UUFDSCxLQUFLLFFBQVE7WUFDWCxPQUFPO2dCQUNMLElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRO2FBQ3RCLENBQUE7UUFDSCxLQUFLLE9BQU87WUFDVixPQUFPO2dCQUNMLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO2dCQUNsQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQzFCLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTthQUMzQixDQUFBO1FBQ0gsS0FBSyxhQUFhO1lBQ2hCLE9BQU87Z0JBQ0wsSUFBSSxFQUFFLGFBQWE7Z0JBQ25CLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87Z0JBQ3JCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTzthQUN0QixDQUFBO0tBQ0o7QUFDSCxDQUFDO0FBRVksUUFBQSxZQUFZLEdBQUcsQ0FBQyxLQUFzQixFQUFtQixFQUFFO0lBQ3RFLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzlDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFBhcnNlZFBhdGNoRmlsZSxcbiAgUGF0Y2hGaWxlUGFydCxcbiAgSHVuayxcbiAgSHVua0hlYWRlcixcbiAgdmVyaWZ5SHVua0ludGVncml0eSxcbn0gZnJvbSBcIi4vcGFyc2VcIlxuaW1wb3J0IHsgYXNzZXJ0TmV2ZXIgfSBmcm9tIFwiLi4vYXNzZXJ0TmV2ZXJcIlxuXG5mdW5jdGlvbiByZXZlcnNlSHVuayhodW5rOiBIdW5rKTogSHVuayB7XG4gIGNvbnN0IGhlYWRlcjogSHVua0hlYWRlciA9IHtcbiAgICBvcmlnaW5hbDogaHVuay5oZWFkZXIucGF0Y2hlZCxcbiAgICBwYXRjaGVkOiBodW5rLmhlYWRlci5vcmlnaW5hbCxcbiAgfVxuICBjb25zdCBwYXJ0czogSHVua1tcInBhcnRzXCJdID0gW11cblxuICBmb3IgKGNvbnN0IHBhcnQgb2YgaHVuay5wYXJ0cykge1xuICAgIHN3aXRjaCAocGFydC50eXBlKSB7XG4gICAgICBjYXNlIFwiY29udGV4dFwiOlxuICAgICAgICBwYXJ0cy5wdXNoKHBhcnQpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFwiZGVsZXRpb25cIjpcbiAgICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJpbnNlcnRpb25cIixcbiAgICAgICAgICBsaW5lczogcGFydC5saW5lcyxcbiAgICAgICAgICBub05ld2xpbmVBdEVuZE9mRmlsZTogcGFydC5ub05ld2xpbmVBdEVuZE9mRmlsZSxcbiAgICAgICAgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJpbnNlcnRpb25cIjpcbiAgICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJkZWxldGlvblwiLFxuICAgICAgICAgIGxpbmVzOiBwYXJ0LmxpbmVzLFxuICAgICAgICAgIG5vTmV3bGluZUF0RW5kT2ZGaWxlOiBwYXJ0Lm5vTmV3bGluZUF0RW5kT2ZGaWxlLFxuICAgICAgICB9KVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXJ0TmV2ZXIocGFydC50eXBlKVxuICAgIH1cbiAgfVxuXG4gIC8vIHN3YXAgaW5zZXJ0aW9ucyBhbmQgZGVsZXRpb25zIG92ZXIgc28gZGVsZXRpb25zIGFsd2F5cyBjb21lIGZpcnN0XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgaWYgKHBhcnRzW2ldLnR5cGUgPT09IFwiaW5zZXJ0aW9uXCIgJiYgcGFydHNbaSArIDFdLnR5cGUgPT09IFwiZGVsZXRpb25cIikge1xuICAgICAgY29uc3QgdG1wID0gcGFydHNbaV1cbiAgICAgIHBhcnRzW2ldID0gcGFydHNbaSArIDFdXG4gICAgICBwYXJ0c1tpICsgMV0gPSB0bXBcbiAgICAgIGkgKz0gMVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3VsdDogSHVuayA9IHtcbiAgICBoZWFkZXIsXG4gICAgcGFydHMsXG4gIH1cblxuICB2ZXJpZnlIdW5rSW50ZWdyaXR5KHJlc3VsdClcblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIHJldmVyc2VQYXRjaFBhcnQocGFydDogUGF0Y2hGaWxlUGFydCk6IFBhdGNoRmlsZVBhcnQge1xuICBzd2l0Y2ggKHBhcnQudHlwZSkge1xuICAgIGNhc2UgXCJmaWxlIGNyZWF0aW9uXCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcImZpbGUgZGVsZXRpb25cIixcbiAgICAgICAgcGF0aDogcGFydC5wYXRoLFxuICAgICAgICBoYXNoOiBwYXJ0Lmhhc2gsXG4gICAgICAgIGh1bms6IHBhcnQuaHVuayAmJiByZXZlcnNlSHVuayhwYXJ0Lmh1bmspLFxuICAgICAgICBtb2RlOiBwYXJ0Lm1vZGUsXG4gICAgICB9XG4gICAgY2FzZSBcImZpbGUgZGVsZXRpb25cIjpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiZmlsZSBjcmVhdGlvblwiLFxuICAgICAgICBwYXRoOiBwYXJ0LnBhdGgsXG4gICAgICAgIGh1bms6IHBhcnQuaHVuayAmJiByZXZlcnNlSHVuayhwYXJ0Lmh1bmspLFxuICAgICAgICBtb2RlOiBwYXJ0Lm1vZGUsXG4gICAgICAgIGhhc2g6IHBhcnQuaGFzaCxcbiAgICAgIH1cbiAgICBjYXNlIFwicmVuYW1lXCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcInJlbmFtZVwiLFxuICAgICAgICBmcm9tUGF0aDogcGFydC50b1BhdGgsXG4gICAgICAgIHRvUGF0aDogcGFydC5mcm9tUGF0aCxcbiAgICAgIH1cbiAgICBjYXNlIFwicGF0Y2hcIjpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwicGF0Y2hcIixcbiAgICAgICAgcGF0aDogcGFydC5wYXRoLFxuICAgICAgICBodW5rczogcGFydC5odW5rcy5tYXAocmV2ZXJzZUh1bmspLFxuICAgICAgICBiZWZvcmVIYXNoOiBwYXJ0LmFmdGVySGFzaCxcbiAgICAgICAgYWZ0ZXJIYXNoOiBwYXJ0LmJlZm9yZUhhc2gsXG4gICAgICB9XG4gICAgY2FzZSBcIm1vZGUgY2hhbmdlXCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcIm1vZGUgY2hhbmdlXCIsXG4gICAgICAgIHBhdGg6IHBhcnQucGF0aCxcbiAgICAgICAgbmV3TW9kZTogcGFydC5vbGRNb2RlLFxuICAgICAgICBvbGRNb2RlOiBwYXJ0Lm5ld01vZGUsXG4gICAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHJldmVyc2VQYXRjaCA9IChwYXRjaDogUGFyc2VkUGF0Y2hGaWxlKTogUGFyc2VkUGF0Y2hGaWxlID0+IHtcbiAgcmV0dXJuIHBhdGNoLm1hcChyZXZlcnNlUGF0Y2hQYXJ0KS5yZXZlcnNlKClcbn1cbiJdfQ==