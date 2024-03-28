import express from "express";
import dotenv from "dotenv";
import morgan from "morgan"; // this package logs to the console information about any and all requests that our server receives (i.e. type of requests, where request was sent, status, time for completion, etc)
import helmet from "helmet"; // this package secures express apps by setting various HTTP headers
import mongoSanitize from "express-mongo-sanitize"; // sanitizes user data to prevent MongoDB operator injections / database manipulation
import cookieParser from "cookie-parser"; // parse cookie headers and populate req.cookies with an object keyed by the cookie names
import compression from "compression"; // compresses response bodies for all incoming requests to reduce data size, allowing for faster processing and response times
import fileUpload from "express-fileupload"; // this makes uploaded files accessible from req.files
import cors from "cors"; // this restricts who can access the server
import createHttpError from "http-errors";

import routes from "./routes/index-routes.js";
 
//dotenv config
dotenv.config();

//create express app
const app = express();

// verify that we are in development mode
// console.log(process.env.NODE_ENV);

//// *** ADDING MIDDLEWARES *** ////

//Morgan
if(process.env.NODE_ENV !== "production"){
    app.use(morgan("dev"));
};

//Helmet
app.use(helmet());

//Parse json request body
app.use(express.json());

//Parse json request url
app.use(express.urlencoded({extended: true}));

//sanitize user data requests
app.use(mongoSanitize());

//enable cookie parser
app.use(cookieParser());

//compression for compressing data from incoming user requests
app.use(compression());

//file upload
app.use(fileUpload({
    useTempFiles: true,
}));

//cors
app.use(cors());

app.use("/api/v1", routes);
//final result(s)
//http:localhost:9000/api/v1/auth/register
//http:localhost:9000/api/v1/auth/login
//http:localhost:9000/api/v1/auth/logout
//http:localhost:9000/api/v1/auth/refreshToken


app.get("/test", (req, res) => {
    res.send("Hello from our backend server!");
});

//error handling middleware
app.use(async (req, res, next) => {
    next(createHttpError.NotFound("This route does not exist!"));
});

//error handling middleware
app.use(async (error, req, res, next) => {
    res.status(error.status || 500);
    res.send({
        error: {
            status: error.status || 500,
            message: error.message,
        }
    })
});

//// *** END OF ADDING MIDDLEWARES *** ////

export default app;