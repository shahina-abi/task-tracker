import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        emailRemindersEnabled: {
            type: Boolean,
            default: true,
        },
        reminderTime: {
            type: String,
            default: "09:00",
        },
        remindBeforeDays: {
            type: Number,
            default: 1,
            min: 0,
            max: 7,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", UserSchema);

export default User;
