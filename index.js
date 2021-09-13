const express = require("express");
const bodyParser = require("body-parser");

const app = express();

require("dotenv").config();

const { lessonRouter } = require("./lessonRouter");

app.use(bodyParser.json());

app.use("/", lessonRouter);

app.use((err, req, res, next) => {
    console.log(err);
    return res.json("Internal error!");
});

app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`);
});