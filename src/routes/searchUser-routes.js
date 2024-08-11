import express from "express";
import trimRequest from "trim-request";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { searchUsers, getAllUsers } from "../controllers/searchUsers-controller.js";

const router = express.Router();

router.route("/").get(trimRequest.all, authMiddleware, searchUsers);
router.route("/allUsers").get(trimRequest.all, authMiddleware, getAllUsers);

export default router;