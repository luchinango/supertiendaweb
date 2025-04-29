import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET!,
  expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  issuer: process.env.JWT_ISSUER || "your-app-name",
};

if (!JWT_CONFIG.secret) {
  throw new Error("JWT_SECRET must be defined in environment variables");
}

export const generateToken = (userId: number): string => {
    return "";
  /*
    return jwt.sign({ userId }, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
    issuer: JWT_CONFIG.issuer,
  });
  */
};
