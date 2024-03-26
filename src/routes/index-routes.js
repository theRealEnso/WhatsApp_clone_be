//modularizing our routes rather than defining absolute paths for everything inside of the app.js file

import express from "express";

import authRoutes from './authentication-route.js';

const router = express.Router();

router.use("/auth", authRoutes);
// results in:
// http://localhost:9000/auth/register
// http://localhost:9000/auth/login
// http://localhost:9000/auth/logout
// http://localhost:9000/auth/refreshToken
//BUT, this needs to be appended further to the actual application in app.js

export default router;