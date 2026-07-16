import express from "express";

import {
  cancelEmergency,
  createEmergency,
  getEmergencyById,
  getMyEmergencies,
} from "../controllers/emergencyController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createEmergency);
router.get("/my", getMyEmergencies);
router.get("/:id", getEmergencyById);
router.patch("/:id/cancel", cancelEmergency);

export default router;