import express, { Router } from "express";
import { getStreamToken } from "../controllers/chat.controller.js";
const router = express.Router();


router.get("/token", getStreamToken)

export default router;