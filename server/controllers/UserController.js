import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

const buildAuthResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    }),
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
