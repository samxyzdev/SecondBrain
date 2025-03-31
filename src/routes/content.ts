import express, { Request, Response } from "express";
import z, { any } from "zod";
import { Content } from "../db";
import { AuthenticatedRequest, authentication } from "../middleware";

export const contentRouter = express.Router();

const contentSchema = z.object({
  type: z.enum(["image", "video", "article", "audio"]),
  link: z.string(),
  title: z.string(),
  tags: z.array(z.string()),
});
contentRouter.post(
  "/content",
  // @ts-ignore
  authentication,
  async (req: AuthenticatedRequest, res: Response) => {
    const userContent = contentSchema.safeParse(req.body);

    if (!userContent.success) {
      return res.status(411).send({
        msg: "Invalid user input",
      });
    }
    try {
      const contentCreate = await Content.create({
        type: userContent.data.type,
        link: userContent.data.link,
        title: userContent.data.title,
        tags: userContent.data.tags,
        userId: req._id,
      });
      if (!contentCreate) {
        return res.status(500).json({
          msg: "Error creating the content",
        });
      }
      return res.status(201).json({
        msg: "Content created successfully",
      });
    } catch (e) {
      return res.status(500).json({
        msg: "Internal Server Error",
      });
    }
  }
);

contentRouter.get(
  "/content",
  // @ts-ignore
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const allContent = await Content.find({});
      if (allContent.length === 0) {
        return res.status(500).json({
          msg: "No content found",
        });
      }
      return res.status(200).send(allContent);
    } catch (e) {
      return res.status(500).json({
        msg: "Internal Server Errror",
      });
    }
  }
);

contentRouter.post(
  "/content/delete",
  // @ts-ignore
  authentication,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const contentId = req.body.contentId;
      if (!contentId) {
        return res.status(400).json({
          msg: "Content ID is required",
        });
      }
      const content = await Content.findById(contentId);
      if (!content) {
        return res.status(403).json({
          msg: "Content not found",
        });
      }
      // Ensure user owns the content before deleting
      if (content.userId.toString() !== req._id) {
        return res.status(403).json({
          msg: "You are not authorized to delete this content",
        });
      }
      const deleteResult = await Content.deleteOne({
        _id: contentId,
      });
      if (deleteResult.deletedCount == 0) {
        return res.status(500).json({
          msg: "Failed to delete content",
        });
      }
      return res.status(200).json({
        msg: "Delete Succeeded",
      });
    } catch (e) {
      return res.status(500).json({
        msg: "Internal Server Error",
      });
    }
  }
);
