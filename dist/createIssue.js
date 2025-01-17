"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openIssueCreationLink = exports.maybePrintIssueCreationPrompt = void 0;
const chalk_1 = __importDefault(require("chalk"));
const open_1 = __importDefault(require("open"));
const querystring_1 = require("querystring");
const path_1 = require("./path");
const repoSpecifier = /^([\w.-]+)\/([\w.-]+)$/;
const githubURL = /github.com(:|\/)([\w.-]+\/[\w.-]+?)(.git|\/.*)?$/;
function parseRepoString(repository) {
    if (repository.startsWith("github:")) {
        repository = repository.replace(/^github:/, "");
    }
    const urlMatch = repository.match(githubURL);
    if (urlMatch) {
        repository = urlMatch[2];
    }
    const specMatch = repository.match(repoSpecifier);
    if (!specMatch) {
        return null;
    }
    const [, org, repo] = specMatch;
    return { org, repo, provider: "GitHub" };
}
function getPackageVCSDetails(packageDetails) {
    const repository = require(path_1.resolve(path_1.join(packageDetails.path, "package.json")))
        .repository;
    if (!repository) {
        return null;
    }
    if (typeof repository === "string") {
        return parseRepoString(repository);
    }
    else if (typeof repository === "object" &&
        typeof repository.url === "string") {
        return parseRepoString(repository.url);
    }
}
function maybePrintIssueCreationPrompt(packageDetails, packageManager) {
    const vcs = getPackageVCSDetails(packageDetails);
    if (vcs) {
        console.log(`💡 ${chalk_1.default.bold(packageDetails.name)} is on ${vcs.provider}! To draft an issue based on your patch run

    ${packageManager === "yarn" ? "yarn" : "npx"} patch-package ${packageDetails.pathSpecifier} --create-issue
`);
    }
}
exports.maybePrintIssueCreationPrompt = maybePrintIssueCreationPrompt;
function openIssueCreationLink({ packageDetails, patchFileContents, packageVersion, }) {
    const vcs = getPackageVCSDetails(packageDetails);
    if (!vcs) {
        console.error(`Error: Couldn't find VCS details for ${packageDetails.pathSpecifier}`);
        process.exit(1);
    }
    // trim off trailing newline since we add an extra one in the markdown block
    if (patchFileContents.endsWith("\n")) {
        patchFileContents = patchFileContents.slice(0, -1);
    }
    open_1.default(`https://github.com/${vcs.org}/${vcs.repo}/issues/new?${querystring_1.stringify({
        title: "",
        body: `Hi! 👋 
      
Firstly, thanks for your work on this project! 🙂

Today I used [patch-package](https://github.com/ds300/patch-package) to patch \`${packageDetails.name}@${packageVersion}\` for the project I'm working on.

<!-- 🔺️🔺️🔺️ PLEASE REPLACE THIS BLOCK with a description of your problem, and any other relevant context 🔺️🔺️🔺️ -->

Here is the diff that solved my problem:

\`\`\`diff
${patchFileContents}
\`\`\`

<em>This issue body was [partially generated by patch-package](https://github.com/ds300/patch-package/issues/296).</em>
`,
    })}`);
}
exports.openIssueCreationLink = openIssueCreationLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlSXNzdWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY3JlYXRlSXNzdWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQXlCO0FBQ3pCLGdEQUF1QjtBQUN2Qiw2Q0FBdUM7QUFHdkMsaUNBQXNDO0FBRXRDLE1BQU0sYUFBYSxHQUFHLHdCQUF3QixDQUFBO0FBQzlDLE1BQU0sU0FBUyxHQUFHLGtEQUFrRCxDQUFBO0FBRXBFLFNBQVMsZUFBZSxDQUN0QixVQUFrQjtJQUVsQixJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDcEMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0tBQ2hEO0lBQ0QsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUM1QyxJQUFJLFFBQVEsRUFBRTtRQUNaLFVBQVUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDekI7SUFFRCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBRWpELElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDZCxPQUFPLElBQUksQ0FBQTtLQUNaO0lBQ0QsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQTtJQUUvQixPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUE7QUFDMUMsQ0FBQztBQUVELFNBQVMsb0JBQW9CLENBQUMsY0FBOEI7SUFDMUQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGNBQU8sQ0FBQyxXQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO1NBQzNFLFVBQWtELENBQUE7SUFFckQsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNmLE9BQU8sSUFBSSxDQUFBO0tBQ1o7SUFDRCxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsRUFBRTtRQUNsQyxPQUFPLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtLQUNuQztTQUFNLElBQ0wsT0FBTyxVQUFVLEtBQUssUUFBUTtRQUM5QixPQUFPLFVBQVUsQ0FBQyxHQUFHLEtBQUssUUFBUSxFQUNsQztRQUNBLE9BQU8sZUFBZSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUN2QztBQUNILENBQUM7QUFFRCxTQUFnQiw2QkFBNkIsQ0FDM0MsY0FBOEIsRUFDOUIsY0FBOEI7SUFFOUIsTUFBTSxHQUFHLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDaEQsSUFBSSxHQUFHLEVBQUU7UUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sZUFBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQy9DLEdBQUcsQ0FBQyxRQUNOOztNQUVFLGNBQWMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxrQkFDMUMsY0FBYyxDQUFDLGFBQ2pCO0NBQ0gsQ0FBQyxDQUFBO0tBQ0M7QUFDSCxDQUFDO0FBZkQsc0VBZUM7QUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxFQUNwQyxjQUFjLEVBQ2QsaUJBQWlCLEVBQ2pCLGNBQWMsR0FLZjtJQUNDLE1BQU0sR0FBRyxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBRWhELElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDUixPQUFPLENBQUMsS0FBSyxDQUNYLHdDQUF3QyxjQUFjLENBQUMsYUFBYSxFQUFFLENBQ3ZFLENBQUE7UUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2hCO0lBRUQsNEVBQTRFO0lBQzVFLElBQUksaUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3BDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNuRDtJQUVELGNBQUksQ0FDRixzQkFBc0IsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxlQUFlLHVCQUFTLENBQUM7UUFDaEUsS0FBSyxFQUFFLEVBQUU7UUFDVCxJQUFJLEVBQUU7Ozs7a0ZBSXNFLGNBQWMsQ0FBQyxJQUFJLElBQUksY0FBYzs7Ozs7OztFQU9ySCxpQkFBaUI7Ozs7Q0FJbEI7S0FDSSxDQUFDLEVBQUUsQ0FDTCxDQUFBO0FBQ0gsQ0FBQztBQTVDRCxzREE0Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2hhbGsgZnJvbSBcImNoYWxrXCJcbmltcG9ydCBvcGVuIGZyb20gXCJvcGVuXCJcbmltcG9ydCB7IHN0cmluZ2lmeSB9IGZyb20gXCJxdWVyeXN0cmluZ1wiXG5pbXBvcnQgeyBQYWNrYWdlTWFuYWdlciB9IGZyb20gXCIuL2RldGVjdFBhY2thZ2VNYW5hZ2VyXCJcbmltcG9ydCB7IFBhY2thZ2VEZXRhaWxzIH0gZnJvbSBcIi4vUGFja2FnZURldGFpbHNcIlxuaW1wb3J0IHsgam9pbiwgcmVzb2x2ZSB9IGZyb20gXCIuL3BhdGhcIlxuXG5jb25zdCByZXBvU3BlY2lmaWVyID0gL14oW1xcdy4tXSspXFwvKFtcXHcuLV0rKSQvXG5jb25zdCBnaXRodWJVUkwgPSAvZ2l0aHViLmNvbSg6fFxcLykoW1xcdy4tXStcXC9bXFx3Li1dKz8pKC5naXR8XFwvLiopPyQvXG5cbmZ1bmN0aW9uIHBhcnNlUmVwb1N0cmluZyhcbiAgcmVwb3NpdG9yeTogc3RyaW5nLFxuKTogbnVsbCB8IHsgcmVwbzogc3RyaW5nOyBvcmc6IHN0cmluZzsgcHJvdmlkZXI6IFwiR2l0SHViXCIgfSB7XG4gIGlmIChyZXBvc2l0b3J5LnN0YXJ0c1dpdGgoXCJnaXRodWI6XCIpKSB7XG4gICAgcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnkucmVwbGFjZSgvXmdpdGh1YjovLCBcIlwiKVxuICB9XG4gIGNvbnN0IHVybE1hdGNoID0gcmVwb3NpdG9yeS5tYXRjaChnaXRodWJVUkwpXG4gIGlmICh1cmxNYXRjaCkge1xuICAgIHJlcG9zaXRvcnkgPSB1cmxNYXRjaFsyXVxuICB9XG5cbiAgY29uc3Qgc3BlY01hdGNoID0gcmVwb3NpdG9yeS5tYXRjaChyZXBvU3BlY2lmaWVyKVxuXG4gIGlmICghc3BlY01hdGNoKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBjb25zdCBbLCBvcmcsIHJlcG9dID0gc3BlY01hdGNoXG5cbiAgcmV0dXJuIHsgb3JnLCByZXBvLCBwcm92aWRlcjogXCJHaXRIdWJcIiB9XG59XG5cbmZ1bmN0aW9uIGdldFBhY2thZ2VWQ1NEZXRhaWxzKHBhY2thZ2VEZXRhaWxzOiBQYWNrYWdlRGV0YWlscykge1xuICBjb25zdCByZXBvc2l0b3J5ID0gcmVxdWlyZShyZXNvbHZlKGpvaW4ocGFja2FnZURldGFpbHMucGF0aCwgXCJwYWNrYWdlLmpzb25cIikpKVxuICAgIC5yZXBvc2l0b3J5IGFzIHVuZGVmaW5lZCB8IHN0cmluZyB8IHsgdXJsOiBzdHJpbmcgfVxuXG4gIGlmICghcmVwb3NpdG9yeSkge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgaWYgKHR5cGVvZiByZXBvc2l0b3J5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIHBhcnNlUmVwb1N0cmluZyhyZXBvc2l0b3J5KVxuICB9IGVsc2UgaWYgKFxuICAgIHR5cGVvZiByZXBvc2l0b3J5ID09PSBcIm9iamVjdFwiICYmXG4gICAgdHlwZW9mIHJlcG9zaXRvcnkudXJsID09PSBcInN0cmluZ1wiXG4gICkge1xuICAgIHJldHVybiBwYXJzZVJlcG9TdHJpbmcocmVwb3NpdG9yeS51cmwpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1heWJlUHJpbnRJc3N1ZUNyZWF0aW9uUHJvbXB0KFxuICBwYWNrYWdlRGV0YWlsczogUGFja2FnZURldGFpbHMsXG4gIHBhY2thZ2VNYW5hZ2VyOiBQYWNrYWdlTWFuYWdlcixcbikge1xuICBjb25zdCB2Y3MgPSBnZXRQYWNrYWdlVkNTRGV0YWlscyhwYWNrYWdlRGV0YWlscylcbiAgaWYgKHZjcykge1xuICAgIGNvbnNvbGUubG9nKGDwn5KhICR7Y2hhbGsuYm9sZChwYWNrYWdlRGV0YWlscy5uYW1lKX0gaXMgb24gJHtcbiAgICAgIHZjcy5wcm92aWRlclxuICAgIH0hIFRvIGRyYWZ0IGFuIGlzc3VlIGJhc2VkIG9uIHlvdXIgcGF0Y2ggcnVuXG5cbiAgICAke3BhY2thZ2VNYW5hZ2VyID09PSBcInlhcm5cIiA/IFwieWFyblwiIDogXCJucHhcIn0gcGF0Y2gtcGFja2FnZSAke1xuICAgICAgcGFja2FnZURldGFpbHMucGF0aFNwZWNpZmllclxuICAgIH0gLS1jcmVhdGUtaXNzdWVcbmApXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5Jc3N1ZUNyZWF0aW9uTGluayh7XG4gIHBhY2thZ2VEZXRhaWxzLFxuICBwYXRjaEZpbGVDb250ZW50cyxcbiAgcGFja2FnZVZlcnNpb24sXG59OiB7XG4gIHBhY2thZ2VEZXRhaWxzOiBQYWNrYWdlRGV0YWlsc1xuICBwYXRjaEZpbGVDb250ZW50czogc3RyaW5nXG4gIHBhY2thZ2VWZXJzaW9uOiBzdHJpbmdcbn0pIHtcbiAgY29uc3QgdmNzID0gZ2V0UGFja2FnZVZDU0RldGFpbHMocGFja2FnZURldGFpbHMpXG5cbiAgaWYgKCF2Y3MpIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgYEVycm9yOiBDb3VsZG4ndCBmaW5kIFZDUyBkZXRhaWxzIGZvciAke3BhY2thZ2VEZXRhaWxzLnBhdGhTcGVjaWZpZXJ9YCxcbiAgICApXG4gICAgcHJvY2Vzcy5leGl0KDEpXG4gIH1cblxuICAvLyB0cmltIG9mZiB0cmFpbGluZyBuZXdsaW5lIHNpbmNlIHdlIGFkZCBhbiBleHRyYSBvbmUgaW4gdGhlIG1hcmtkb3duIGJsb2NrXG4gIGlmIChwYXRjaEZpbGVDb250ZW50cy5lbmRzV2l0aChcIlxcblwiKSkge1xuICAgIHBhdGNoRmlsZUNvbnRlbnRzID0gcGF0Y2hGaWxlQ29udGVudHMuc2xpY2UoMCwgLTEpXG4gIH1cblxuICBvcGVuKFxuICAgIGBodHRwczovL2dpdGh1Yi5jb20vJHt2Y3Mub3JnfS8ke3Zjcy5yZXBvfS9pc3N1ZXMvbmV3PyR7c3RyaW5naWZ5KHtcbiAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgYm9keTogYEhpISDwn5GLIFxuICAgICAgXG5GaXJzdGx5LCB0aGFua3MgZm9yIHlvdXIgd29yayBvbiB0aGlzIHByb2plY3QhIPCfmYJcblxuVG9kYXkgSSB1c2VkIFtwYXRjaC1wYWNrYWdlXShodHRwczovL2dpdGh1Yi5jb20vZHMzMDAvcGF0Y2gtcGFja2FnZSkgdG8gcGF0Y2ggXFxgJHtwYWNrYWdlRGV0YWlscy5uYW1lfUAke3BhY2thZ2VWZXJzaW9ufVxcYCBmb3IgdGhlIHByb2plY3QgSSdtIHdvcmtpbmcgb24uXG5cbjwhLS0g8J+Uuu+4j/CflLrvuI/wn5S677iPIFBMRUFTRSBSRVBMQUNFIFRISVMgQkxPQ0sgd2l0aCBhIGRlc2NyaXB0aW9uIG9mIHlvdXIgcHJvYmxlbSwgYW5kIGFueSBvdGhlciByZWxldmFudCBjb250ZXh0IPCflLrvuI/wn5S677iP8J+Uuu+4jyAtLT5cblxuSGVyZSBpcyB0aGUgZGlmZiB0aGF0IHNvbHZlZCBteSBwcm9ibGVtOlxuXG5cXGBcXGBcXGBkaWZmXG4ke3BhdGNoRmlsZUNvbnRlbnRzfVxuXFxgXFxgXFxgXG5cbjxlbT5UaGlzIGlzc3VlIGJvZHkgd2FzIFtwYXJ0aWFsbHkgZ2VuZXJhdGVkIGJ5IHBhdGNoLXBhY2thZ2VdKGh0dHBzOi8vZ2l0aHViLmNvbS9kczMwMC9wYXRjaC1wYWNrYWdlL2lzc3Vlcy8yOTYpLjwvZW0+XG5gLFxuICAgIH0pfWAsXG4gIClcbn1cbiJdfQ==