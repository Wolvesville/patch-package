"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.relative = exports.resolve = exports.join = void 0;
const slash_1 = __importDefault(require("slash"));
const path_1 = __importDefault(require("path"));
exports.join = (...args) => slash_1.default(path_1.default.join(...args));
var path_2 = require("path");
Object.defineProperty(exports, "dirname", { enumerable: true, get: function () { return path_2.dirname; } });
exports.resolve = (...args) => slash_1.default(path_1.default.resolve(...args));
exports.relative = (...args) => slash_1.default(path_1.default.relative(...args));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUF5QjtBQUN6QixnREFBdUI7QUFFVixRQUFBLElBQUksR0FBcUIsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsZUFBSyxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBRTVFLDZCQUE4QjtBQUFyQiwrRkFBQSxPQUFPLE9BQUE7QUFFSCxRQUFBLE9BQU8sR0FBd0IsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQ3RELGVBQUssQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUVqQixRQUFBLFFBQVEsR0FBeUIsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQ3hELGVBQUssQ0FBQyxjQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzbGFzaCBmcm9tIFwic2xhc2hcIlxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIlxuXG5leHBvcnQgY29uc3Qgam9pbjogdHlwZW9mIHBhdGguam9pbiA9ICguLi5hcmdzKSA9PiBzbGFzaChwYXRoLmpvaW4oLi4uYXJncykpXG5cbmV4cG9ydCB7IGRpcm5hbWUgfSBmcm9tIFwicGF0aFwiXG5cbmV4cG9ydCBjb25zdCByZXNvbHZlOiB0eXBlb2YgcGF0aC5yZXNvbHZlID0gKC4uLmFyZ3MpID0+XG4gIHNsYXNoKHBhdGgucmVzb2x2ZSguLi5hcmdzKSlcblxuZXhwb3J0IGNvbnN0IHJlbGF0aXZlOiB0eXBlb2YgcGF0aC5yZWxhdGl2ZSA9ICguLi5hcmdzKSA9PlxuICBzbGFzaChwYXRoLnJlbGF0aXZlKC4uLmFyZ3MpKVxuIl19