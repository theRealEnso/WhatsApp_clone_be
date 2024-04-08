import express from "express";
import trimRequest from "trim-request";
import {authMiddleware} from "../middlewares/authMiddleware.js";

import { sendMessage, getAllUserMessagesInsideConversation } from "../controllers/message-controller-functions.js";

const router = express.Router();

router.route("/").post(trimRequest.all, authMiddleware, sendMessage);

router.route("/:conversation_id").get(trimRequest.all, authMiddleware, getAllUserMessagesInsideConversation);

export default router;