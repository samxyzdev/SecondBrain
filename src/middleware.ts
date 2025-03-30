import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";

interface UserPayload extends JwtPayload {
  _id: string;
}

export const authentication = (req: any, res: any, next: any) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({
      msg: "Authentication token is missing",
    });
  }
  const verify = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
  if (!verify) {
    return res.status(411).send({
      msg: "User not authenticated",
    });
  }
  req.id = verify._id;
  next();
};
