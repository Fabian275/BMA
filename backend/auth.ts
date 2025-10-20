import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

let validRefreshTokens = [] as string[];

const prisma = new PrismaClient();
const authRouter = Router();

interface JwtPayload {
  user_id: number;
  exp?: number;
  iat?: number;
}
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error(
    "ACCESS_TOKEN_SECRET and ACCESS_TOKEN_SECRET must be provided"
  );
}
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

const generateAccessToken = (payload: JwtPayload) => {
  const { iat, exp, ...newPayload } = payload;

  return jwt.sign(newPayload, ACCESS_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "1d" });
};

const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });
    if (!user) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const accessToken = generateAccessToken({
      user_id: user.id,
    });
    const refreshToken = generateRefreshToken({
      user_id: user.id,
    });

    validRefreshTokens.push(refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
    });

    res.json({ accessToken });

    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "ServerError" });
    return;
  }
});

authRouter.post("/refresh", async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ message: "No refresh token" });
    return;
  }

  if (!validRefreshTokens.includes(refreshToken)) {
    res.status(403).json({ message: "Invalid refresh token" });
    return;
  }

  try {
    const payload = verifyToken(refreshToken, REFRESH_SECRET) as JwtPayload;
    const accessToken = generateAccessToken(payload);
    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Unauthorized" });
  }
  return;
});

authRouter.post("/logout", async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ message: "No refresh token" });
    return;
  }

  validRefreshTokens = validRefreshTokens.filter(
    (token) => token !== refreshToken
  );
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
  return;
});

export default authRouter;
