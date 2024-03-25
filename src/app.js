import express from "express";
import dotenv from "dotenv";

//dotenv config
dotenv.config();

//create express app
const app = express();

app.get("/test", (req, res) => {
    res.send("Hello from our backend server!");
});

const port = process.env.port || 9000;

app.listen(port, () => console.log(`Server is listening on port ${port}!!!`));

