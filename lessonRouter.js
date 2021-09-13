const lessonRouter = require("express").Router();

const { Service } = require("./Service"); 

lessonRouter.get("/", async (req, res, next) => {
    try {
        const service = new Service();
        const lessons = await service.getFullLessonInfo(req.body);
        return res.status(200).json(lessons);
    } catch (err) {
        return next(err);
    }
});

module.exports = { lessonRouter };