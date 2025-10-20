import express from "express";
import authRouter from "./auth";
import apiRouter from "./api";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use("/auth", authRouter);
app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.send("");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
