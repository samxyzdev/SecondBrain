import express from "express";
import z from "zod";

export const contentRouter = express.Router();

const CONTENTDB = [];

const contentSchema = z.object({
  type: z.enum(["image", "video", "article", "audio"]),
  link: z.string(),
  title: z.string(),
  tags: z.array(z.string()),
});
contentRouter.get("/content", (req: any, res: any) => {
  const userContent = contentSchema.safeParse(req.body);

  if (!userContent.success) {
    return res.status(411).send({
      msg: "Invalid user input",
    });
  }
  const insertinDB = CONTENTDB.push(userContent.data);
});
