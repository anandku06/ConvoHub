import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import {clerkMiddleware} from "@clerk/express";


const app = express();

app.use(express.json());
app.use(clerkMiddleware()) // Clerk middleware to handle authentication ; used to protect routes

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(ENV.PORT, () => {
  console.log(`Server is listening on port ${ENV.PORT}`);
  connectDB();
});
