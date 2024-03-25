import app from './app.js';
import logger from './configs/winston-logger.js';
import mongoose from 'mongoose';

//env variables
const {DATABASE_URL} = process.env;
const port = process.env.port || 9000;

//mongoDB debug mode
if(process.env.NODE_ENV !== 'production'){
    mongoose.set('debug', true);
};

//mongoDB connection
const connectToDB = async () => {
    try {

        if(!process.env.DATABASE_URL){
            logger.error(`'DATABASE_URL' environment variable is not defined!`);
        };
        
        const mongoDBConnection = await mongoose.connect(DATABASE_URL, {});
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
