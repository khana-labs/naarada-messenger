import express from "express";

import {
  assignEmergencyTeam,
  getAllEmergencies,
  getAuthoritySummary,
  updateEmergencyStatus,
} from "../controllers/authorityController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/summary", getAuthoritySummary);

router.get("/emergencies", getAllEmergencies);

router.patch(
  "/emergencies/:id/status",
  updateEmergencyStatus
);

router.patch(
  "/emergencies/:id/assign",
  assignEmergencyTeam
);

export default router;