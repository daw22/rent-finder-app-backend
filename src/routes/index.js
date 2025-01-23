import express from "express";
import AuthRoutes from "./auth/index.js";

const app = express.Router();

app.use("/accounts", AuthRoutes);
app.get("/", (req, res)=> res.send("hello dawit"))

export default app;