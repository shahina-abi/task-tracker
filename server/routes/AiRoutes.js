import express from "express";
import { getReminders, getWeeklyReport, planDay } from "../controllers/AiController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/plan-day", requireAuth, planDay);
router.get("/weekly-report", requireAuth, getWeeklyReport);
router.get("/reminders", requireAuth, getReminders);

export default router;
