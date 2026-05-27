import { Router } from "express";
import { generateRoadmap } from "../services/roadmap/controller/roadmap-controller.js";

const router = Router();

router.post("/generate", generateRoadmap);

export default router;