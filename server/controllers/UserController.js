import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { sendReminderEmailForUser } from "../services/reminderEmailService.js";

const buildAuthResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    reminderSettings: {
        emailRemindersEnabled: user.emailRemindersEnabled,
        reminderTime: user.reminderTime,
        remindBeforeDays: user.remindBeforeDays,
    },
    token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    }),
});

const buildReminderSettingsResponse = (user) => ({
    emailRemindersEnabled: user.emailRemindersEnabled,
    reminderTime: user.reminderTime,
    remindBeforeDays: user.remindBeforeDays,
    email: user.email,
});

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(409).json({ message: "An account already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });

        return res.status(201).json(buildAuthResponse(user));
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to create account" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        return res.status(200).json(buildAuthResponse(user));
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to login" });
    }
};

export const getReminderSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user?.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(buildReminderSettingsResponse(user));
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to load reminder settings" });
    }
};

export const updateReminderSettings = async (req, res) => {
    try {
        const { emailRemindersEnabled, reminderTime, remindBeforeDays } = req.body;
        const user = await User.findById(req.user?.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (emailRemindersEnabled !== undefined) {
            user.emailRemindersEnabled = Boolean(emailRemindersEnabled);
        }

        if (reminderTime !== undefined) {
            user.reminderTime = reminderTime;
        }

        if (remindBeforeDays !== undefined) {
            const days = Number(remindBeforeDays);

            if (Number.isNaN(days) || days < 0 || days > 7) {
                return res.status(400).json({ message: "Remind before days must be between 0 and 7" });
            }

            user.remindBeforeDays = days;
        }

        await user.save();

        return res.status(200).json(buildReminderSettingsResponse(user));
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to update reminder settings" });
    }
};

export const sendTestReminderEmail = async (req, res) => {
    try {
        const result = await sendReminderEmailForUser(req.user?.id);
        return res.status(200).json(result);
    } catch (error) {
        const status = error.message === "User not found" ? 404 : 400;
        return res.status(status).json({ message: error.message || "Failed to send test reminder email" });
    }
};
