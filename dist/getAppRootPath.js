"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppRootPath = void 0;
const path_1 = require("./path");
const process_1 = __importDefault(require("process"));
const fs_extra_1 = require("fs-extra");
exports.getAppRootPath = () => {
    let cwd = process_1.default.cwd();
    while (!fs_extra_1.existsSync(path_1.join(cwd, "package.json"))) {
        const up = path_1.resolve(cwd, "../");
        if (up === cwd) {
            throw new Error("no package.json found for this project");
        }
        cwd = up;
    }
    return cwd;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0QXBwUm9vdFBhdGguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZ2V0QXBwUm9vdFBhdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsaUNBQXNDO0FBQ3RDLHNEQUE2QjtBQUM3Qix1Q0FBcUM7QUFFeEIsUUFBQSxjQUFjLEdBQUcsR0FBVyxFQUFFO0lBQ3pDLElBQUksR0FBRyxHQUFHLGlCQUFPLENBQUMsR0FBRyxFQUFFLENBQUE7SUFDdkIsT0FBTyxDQUFDLHFCQUFVLENBQUMsV0FBSSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFFO1FBQzdDLE1BQU0sRUFBRSxHQUFHLGNBQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDOUIsSUFBSSxFQUFFLEtBQUssR0FBRyxFQUFFO1lBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO1NBQzFEO1FBQ0QsR0FBRyxHQUFHLEVBQUUsQ0FBQTtLQUNUO0lBQ0QsT0FBTyxHQUFHLENBQUE7QUFDWixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqb2luLCByZXNvbHZlIH0gZnJvbSBcIi4vcGF0aFwiXG5pbXBvcnQgcHJvY2VzcyBmcm9tIFwicHJvY2Vzc1wiXG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcImZzLWV4dHJhXCJcblxuZXhwb3J0IGNvbnN0IGdldEFwcFJvb3RQYXRoID0gKCk6IHN0cmluZyA9PiB7XG4gIGxldCBjd2QgPSBwcm9jZXNzLmN3ZCgpXG4gIHdoaWxlICghZXhpc3RzU3luYyhqb2luKGN3ZCwgXCJwYWNrYWdlLmpzb25cIikpKSB7XG4gICAgY29uc3QgdXAgPSByZXNvbHZlKGN3ZCwgXCIuLi9cIilcbiAgICBpZiAodXAgPT09IGN3ZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm8gcGFja2FnZS5qc29uIGZvdW5kIGZvciB0aGlzIHByb2plY3RcIilcbiAgICB9XG4gICAgY3dkID0gdXBcbiAgfVxuICByZXR1cm4gY3dkXG59XG4iXX0=