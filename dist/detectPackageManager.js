"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectPackageManager = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = require("./path");
const chalk_1 = __importDefault(require("chalk"));
const process_1 = __importDefault(require("process"));
const find_yarn_workspace_root_1 = __importDefault(require("find-yarn-workspace-root"));
function printNoYarnLockfileError() {
    console.error(`
${chalk_1.default.red.bold("**ERROR**")} ${chalk_1.default.red(`The --use-yarn option was specified but there is no yarn.lock file`)}
`);
}
function printNoLockfilesError() {
    console.error(`
${chalk_1.default.red.bold("**ERROR**")} ${chalk_1.default.red(`No package-lock.json, npm-shrinkwrap.json, or yarn.lock file.

You must use either npm@>=5, yarn, or npm-shrinkwrap to manage this project's
dependencies.`)}
`);
}
function printSelectingDefaultMessage() {
    console.info(`${chalk_1.default.bold("patch-package")}: you have both yarn.lock and package-lock.json
Defaulting to using ${chalk_1.default.bold("npm")}
You can override this setting by passing --use-yarn or deleting
package-lock.json if you don't need it
`);
}
exports.detectPackageManager = (appRootPath, overridePackageManager) => {
    const packageLockExists = fs_extra_1.default.existsSync(path_1.join(appRootPath, "package-lock.json"));
    const shrinkWrapExists = fs_extra_1.default.existsSync(path_1.join(appRootPath, "npm-shrinkwrap.json"));
    const yarnLockExists = fs_extra_1.default.existsSync(path_1.join(appRootPath, "yarn.lock"));
    if ((packageLockExists || shrinkWrapExists) && yarnLockExists) {
        if (overridePackageManager) {
            return overridePackageManager;
        }
        else {
            printSelectingDefaultMessage();
            return shrinkWrapExists ? "npm-shrinkwrap" : "npm";
        }
    }
    else if (packageLockExists || shrinkWrapExists) {
        if (overridePackageManager === "yarn") {
            printNoYarnLockfileError();
            process_1.default.exit(1);
        }
        else {
            return shrinkWrapExists ? "npm-shrinkwrap" : "npm";
        }
    }
    else if (yarnLockExists || find_yarn_workspace_root_1.default()) {
        return "yarn";
    }
    else {
        printNoLockfilesError();
        process_1.default.exit(1);
    }
    throw Error();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0ZWN0UGFja2FnZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGV0ZWN0UGFja2FnZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsd0RBQXlCO0FBQ3pCLGlDQUE2QjtBQUM3QixrREFBeUI7QUFDekIsc0RBQTZCO0FBQzdCLHdGQUF3RDtBQUl4RCxTQUFTLHdCQUF3QjtJQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDO0VBQ2QsZUFBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksZUFBSyxDQUFDLEdBQUcsQ0FDdEMsb0VBQW9FLENBQ3JFO0NBQ0YsQ0FBQyxDQUFBO0FBQ0YsQ0FBQztBQUVELFNBQVMscUJBQXFCO0lBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUM7RUFDZCxlQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxlQUFLLENBQUMsR0FBRyxDQUN0Qzs7O2NBR1UsQ0FDWDtDQUNGLENBQUMsQ0FBQTtBQUNGLENBQUM7QUFFRCxTQUFTLDRCQUE0QjtJQUNuQyxPQUFPLENBQUMsSUFBSSxDQUNWLEdBQUcsZUFBSyxDQUFDLElBQUksQ0FDWCxlQUFlLENBQ2hCO3NCQUNpQixlQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQzs7O0NBR3RDLENBQ0UsQ0FBQTtBQUNILENBQUM7QUFFWSxRQUFBLG9CQUFvQixHQUFHLENBQ2xDLFdBQW1CLEVBQ25CLHNCQUE2QyxFQUM3QixFQUFFO0lBQ2xCLE1BQU0saUJBQWlCLEdBQUcsa0JBQUUsQ0FBQyxVQUFVLENBQ3JDLFdBQUksQ0FBQyxXQUFXLEVBQUUsbUJBQW1CLENBQUMsQ0FDdkMsQ0FBQTtJQUNELE1BQU0sZ0JBQWdCLEdBQUcsa0JBQUUsQ0FBQyxVQUFVLENBQ3BDLFdBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLENBQUMsQ0FDekMsQ0FBQTtJQUNELE1BQU0sY0FBYyxHQUFHLGtCQUFFLENBQUMsVUFBVSxDQUFDLFdBQUksQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQTtJQUNwRSxJQUFJLENBQUMsaUJBQWlCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxjQUFjLEVBQUU7UUFDN0QsSUFBSSxzQkFBc0IsRUFBRTtZQUMxQixPQUFPLHNCQUFzQixDQUFBO1NBQzlCO2FBQU07WUFDTCw0QkFBNEIsRUFBRSxDQUFBO1lBQzlCLE9BQU8sZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7U0FDbkQ7S0FDRjtTQUFNLElBQUksaUJBQWlCLElBQUksZ0JBQWdCLEVBQUU7UUFDaEQsSUFBSSxzQkFBc0IsS0FBSyxNQUFNLEVBQUU7WUFDckMsd0JBQXdCLEVBQUUsQ0FBQTtZQUMxQixpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUNoQjthQUFNO1lBQ0wsT0FBTyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQTtTQUNuRDtLQUNGO1NBQU0sSUFBSSxjQUFjLElBQUksa0NBQWlCLEVBQUUsRUFBRTtRQUNoRCxPQUFPLE1BQU0sQ0FBQTtLQUNkO1NBQU07UUFDTCxxQkFBcUIsRUFBRSxDQUFBO1FBQ3ZCLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2hCO0lBQ0QsTUFBTSxLQUFLLEVBQUUsQ0FBQTtBQUNmLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tIFwiZnMtZXh0cmFcIlxuaW1wb3J0IHsgam9pbiB9IGZyb20gXCIuL3BhdGhcIlxuaW1wb3J0IGNoYWxrIGZyb20gXCJjaGFsa1wiXG5pbXBvcnQgcHJvY2VzcyBmcm9tIFwicHJvY2Vzc1wiXG5pbXBvcnQgZmluZFdvcmtzcGFjZVJvb3QgZnJvbSBcImZpbmQteWFybi13b3Jrc3BhY2Utcm9vdFwiXG5cbmV4cG9ydCB0eXBlIFBhY2thZ2VNYW5hZ2VyID0gXCJ5YXJuXCIgfCBcIm5wbVwiIHwgXCJucG0tc2hyaW5rd3JhcFwiXG5cbmZ1bmN0aW9uIHByaW50Tm9ZYXJuTG9ja2ZpbGVFcnJvcigpIHtcbiAgY29uc29sZS5lcnJvcihgXG4ke2NoYWxrLnJlZC5ib2xkKFwiKipFUlJPUioqXCIpfSAke2NoYWxrLnJlZChcbiAgICBgVGhlIC0tdXNlLXlhcm4gb3B0aW9uIHdhcyBzcGVjaWZpZWQgYnV0IHRoZXJlIGlzIG5vIHlhcm4ubG9jayBmaWxlYCxcbiAgKX1cbmApXG59XG5cbmZ1bmN0aW9uIHByaW50Tm9Mb2NrZmlsZXNFcnJvcigpIHtcbiAgY29uc29sZS5lcnJvcihgXG4ke2NoYWxrLnJlZC5ib2xkKFwiKipFUlJPUioqXCIpfSAke2NoYWxrLnJlZChcbiAgICBgTm8gcGFja2FnZS1sb2NrLmpzb24sIG5wbS1zaHJpbmt3cmFwLmpzb24sIG9yIHlhcm4ubG9jayBmaWxlLlxuXG5Zb3UgbXVzdCB1c2UgZWl0aGVyIG5wbUA+PTUsIHlhcm4sIG9yIG5wbS1zaHJpbmt3cmFwIHRvIG1hbmFnZSB0aGlzIHByb2plY3Qnc1xuZGVwZW5kZW5jaWVzLmAsXG4gICl9XG5gKVxufVxuXG5mdW5jdGlvbiBwcmludFNlbGVjdGluZ0RlZmF1bHRNZXNzYWdlKCkge1xuICBjb25zb2xlLmluZm8oXG4gICAgYCR7Y2hhbGsuYm9sZChcbiAgICAgIFwicGF0Y2gtcGFja2FnZVwiLFxuICAgICl9OiB5b3UgaGF2ZSBib3RoIHlhcm4ubG9jayBhbmQgcGFja2FnZS1sb2NrLmpzb25cbkRlZmF1bHRpbmcgdG8gdXNpbmcgJHtjaGFsay5ib2xkKFwibnBtXCIpfVxuWW91IGNhbiBvdmVycmlkZSB0aGlzIHNldHRpbmcgYnkgcGFzc2luZyAtLXVzZS15YXJuIG9yIGRlbGV0aW5nXG5wYWNrYWdlLWxvY2suanNvbiBpZiB5b3UgZG9uJ3QgbmVlZCBpdFxuYCxcbiAgKVxufVxuXG5leHBvcnQgY29uc3QgZGV0ZWN0UGFja2FnZU1hbmFnZXIgPSAoXG4gIGFwcFJvb3RQYXRoOiBzdHJpbmcsXG4gIG92ZXJyaWRlUGFja2FnZU1hbmFnZXI6IFBhY2thZ2VNYW5hZ2VyIHwgbnVsbCxcbik6IFBhY2thZ2VNYW5hZ2VyID0+IHtcbiAgY29uc3QgcGFja2FnZUxvY2tFeGlzdHMgPSBmcy5leGlzdHNTeW5jKFxuICAgIGpvaW4oYXBwUm9vdFBhdGgsIFwicGFja2FnZS1sb2NrLmpzb25cIiksXG4gIClcbiAgY29uc3Qgc2hyaW5rV3JhcEV4aXN0cyA9IGZzLmV4aXN0c1N5bmMoXG4gICAgam9pbihhcHBSb290UGF0aCwgXCJucG0tc2hyaW5rd3JhcC5qc29uXCIpLFxuICApXG4gIGNvbnN0IHlhcm5Mb2NrRXhpc3RzID0gZnMuZXhpc3RzU3luYyhqb2luKGFwcFJvb3RQYXRoLCBcInlhcm4ubG9ja1wiKSlcbiAgaWYgKChwYWNrYWdlTG9ja0V4aXN0cyB8fCBzaHJpbmtXcmFwRXhpc3RzKSAmJiB5YXJuTG9ja0V4aXN0cykge1xuICAgIGlmIChvdmVycmlkZVBhY2thZ2VNYW5hZ2VyKSB7XG4gICAgICByZXR1cm4gb3ZlcnJpZGVQYWNrYWdlTWFuYWdlclxuICAgIH0gZWxzZSB7XG4gICAgICBwcmludFNlbGVjdGluZ0RlZmF1bHRNZXNzYWdlKClcbiAgICAgIHJldHVybiBzaHJpbmtXcmFwRXhpc3RzID8gXCJucG0tc2hyaW5rd3JhcFwiIDogXCJucG1cIlxuICAgIH1cbiAgfSBlbHNlIGlmIChwYWNrYWdlTG9ja0V4aXN0cyB8fCBzaHJpbmtXcmFwRXhpc3RzKSB7XG4gICAgaWYgKG92ZXJyaWRlUGFja2FnZU1hbmFnZXIgPT09IFwieWFyblwiKSB7XG4gICAgICBwcmludE5vWWFybkxvY2tmaWxlRXJyb3IoKVxuICAgICAgcHJvY2Vzcy5leGl0KDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzaHJpbmtXcmFwRXhpc3RzID8gXCJucG0tc2hyaW5rd3JhcFwiIDogXCJucG1cIlxuICAgIH1cbiAgfSBlbHNlIGlmICh5YXJuTG9ja0V4aXN0cyB8fCBmaW5kV29ya3NwYWNlUm9vdCgpKSB7XG4gICAgcmV0dXJuIFwieWFyblwiXG4gIH0gZWxzZSB7XG4gICAgcHJpbnROb0xvY2tmaWxlc0Vycm9yKClcbiAgICBwcm9jZXNzLmV4aXQoMSlcbiAgfVxuICB0aHJvdyBFcnJvcigpXG59XG4iXX0=