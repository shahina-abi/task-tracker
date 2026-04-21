import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        category: {
            type: String,
            enum: ["Study", "Work", "Personal"],
            default: "Work",
        },
        duration: {
            type: Number,
            default: 1,
            min: 0,
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
        deadline: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
        },
        completedAt: {
            type: Date,
            default: null,
        },
        owner: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model("Task", TaskSchema);

export default Task;
