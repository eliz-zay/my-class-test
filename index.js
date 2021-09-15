const express = require("express");
const bodyParser = require("body-parser");

const app = express();

require("dotenv").config();

const { lessonRouter } = require("./lessonRouter");
const { ApiError } = require("./ApiError");

app.use(bodyParser.json());

app.use("/", lessonRouter);

app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(200).send(err.message);
    }
    
    console.log(err);
    return res.status(500).send("Internal server error.");
});

app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`);
});