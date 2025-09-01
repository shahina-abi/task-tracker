import express from "express";
import { getWeeklyReport, planDay } from "../controllers/AiController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/plan-day", requireAuth, planDay);
router.get("/weekly-report", requireAuth, getWeeklyReport);

export default router;
