import express from "express";
import trimRequest from "trim-request";
import { authMiddleware } from "../middlewares/authMiddleware.js";

import { createNewOrOpenExistingConversation, createGroupConversation, getAllConversations } from "../controllers/conversation-controller.js";
                                 
const router = express.Router();

router.route("/").post(trimRequest.all, authMiddleware, createNewOrOpenExistingConversation);
router.route("/group").post(trimRequest.all, authMiddleware, createGroupConversation);
router.route("/").get(trimRequest.all, authMiddleware, getAllConversations);

export default router;