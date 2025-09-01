import Task from "../models/TaskModels.js";

const priorityWeight = {
    High: 3,
    Medium: 2,
    Low: 1,
};

const normalizeTaskPayload = (payload = {}, { applyDefaults = false } = {}) => ({
    title: payload.title?.trim(),
    description:
        payload.description !== undefined
            ? payload.description?.trim() || ""
            : applyDefaults
              ? ""
              : undefined,
    category: payload.category || (applyDefaults ? "Work" : undefined),
    duration:
        payload.duration !== undefined && payload.duration !== ""
            ? Number(payload.duration)
            : applyDefaults
              ? 1
              : undefined,
    priority: payload.priority || (applyDefaults ? "Medium" : undefined),
    deadline: payload.deadline || payload.date,
    status:
        payload.status ||
        (payload.completed === true
            ? "completed"
            : payload.completed === false
              ? "pending"
              : applyDefaults
                ? "pending"
                : undefined),
});

const taskSort = (left, right) => {
    const priorityDifference =
        priorityWeight[right.priority] - priorityWeight[left.priority];

    if (priorityDifference !== 0) {
        return priorityDifference;
    }

    return new Date(left.deadline).getTime() - new Date(right.deadline).getTime();
};

export const getTasksForUser = async (ownerId) => {
    if (!ownerId) {
        throw new Error("Authenticated user is required");
    }

    const tasks = await Task.find({ owner: ownerId }).lean();
    return tasks.sort(taskSort);
};

export const getPendingTasksForUser = async (ownerId) => {
    const tasks = await getTasksForUser(ownerId);
    return tasks.filter((task) => task.status === "pending");
};

export const createTaskForUser = async (ownerId, payload) => {
    if (!ownerId) {
        throw new Error("Authenticated user is required");
    }

    const normalizedTask = normalizeTaskPayload(payload, { applyDefaults: true });

    if (!normalizedTask.title || !normalizedTask.deadline) {
        throw new Error("Title and deadline are required");
    }

    if (Number.isNaN(normalizedTask.duration)) {
        throw new Error("Duration must be a valid number");
    }

    return Task.create({
        ...normalizedTask,
        owner: ownerId,
    });
};

export const updateTaskForUser = async (ownerId, taskId, payload) => {
    if (!ownerId) {
        throw new Error("Authenticated user is required");
    }

    const normalizedTask = normalizeTaskPayload(payload);
    const updatePayload = Object.fromEntries(
        Object.entries(normalizedTask).filter(([, value]) => value !== undefined)
    );

    if (updatePayload.duration !== undefined && Number.isNaN(updatePayload.duration)) {
        throw new Error("Duration must be a valid number");
    }

    const task = await Task.findOneAndUpdate(
        { _id: taskId, owner: ownerId },
        updatePayload,
        { new: true, runValidators: true }
    );

    if (!task) {
        throw new Error("Task not found");
    }

    return task;
};

export const deleteTaskForUser = async (ownerId, taskId) => {
    if (!ownerId) {
        throw new Error("Authenticated user is required");
    }

    const task = await Task.findOneAndDelete({ _id: taskId, owner: ownerId });

    if (!task) {
        throw new Error("Task not found");
    }
};
