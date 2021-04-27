"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatchFiles = void 0;
const path_1 = require("./path");
const klaw_sync_1 = __importDefault(require("klaw-sync"));
exports.getPatchFiles = (patchesDir) => {
    try {
        return klaw_sync_1.default(patchesDir, { nodir: true })
            .map(({ path }) => path_1.relative(patchesDir, path))
            .filter(path => path.endsWith(".patch"));
    }
    catch (e) {
        return [];
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0Y2hGcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXRjaEZzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGlDQUFpQztBQUNqQywwREFBZ0M7QUFFbkIsUUFBQSxhQUFhLEdBQUcsQ0FBQyxVQUFrQixFQUFFLEVBQUU7SUFDbEQsSUFBSTtRQUNGLE9BQU8sbUJBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUM7YUFDekMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsZUFBUSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7S0FDM0M7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sRUFBRSxDQUFBO0tBQ1Y7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZWxhdGl2ZSB9IGZyb20gXCIuL3BhdGhcIlxuaW1wb3J0IGtsYXdTeW5jIGZyb20gXCJrbGF3LXN5bmNcIlxuXG5leHBvcnQgY29uc3QgZ2V0UGF0Y2hGaWxlcyA9IChwYXRjaGVzRGlyOiBzdHJpbmcpID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4ga2xhd1N5bmMocGF0Y2hlc0RpciwgeyBub2RpcjogdHJ1ZSB9KVxuICAgICAgLm1hcCgoeyBwYXRoIH0pID0+IHJlbGF0aXZlKHBhdGNoZXNEaXIsIHBhdGgpKVxuICAgICAgLmZpbHRlcihwYXRoID0+IHBhdGguZW5kc1dpdGgoXCIucGF0Y2hcIikpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gW11cbiAgfVxufVxuIl19