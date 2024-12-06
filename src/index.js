// code that handles the connection of our express server to mongo DB + socket IO connection
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app.js';
import logger from './configs/winston-logger.js';

import { SocketListener } from './utils/socket-listener.js';

//env variables
const {DATABASE_URL} = process.env;
const port = process.env.port || 9000;

//mongoDB debug mode
if(process.env.NODE_ENV !== 'production'){
    mongoose.set("debug", true);
};

//mongoDB connection
const connectToDB = async () => {
    try {

        if(!process.env.DATABASE_URL){
            logger.error(`'DATABASE_URL' environment variable is not defined!`);
        };
        
        await mongoose.connect(DATABASE_URL, {});
        logger.info(`Connected to MongoDB!`);
    } catch (error) {
        logger.error(`Error connecting to MongoDB! : ${error}`);
        process.exit(1);
    }
}

connectToDB();

let server;
server = app.listen(port, () => {
    logger.info(`server is listening on port ${port}!!!`)
});

//setup socket io on server to listen for connections coming from our front end app
const io = new Server(server, {
    //options
    pingTimeout: 60000,
    cors: {
        origin: process.env.CLIENT_ENDPOINT,
    },
});

//upon a successful connection from a front-end client, each client gets their own socket object. We run the SocketListener function that uses the socket object + io instance as inputs
io.on("connection", (socket) => {
    // console.log(socket);
    logger.info("Socket IO connected successfully!");
    SocketListener(socket, io);
});

///////     handle server errors    ////////

const closeServer = () => {
    if(server) {
        logger.info('Server closed.');
        process.exit(1)  // kill server. Exiting with "1" means there was some sort of problem. Exiting with 0 means no issues occurred
    } else {
        process.exit(1)
    }
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    closeServer();
};

//handle uncaughtExceptipn + unhandledRejection errors
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

//SIGTERM
//SIGTERM (signal 15) is used in Linux to terminate a process gracefully
//.on is an event listener. Here we are just saying if we receive a sigterm and the server is currently running, then just close it
process.on("SIGTERM", () => {
    if(server) {
        logger.info("Server closed.");
        process.exit(1);
    }
});
///////    ***END*** handle server errors  ***END***  ////////
