import { generateDailyPlanForUser } from "../services/aiPlannerService.js";
import { generateWeeklyReportForUser } from "../services/weeklyReportService.js";

export const planDay = async (req, res) => {
    try {
        const plan = await generateDailyPlanForUser(req.user?.id);
        res.status(200).json(plan);
    } catch (error) {
        const status =
            error.message === "No pending tasks found for planning" ? 404 : 500;

        res.status(status).json({
            message: error.message || "Failed to generate daily plan",
        });
    }
};

export const getWeeklyReport = async (req, res) => {
    try {
        const report = await generateWeeklyReportForUser(req.user?.id);
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({
            message: error.message || "Failed to generate weekly report",
        });
    }
};
