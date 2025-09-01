import { getTasksForUser } from "./taskService.js";

const WEEK_CATEGORIES = ["Study", "Work", "Personal"];

const startOfWeek = (date = new Date()) => {
    const result = new Date(date);
    const day = result.getDay();
    const distance = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + distance);
    result.setHours(0, 0, 0, 0);
    return result;
};

const endOfWeek = (date = new Date()) => {
    const result = startOfWeek(date);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
};

const shiftDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const inCurrentWeek = (task, weekStart, weekEnd) => {
    const deadline = new Date(task.deadline);
    return deadline >= weekStart && deadline <= weekEnd;
};

const buildChartData = (tasks) =>
    WEEK_CATEGORIES.map((category) => ({
        name: category,
        value: Number(
            tasks
                .filter((task) => task.category === category)
                .reduce((sum, task) => sum + (Number(task.duration) || 0), 0)
                .toFixed(1)
        ),
    }));

const calculateProductivity = (tasks) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === "completed").length;

    return {
        totalTasks,
        completedTasks,
        productivity: totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0,
    };
};

const buildComparisonText = (currentProductivity, previousProductivity) => {
    const difference = currentProductivity - previousProductivity;

    if (difference > 0) {
        return `+${difference}% more productive than last week`;
    }

    if (difference < 0) {
        return `${difference}% less productive than last week`;
    }

    return "Same productivity as last week";
};

const buildFallbackReport = ({ chartData, productivity, totalTasks, completedTasks }) => {
    const topCategory = [...chartData].sort((left, right) => right.value - left.value)[0];
    const busiestCategory =
        topCategory && topCategory.value > 0
            ? `${topCategory.name} took the most time at ${topCategory.value} hours`
            : "no time has been logged yet";

    return `This week you completed ${completedTasks} of ${totalTasks} tasks for a productivity score of ${productivity}%. Your focus was strongest in ${busiestCategory}. Keep the momentum by finishing the nearest pending tasks first and protecting time for your highest-value category.`;
};

const buildWeeklyPrompt = ({ chartData, productivity, totalTasks, completedTasks, tasks }) => `You are an insightful productivity coach.
Write a concise weekly summary in 3 to 4 sentences.

Rules:
- Focus on patterns, strengths, and one practical suggestion.
- Mention category balance and productivity percentage.
- Do not use markdown.

Weekly stats:
${JSON.stringify(
    {
        chartData,
        productivity,
        totalTasks,
        completedTasks,
        tasks: tasks.map((task) => ({
            title: task.title,
            category: task.category,
            duration: task.duration,
            status: task.status,
            deadline: task.deadline,
        })),
    },
    null,
    2
)}`;

const generateAiWeeklySummary = async (payload) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model =
        process.env.OPENROUTER_MODEL || "google/gemma-3n-e4b-it:free";

    if (!apiKey) {
        return buildFallbackReport(payload);
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Task Tracker Weekly Report",
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: "user",
                        content: buildWeeklyPrompt(payload),
                    },
                ],
            }),
        });

        if (!response.ok) {
            return buildFallbackReport(payload);
        }

        const data = await response.json();
        return (
            data.choices?.[0]?.message?.content?.trim() || buildFallbackReport(payload)
        );
    } catch (error) {
        return buildFallbackReport(payload);
    }
};

export const generateWeeklyReportForUser = async (ownerId) => {
    const allTasks = await getTasksForUser(ownerId);
    const weekStart = startOfWeek();
    const weekEnd = endOfWeek();
    const previousWeekStart = shiftDays(weekStart, -7);
    const previousWeekEnd = shiftDays(weekEnd, -7);
    const weeklyTasks = allTasks.filter((task) => inCurrentWeek(task, weekStart, weekEnd));
    const previousWeekTasks = allTasks.filter((task) =>
        inCurrentWeek(task, previousWeekStart, previousWeekEnd)
    );

    const chartData = buildChartData(weeklyTasks);
    const { totalTasks, completedTasks, productivity } =
        calculateProductivity(weeklyTasks);
    const { productivity: previousWeekProductivity } =
        calculateProductivity(previousWeekTasks);
    const comparison = buildComparisonText(productivity, previousWeekProductivity);

    const reportPayload = {
        chartData,
        productivity,
        totalTasks,
        completedTasks,
        tasks: weeklyTasks,
    };

    const report = await generateAiWeeklySummary(reportPayload);

    return {
        chartData,
        productivity,
        previousWeekProductivity,
        comparison,
        report,
    };
};
