import express from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";

export const userRouter = express.Router();

const DB: any = [];

const signupSchema = z.object({
  username: z.string().min(3).max(10),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
    ),
});

type signupType = z.infer<typeof signupSchema>;

userRouter.post("/signup", (req: any, res: any) => {
  const userInput = signupSchema.safeParse(req.body);

  if (!userInput.success) {
    return res.status(411).send({
      msg: "Error in inputs",
    });
  }

  const checkUserInDb = DB.find(
    (data: any) => data.username === userInput.data.username
  );
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

userRouter.get("/signin", (req: any, res: any) => {
  const userInputSignin = req.body;
  const checkUserinDb = DB.find(
    (data: any) => data.usernmae === userInputSignin.username
  );
  if (!checkUserinDb) {
    return res.status(403).send({
      msg: "User not exist in db",
    });
  }
  const token = jwt.sign(userInputSignin, "SameerAhmed");
  res.status(200).send({
    token: token,
  });
});

module.exports = {
  userRouter,
};
