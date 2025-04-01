import express from "express";
import { userRouter } from "./routes/user";
import { contentRouter } from "./routes/content";

const app = express();
app.use(express.json());
app.use("/api/v1/user", userRouter);
app.use("/api/v1/brain", contentRouter);

app.listen(3000);
