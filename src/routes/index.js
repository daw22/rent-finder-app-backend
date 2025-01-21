import express from "express";
import AuthRoutes from "./auth/index.js";

const app = express.Router();

app.use("/accounts", AuthRoutes);

export default app;