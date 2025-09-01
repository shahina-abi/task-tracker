import { getPendingTasksForUser } from "./taskService.js";

const OPENROUTER_MODEL =
    process.env.OPENROUTER_MODEL || "google/gemma-3n-e4b-it:free";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const priorityWeight = {
    High: 3,
    Medium: 2,
    Low: 1,
};

const ensurePlanShape = (plan) => ({
    morning: Array.isArray(plan?.morning) ? plan.morning : [],
    afternoon: Array.isArray(plan?.afternoon) ? plan.afternoon : [],
    evening: Array.isArray(plan?.evening) ? plan.evening : [],
});

const sortTasksForPlanning = (tasks) =>
    [...tasks].sort((left, right) => {
        const priorityDifference =
            priorityWeight[right.priority] - priorityWeight[left.priority];

        if (priorityDifference !== 0) {
            return priorityDifference;
        }

        return new Date(left.deadline).getTime() - new Date(right.deadline).getTime();
    });

const extractJsonObject = (text = "") => {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1 || end < start) {
        throw new Error("OpenRouter response did not contain valid JSON");
    }

    return JSON.parse(text.slice(start, end + 1));
};

const buildPrompt = (tasks) => `You are an expert productivity planner.
Create a practical daily plan using ONLY the tasks provided.

Rules:
- Return STRICT JSON only.
- Use this exact shape: {"morning":[],"afternoon":[],"evening":[]}
- Each item must be: {"title":"","time":"","reason":""}
- Keep every original task title unchanged.
- Put higher priority and earlier deadline tasks earlier in the day when reasonable.
- Distribute tasks sensibly across morning, afternoon, and evening.
- Do not include markdown, explanations, or extra keys.

Tasks:
${JSON.stringify(tasks, null, 2)}`;

const dailyPlanSchema = {
    type: "object",
    properties: {
        morning: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    time: { type: "string" },
                    reason: { type: "string" },
                },
                required: ["title", "time", "reason"],
                additionalProperties: false,
            },
        },
        afternoon: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    time: { type: "string" },
                    reason: { type: "string" },
                },
                required: ["title", "time", "reason"],
                additionalProperties: false,
            },
        },
        evening: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    time: { type: "string" },
                    reason: { type: "string" },
                },
                required: ["title", "time", "reason"],
                additionalProperties: false,
            },
        },
    },
    required: ["morning", "afternoon", "evening"],
    additionalProperties: false,
};

const callOpenRouterPlanner = async (tasks) => {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Task Tracker",
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    {
                        role: "user",
                        content: `${buildPrompt(tasks)}\n\nReturn only valid JSON matching the schema.`,
                    },
                ],
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "daily_plan",
                        strict: true,
                        schema: dailyPlanSchema,
                    },
                },
                plugins: [{ id: "response-healing" }],
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter request failed: ${errorText}`);
    }

    const data = await response.json();
    const outputText = data.choices?.[0]?.message?.content || "";

    return ensurePlanShape(extractJsonObject(outputText));
};

export const generateDailyPlanForUser = async (ownerId) => {
    const pendingTasks = await getPendingTasksForUser(ownerId);

    if (!pendingTasks.length) {
        throw new Error("No pending tasks found for planning");
    }

    const tasksForPrompt = sortTasksForPlanning(pendingTasks).map((task) => ({
        title: task.title,
        priority: task.priority,
        deadline: task.deadline,
        status: task.status,
    }));

    return callOpenRouterPlanner(tasksForPrompt);
};
