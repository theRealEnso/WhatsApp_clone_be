import express from "express";
import trimRequest from "trim-request";
import { authMiddleware } from "../middlewares/authMiddleware.js";

import { createNewOrOpenExistingConversation } from "../controllers/conversation-controller.js";

const router = express.Router();

router.route("/").post(trimRequest.all, authMiddleware, createNewOrOpenExistingConversation);

router.route("/").get(trimRequest.all, authMiddleware, );

export default router;