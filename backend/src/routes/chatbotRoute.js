import { Router } from "express";
import { chat } from "../services/chatbot/controller/chatbot-controller.js";

const router = Router();

router.post("/chat", chat);

export default router;