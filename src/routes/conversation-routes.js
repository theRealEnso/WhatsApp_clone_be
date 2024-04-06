import express from "express";
import trimRequest from "trim-request";
import { authMiddleware } from "../middlewares/authMiddleware.js";

import { createNewOrOpenExistingConversation, getAllConversations } from "../controllers/conversation-controller.js";

const router = express.Router();

router.route("/").post(trimRequest.all, authMiddleware, createNewOrOpenExistingConversation);

router.route("/").get(trimRequest.all, authMiddleware, getAllConversations);

export default router;