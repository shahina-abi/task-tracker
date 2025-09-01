import {
    addTask,
    deleteTask,
    getTasks,
    updateTask,
} from "../controllers/TaskController.js";
import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getTasks);
router.post("/", addTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
