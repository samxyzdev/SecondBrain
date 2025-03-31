import express, { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { User } from "../db";
import "dotenv/config";
import bcrypt from "bcrypt";

export const userRouter = express.Router();

const signupSchema = z.object({
  username: z.string().min(3).max(10),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
    ),
});

type signupType = z.infer<typeof signupSchema>;

userRouter.post(
  "/signup",
  async (req: Request, res: Response): Promise<any> => {
    const userInput = signupSchema.safeParse(req.body);
    if (!userInput.success) {
      return res.status(411).send({
        msg: "Error in inputs",
      });
    }
    try {
      const existingUser = await User.findOne({
        username: userInput.data.username,
      });
      if (existingUser) {
        return res.status(403).send({
          msg: "User already exists with this username",
        });
      }
      const hashedPassword = await bcrypt.hash(userInput.data.password, 10);
      const newUser = await User.create({
        username: userInput.data.username,
        password: hashedPassword,
      });
      if (!newUser) {
        return res.status(500).send({
          msg: "Server error",
        });
      }
      return res.status(200).send("Signed up");
    } catch (e) {
      return res.status(500).send({
        msg: "Internal Server Error",
      });
    }
  }
);

const signinSchema = z.object({
  username: z.string(),
  password: z.string(),
});
userRouter.post(
  "/signin",
  async (req: Request, res: Response): Promise<any> => {
    const userInputSignin = signinSchema.safeParse(req.body);
    if (!userInputSignin.success) {
      return res.status(411).send({
        msg: "Error in inputs",
      });
    }
    try {
      const existingUser = await User.findOne({
        username: userInputSignin.data.username,
      });
      if (!existingUser) {
        return res.status(403).send({
          msg: "User not exist in db",
        });
      }
      const isMatch = await bcrypt.compare(
        userInputSignin.data.password,
        existingUser.password
      );
      if (!isMatch) {
        return res.status(401).send({
          msg: "Invalid Password",
        });
      }
      const token = jwt.sign(
        { _id: existingUser._id, username: existingUser.username },
        process.env.JWT_SECRET!
      );
      return res.status(200).send({
        token: token,
      });
    } catch (e) {
      return res.status(500).send({
        msg: "Internal Server Error",
      });
    }
  }
);
