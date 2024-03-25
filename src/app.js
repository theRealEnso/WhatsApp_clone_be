import express from "express";
import dotenv from "dotenv";

//dotenv config
dotenv.config();

//create express app
const app = express();
const port = process.env.port || 9000;

// console.log(process.env.NODE_ENV); // verify that we are in development mode

app.get("/test", (req, res) => {
    res.send("Hello from our backend server!");
});

app.listen(port, () => console.log(`Server is listening on port ${port}!!!`));

