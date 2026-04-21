import User from "../models/UserModel.js";
import { generateRemindersForUser } from "./reminderService.js";
import { sendEmail } from "./emailService.js";

const buildEmailHtml = ({ userName, reminders }) => `
    <div style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 32px;">
        <h1 style="color: #ffffff; margin-bottom: 8px;">Reminder check-in for ${userName}</h1>
        <p style="margin-top: 0; color: #94a3b8;">Here are the tasks that need your attention first.</p>
        <div style="margin-top: 24px;">
            ${reminders
                .map(
                    (reminder) => `
                <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(148, 163, 184, 0.18); border-radius: 18px; padding: 18px; margin-bottom: 16px;">
                    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #38bdf8;">${reminder.category}</div>
                    <h2 style="margin: 10px 0 8px; color: #ffffff;">${reminder.title}</h2>
                    <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 10px;">${reminder.dueLabel}</div>
                    <p style="margin: 0; color: #e2e8f0; line-height: 1.6;">${reminder.message}</p>
                </div>
            `
                )
                .join("")}
        </div>
    </div>
`;

const buildEmailText = ({ userName, reminders }) =>
    `Reminder check-in for ${userName}\n\n${reminders
        .map(
            (reminder) =>
                `${reminder.category} | ${reminder.title} | ${reminder.dueLabel}\n${reminder.message}`
        )
        .join("\n\n")}`;

export const sendReminderEmailForUser = async (ownerId) => {
    const user = await User.findById(ownerId).lean();

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.emailRemindersEnabled) {
        throw new Error("Email reminders are disabled for this user");
    }

    const reminderPayload = await generateRemindersForUser(ownerId);

    if (!reminderPayload.reminders.length) {
        return {
            delivered: false,
            provider: "none",
            message: "No urgent reminders to send right now",
        };
    }

    const subject =
        reminderPayload.reminders[0].urgency === "overdue"
            ? "You have overdue tasks to finish"
            : "Your task reminders are ready";

    return sendEmail({
        to: user.email,
        subject,
        html: buildEmailHtml({
            userName: user.name,
            reminders: reminderPayload.reminders,
        }),
        text: buildEmailText({
            userName: user.name,
            reminders: reminderPayload.reminders,
        }),
    });
};
