import express from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { User } from "../db";
import "dotenv";
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

userRouter.post("/signup", async (req: any, res: any) => {
  const userInput = signupSchema.safeParse(req.body);

  if (!userInput.success) {
    return res.status(411).send({
      msg: "Error in inputs",
    });
  }

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
  res.status(200).send("Signed up");
});

userRouter.get("/signin", async (req: any, res: any) => {
  const userInputSignin = req.body;
  const existingUser = await User.findOne({
    username: userInputSignin.data.username,
  });
  if (!existingUser) {
    return res.status(403).send({
      msg: "User not exist in db",
    });
  }

  const isMatch = await bcrypt.compare(
    userInputSignin.password,
    existingUser.password
  );

  const token = jwt.sign(
    { id: existingUser._id, username: existingUser.username },
    process.env.JWT_SECRET!
  );
  res.status(200).send({
    token: token,
  });
});
