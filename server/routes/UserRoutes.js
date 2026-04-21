import express from "express";
import {
    getReminderSettings,
    loginUser,
    registerUser,
    sendTestReminderEmail,
    updateReminderSettings,
} from "../controllers/UserController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/reminder-settings", requireAuth, getReminderSettings);
router.put("/reminder-settings", requireAuth, updateReminderSettings);
router.post("/reminder-settings/test-email", requireAuth, sendTestReminderEmail);

export default router;
