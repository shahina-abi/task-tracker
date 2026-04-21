import { getPendingTasksForUser } from "./taskService.js";

const OPENROUTER_MODEL =
    process.env.OPENROUTER_MODEL || "google/gemma-3n-e4b-it:free";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const priorityWeight = {
    High: 3,
    Medium: 2,
    Low: 1,
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const ensureReminderShape = (payload) =>
    Array.isArray(payload?.reminders) ? payload.reminders : [];

const extractJsonObject = (text = "") => {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1 || end < start) {
        throw new Error("OpenRouter response did not contain valid JSON");
    }

    return JSON.parse(text.slice(start, end + 1));
};

const getUrgencyMeta = (deadline) => {
    const now = new Date();
    const dueDate = new Date(deadline);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / DAY_IN_MS);

    if (diffDays < 0) {
        return {
            score: 100 + Math.abs(diffDays),
            urgency: "overdue",
            dueLabel: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`,
        };
    }

    if (diffDays === 0) {
        return {
            score: 85,
            urgency: "today",
            dueLabel: "Due today",
        };
    }

    if (diffDays === 1) {
        return {
            score: 70,
            urgency: "tomorrow",
            dueLabel: "Due tomorrow",
        };
    }

    return {
        score: Math.max(10, 50 - diffDays),
        urgency: "upcoming",
        dueLabel: `Due in ${diffDays} days`,
    };
};

const rankTasksForReminders = (tasks) =>
    tasks
        .map((task) => {
            const urgencyMeta = getUrgencyMeta(task.deadline);

            return {
                ...task,
                urgency: urgencyMeta.urgency,
                dueLabel: urgencyMeta.dueLabel,
                urgencyScore:
                    urgencyMeta.score +
                    priorityWeight[task.priority] * 10 +
                    (Number(task.duration) || 0),
            };
        })
        .sort((left, right) => right.urgencyScore - left.urgencyScore);

const buildFallbackReminder = (task) => {
    const category = task.category || "Work";

    if (task.urgency === "overdue") {
        return `Your ${category} task "${task.title}" is overdue. Finishing it first will clear your backlog and reduce deadline pressure.`;
    }

    if (task.urgency === "today") {
        return `Your ${category} task "${task.title}" is due today. Completing it early will keep your day on track and protect your productivity.`;
    }

    if (task.urgency === "tomorrow") {
        return `Your ${category} task "${task.title}" is due tomorrow. A short session today will make the deadline much easier to hit.`;
    }

    return `Your ${category} task "${task.title}" is coming up soon. Starting now will make the rest of your week feel lighter.`;
};

const buildPrompt = (tasks) => `You are a productivity coach writing concise, encouraging reminders.

Rules:
- Return STRICT JSON only.
- Use this exact shape: {"reminders":[{"title":"","message":"","urgency":"","dueLabel":"","category":""}]}
- Keep each original task title unchanged.
- urgency must be one of: overdue, today, tomorrow, upcoming.
- message should be 1 to 2 sentences and action-oriented.
- Do not include markdown or extra keys.

Tasks:
${JSON.stringify(
    tasks.map((task) => ({
        title: task.title,
        category: task.category,
        priority: task.priority,
        deadline: task.deadline,
        urgency: task.urgency,
        dueLabel: task.dueLabel,
        duration: task.duration,
    })),
    null,
    2
)}`;

const reminderSchema = {
    type: "object",
    properties: {
        reminders: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    message: { type: "string" },
                    urgency: { type: "string" },
                    dueLabel: { type: "string" },
                    category: { type: "string" },
                },
                required: ["title", "message", "urgency", "dueLabel", "category"],
                additionalProperties: false,
            },
        },
    },
    required: ["reminders"],
    additionalProperties: false,
};

const generateAiReminders = async (tasks) => {
    if (!OPENROUTER_API_KEY) {
        return tasks.map((task) => ({
            title: task.title,
            message: buildFallbackReminder(task),
            urgency: task.urgency,
            dueLabel: task.dueLabel,
            category: task.category,
        }));
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Task Tracker Reminders",
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
                        name: "task_reminders",
                        strict: true,
                        schema: reminderSchema,
                    },
                },
                plugins: [{ id: "response-healing" }],
            }),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        const outputText = data.choices?.[0]?.message?.content || "";
        const reminders = ensureReminderShape(extractJsonObject(outputText));

        return tasks.map((task) => {
            const matchedReminder = reminders.find((reminder) => reminder.title === task.title);

            return {
                title: task.title,
                message: matchedReminder?.message || buildFallbackReminder(task),
                urgency: matchedReminder?.urgency || task.urgency,
                dueLabel: matchedReminder?.dueLabel || task.dueLabel,
                category: matchedReminder?.category || task.category,
            };
        });
    } catch (error) {
        return tasks.map((task) => ({
            title: task.title,
            message: buildFallbackReminder(task),
            urgency: task.urgency,
            dueLabel: task.dueLabel,
            category: task.category,
        }));
    }
};

export const generateRemindersForUser = async (ownerId) => {
    const pendingTasks = await getPendingTasksForUser(ownerId);

    if (!pendingTasks.length) {
        return { reminders: [] };
    }

    const rankedTasks = rankTasksForReminders(pendingTasks).slice(0, 3);
    const reminders = await generateAiReminders(rankedTasks);

    return {
        reminders: rankedTasks.map((task) => ({
            taskId: task._id,
            priority: task.priority,
            deadline: task.deadline,
            ...reminders.find((reminder) => reminder.title === task.title),
        })),
    };
};
