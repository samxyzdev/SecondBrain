import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";

export interface AuthenticatedRequest extends Request {
  _id: string;
}

interface UserPayloadJwt extends JwtPayload {
  _id: string;
}

export const authentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        msg: "Authentication token is missing or invalid format",
      });
    }
    const token = authHeader.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET!) as UserPayloadJwt;
    (req as AuthenticatedRequest)._id = verify._id;
    next();
  } catch (e) {
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};
