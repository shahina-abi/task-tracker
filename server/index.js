import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {connectDB} from "./config/db.js";
//import {userRoutes} from "./routes/TaskRoutes.js";

const app = express();
dotenv.config();

connectDB();

app.use(cors());
app.use(express.json());

//app.use("/api/tasks", userRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});