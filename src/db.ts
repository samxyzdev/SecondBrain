import mongoose, { model, Types } from "mongoose";
import { Schema } from "zod";
import "dotenv/config";

(async () => {
  await mongoose.connect(process.env.DATABASE_URL!);
})();
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const tagSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
});

const contentTypes = ["image", "video", "article", "audio"];

const contentSchema = new mongoose.Schema({
  type: { type: String, enum: contentTypes, required: true },
  link: { type: String, ref: "Link", required: true },
  title: { type: String, required: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const linkSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export const User = mongoose.model("User", userSchema);

export const Content = mongoose.model("Content", contentSchema);

export const LinkModel = model("Links", linkSchema);
