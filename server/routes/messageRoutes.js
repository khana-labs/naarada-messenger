import express from "express";

import {
  getInbox,
  getSentMessages,
  sendMessage,
} from "../controllers/messageController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/inbox", protect, getInbox);
router.get("/sent", protect, getSentMessages);

export default router;