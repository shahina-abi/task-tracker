import {
    createTaskForUser,
    deleteTaskForUser,
    getTasksForUser,
    updateTaskForUser,
} from "../services/taskService.js";

const getOwnerId = (req) => req.user?.id;

export const addTask = async (req, res) => {
    try {
        const task = await createTaskForUser(getOwnerId(req), req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getTasks = async (req, res) => {
    try {
        const tasks = await getTasksForUser(getOwnerId(req));
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const task = await updateTaskForUser(getOwnerId(req), req.params.id, req.body);
        res.status(200).json(task);
    } catch (error) {
        const status = error.message === "Task not found" ? 404 : 400;
        res.status(status).json({ message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        await deleteTaskForUser(getOwnerId(req), req.params.id);
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        const status = error.message === "Task not found" ? 404 : 400;
        res.status(status).json({ message: error.message });
    }
};
