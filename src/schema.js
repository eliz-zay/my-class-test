const Joi = require('joi');

const { ApiError } = require('./ApiError');

const getLessonsSchema = Joi.object({
    date: Joi.string()
        .pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|1\d|2\d|3[01])(?:,\d{4}-(0[1-9]|1[0-2])-(0[1-9]|1\d|2\d|3[01]))?$/)
        .error(new ApiError('Invalid date')),
    status: Joi.number().integer().min(0).max(1).error(new ApiError('Invalid status')),
    teacherIds: Joi.string().pattern(/^\d+(?:,\d+)*$/).error(new ApiError('Invalid teacher IDs')),
    studentsCount: Joi.string().pattern(/^\d+(?:,\d+)?$/).error(new ApiError('Invalid students count')),
    page: Joi.number().positive().error(new ApiError('Invalid page')),
    lessonsPerPage: Joi.number().positive().error(new ApiError('Invalid number of lessons per page'))
});

const createLessonsSchema = Joi.object({
    teacherIds: Joi.array().items(Joi.number().positive()).required().error(new ApiError('Invalid teacher IDs')),
    title: Joi.string().required().error(new ApiError('Invalid title')),
    days: Joi.array().items(Joi.number().integer().min(0).max(6)).required().error(new ApiError('Invalid days')),
    firstDate: Joi.string()
        .pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|1\d|2\d|3[01])$/)
        .required()
        .error(new ApiError('Invalid first date')),
    lastDate: Joi.string()
        .pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|1\d|2\d|3[01])$/)
        .error(new ApiError('Invalid first date')),
    lessonsCount: Joi.number().positive().error(new ApiError('Invalid lessons count'))
})
    .xor('lessonsCount', 'lastDate');

module.exports = { getLessonsSchema, createLessonsSchema };