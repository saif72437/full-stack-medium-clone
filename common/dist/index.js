"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlogInput = exports.createBlogInput = exports.signinInput = exports.signupInput = void 0;
const zod_1 = __importDefault(require("zod"));
// zod validation
// backend will need this
exports.signupInput = zod_1.default.object({
    username: zod_1.default.string(),
    password: zod_1.default.string().min(6),
    name: zod_1.default.string().optional()
});
// zod validation
// backend will need this
exports.signinInput = zod_1.default.object({
    username: zod_1.default.string(),
    password: zod_1.default.string().min(6)
});
// zod validation
// backend will need this
exports.createBlogInput = zod_1.default.object({
    title: zod_1.default.string(),
    content: zod_1.default.string()
});
// zod validation
// backend will need this
exports.updateBlogInput = zod_1.default.object({
    title: zod_1.default.string(),
    content: zod_1.default.string(),
    id: zod_1.default.number()
});
