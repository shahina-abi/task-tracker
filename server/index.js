import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {connectDB} from "./config/db.js";
import TaskRoutes from "./routes/TaskRoutes.js";
import AiRoutes from "./routes/AiRoutes.js";

const app = express();
dotenv.config();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

console.log("Gemini config loaded:", {
    hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
    openRouterModel:
        process.env.OPENROUTER_MODEL || "google/gemma-3n-e4b-it:free",
});

connectDB();

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({ message: "Task Tracker API is running" });
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/tasks", TaskRoutes);
app.use("/api/ai", AiRoutes);

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
