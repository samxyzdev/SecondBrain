"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
exports.userRouter = express_1.default.Router();
const DB = [];
const signupSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(10),
    password: zod_1.z
        .string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/),
});
exports.userRouter.post("/signup", (req, res) => {
    const userInput = signupSchema.safeParse(req.body);
    if (!userInput.success) {
        return res.status(411).send({
            msg: "Error in inputs",
        });
    }
    const checkUserInDb = DB.find((data) => data.username === userInput.data.username);
    if (checkUserInDb) {
        return res.status(403).send({
            msg: "User already exists with this username",
        });
    }
    const serverOperation = DB.push(userInput.data);
    if (!serverOperation) {
        return res.status(500).send({
            msg: "Server error",
        });
    }
    res.status(200).send("Signed up");
});
module.exports = {
    userRouter: exports.userRouter,
};
