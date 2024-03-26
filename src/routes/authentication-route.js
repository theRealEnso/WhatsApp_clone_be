import express from "express";
import trimRequest from "trim-request"; // middleware package that removes excess white spaces in request bodies

import { register, login, logout, refreshToken } from "../controllers/auth-controller-functions.js";

const router = express.Router();

router.route("/register").post(trimRequest.all, register);

router.route("/login").post(trimRequest.all, login);

router.route("/logout").post(trimRequest.all, logout);

router.route("/refreshToken").post(trimRequest.all, refreshToken);

export default router;