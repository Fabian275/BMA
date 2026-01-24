import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authenticateToken } from "./middleware";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import axios from "axios";
dotenv.config();

const prisma = new PrismaClient();
const apiRouter = Router();

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, "uploads/");
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage });

const DecodedUsers = (token: string) => {
  if (!token) {
    throw new Error("No token provided");
  }
  if (!token.startsWith("Bearer ")) {
    throw new Error("Invalid token format");
  }
  token = token.split(" ")[1];
  const decoded = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string
  ) as {
    user_id: number;
    role_id: number;
    customer_id: number;
  };
  return decoded;
};

apiRouter.get(
  "/transcriptions",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { authorization } = req.headers as { authorization?: string };
    const decoded = DecodedUsers(authorization as string);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const transcriptions = await prisma.transcription_info.findMany({
        where: {
          user_id: decoded.user_id,
        },
      });
      res.json(transcriptions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

apiRouter.post(
  "/transcriptions",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { title, description } = req.body;
    const { authorization } = req.headers as { authorization?: string };
    const decoded = DecodedUsers(authorization as string);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!title) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    try {
      const transcriptionInfo = await prisma.transcription_info.create({
        data: {
          user_id: decoded.user_id,
          title: req.body.title,
          date: new Date(),
          description: req?.body.description || null,
        },
      });
      res.status(201).json(transcriptionInfo);
    } catch (error) {
      console.error(error);
    }
  }
);

apiRouter.get(
  "/transcriptions/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { authorization } = req.headers as { authorization?: string };
    const decoded = DecodedUsers(authorization as string);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!id) {
      res.status(400).json({ message: "ID is required" });
      return;
    }
    try {
      const transcription = await prisma.transcription_info.findUnique({
        where: { id: Number(id) },
        include: {
          transcription: true,
        },
      });
      if (transcription?.user_id !== decoded.user_id) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      if (!transcription) {
        res.status(404).json({ message: "Transcription not found" });
      }
      res.json(transcription);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

apiRouter.patch(
  "/transcriptions/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { authorization } = req.headers as { authorization?: string };
    const { title, description } = req.body;
    const decoded = DecodedUsers(authorization as string);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!id) {
      res.status(400).json({ message: "ID is required" });
      return;
    }
    const transcriptioninfo = await prisma.transcription_info.findUnique({
      where: { id: Number(id) },
    });

    if (transcriptioninfo && transcriptioninfo.user_id !== decoded.user_id) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    try {
      const updatedTranscription = await prisma.transcription_info.update({
        where: { id: Number(id) },
        data: {
          title,
          description,
        },
      });
      res.json(updatedTranscription);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

apiRouter.delete(
  "/transcriptions/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { authorization } = req.headers as { authorization?: string };
    const decoded = DecodedUsers(authorization as string);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!id) {
      res.status(400).json({ message: "ID is required" });
      return;
    }
    try {
      const transcriptioninfo = await prisma.transcription_info.findUnique({
        where: { id: Number(id) },
      });
      if (transcriptioninfo && transcriptioninfo.user_id !== decoded.user_id) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      await prisma.transcription.deleteMany({
        where: { transcription_info_id: Number(id) },
      });
      await prisma.transcription_info.delete({
        where: { id: Number(id) },
      });

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


apiRouter.post(
  "/transcriptions/:id/audio",
  upload.single("file"),
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { authorization } = req.headers as { authorization?: string };
    const decoded = DecodedUsers(authorization as string);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!id) {
      res.status(400).json({ message: "ID is required" });
      return;
    }
    try {
      const transcriptioninfo = await prisma.transcription_info.findUnique({
        where: { id: Number(id) },
      });
      if (transcriptioninfo && transcriptioninfo.user_id !== decoded.user_id) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      if (!transcriptioninfo) {
        res.status(404).json({ message: "Transcription not found" });
        return;
      }
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const formData = new FormData();
      const filePath = req.file.path;
      formData.append("file", fs.createReadStream(filePath));
      formData.append("model", "whisper-1");
      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders(),
          },
        }
      );
      if (
        response.data.text === undefined ||
        response.data.text === null ||
        response.data.text === ""
      ) {
        res.status(422).json({ message: "No text transcribed" });
        return;
      }

      await prisma.transcription.upsert({
        where: { transcription_info_id: Number(id) },
        update: {
          transcribed_text: response.data.text,
          file_path: filePath,
        },
        create: {
          transcription_info_id: Number(id),
          transcribed_text: response.data.text,
          file_path: filePath,
        },
      });
      res.status(201).json(response.data.text);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

apiRouter.patch(
  "/transcriptions/:id/text",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { authorization } = req.headers as { authorization?: string };
    const { text } = req.body;
    const decoded = DecodedUsers(authorization as string);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!id) {
      res.status(400).json({ message: "ID is required" });
      return;
    }
    if (!text) {
      res.status(400).json({ message: "Text is required" });
      return;
    }
    try {
      const transcriptioninfo = await prisma.transcription_info.findUnique({
        where: { id: Number(id) },
      });
      if (transcriptioninfo && transcriptioninfo.user_id !== decoded.user_id) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      if (!transcriptioninfo) {
        res.status(404).json({ message: "Transcription not found" });
        return;
      }
      const transcription = await prisma.transcription.findUnique({
        where: { transcription_info_id: Number(id) },
      });
      if (!transcription) {
        res.status(404).json({ message: "Transcription not found" });
        return;
      }
      await prisma.transcription.update({
        where: { transcription_info_id: Number(id) },
        data: { transcribed_text: text, summary_text: null },
      });
      res.status(200).json({ message: "Transcription updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

apiRouter.get(
  "/transcriptions/:id/audio",
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const { authorization } = req.headers;
    const decoded = DecodedUsers(authorization as string);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!id) {
      res.status(400).json({ message: "ID is required" });
      return;
    }
    try {
      const transcription = await prisma.transcription.findUnique({
        where: { transcription_info_id: Number(id) },
        include: { transcription_info: true },
      });
      if (
        transcription &&
        transcription.transcription_info.user_id !== decoded.user_id
      ) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      if (!transcription) {
        res.status(404).json({ message: "Transcription not found" });
        return;
      }
      const filePath = `/app/${transcription.file_path}`;
      if (!filePath) {
        res.status(404).json({ message: "File not found" });
        return;
      }
      res.setHeader("Content-Disposition", "inline");
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: "Internal server error" });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

apiRouter.delete(
  "/transcriptions/:id/audio",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { authorization } = req.headers as { authorization?: string };
    const decoded = DecodedUsers(authorization as string);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!id) {
      res.status(400).json({ message: "ID is required" });
      return;
    }
    try {
      const transcriptioninfo = await prisma.transcription_info.findUnique({
        where: { id: Number(id) },
      });
      if (transcriptioninfo && transcriptioninfo.user_id !== decoded.user_id) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      if (!transcriptioninfo) {
        res.status(404).json({ message: "Transcription not found" });
        return;
      }
      const transcription = await prisma.transcription.findUnique({
        where: { transcription_info_id: Number(id) },
      });
      if (!transcription) {
        res.status(404).json({ message: "Transcription not found" });
        return;
      }
      console.log(transcription);
      fs.unlink(transcription.file_path, (err) => {
        if (err) {
          console.error(`Error removing file: ${err}`);
          return;
        }
        console.log(
          `File ${transcription.file_path} has been successfully removed.`
        );
      });
      await prisma.transcription.delete({
        where: { transcription_info_id: Number(id) },
      });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

apiRouter.get(
  "/default-language",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { authorization } = req.headers as { authorization?: string };
    const decoded = DecodedUsers(authorization as string);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.user_id },
        include: { language: true },

      });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json({ language: user.language.code });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

apiRouter.post(
  "/transcriptions/:id/summary",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { authorization } = req.headers as { authorization?: string };
    const decoded = DecodedUsers(authorization as string);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    try {
      const transcription = await prisma.transcription.findUnique({
        where: { transcription_info_id: Number(id) },
        include: {
          transcription_info: true,
        },
      });

      if (
        !transcription ||
        !transcription.transcription_info ||
        transcription.transcription_info.user_id !== decoded.user_id
      ) {
        return res.status(403).json({ message: "Forbidden or transcription not found" });
      }

      const textToSummarize = transcription.transcribed_text;

      if (!textToSummarize || textToSummarize.trim().length < 50) {
        return res.status(400).json({
          message: "Transcribed text is too short to summarize (min 50 chars).",
        });
      }

      const prompt = `Fasse den folgenden Text kurz und präzise in der Originalsprache zusammen. Konzentriere dich auf die wichtigsten Aussagen: "${textToSummarize}"`;

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          // max_tokens: 1000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      const summaryText = response.data.choices[0]?.message?.content?.trim();

      if (summaryText) {
        await prisma.transcription.update({
          where: { transcription_info_id: Number(id) },
          data: {
            summary_text: summaryText,
          },
        });

        return res.status(200).json({ summary: summaryText });
      } else {
        return res.status(500).json({ message: "Failed to generate summary from AI." });
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      return res.status(500).json({ message: "Internal server error during summary generation" });
    }
  }
)

export default apiRouter;
