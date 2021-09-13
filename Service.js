const { Repository } = require("./Repository");

class Service {
    constructor(repository) {
        this.repository = repository || new Repository();
    }

    async getFullLessonInfo(args) {
        args.date ? args.date = args.date.split(',') : null;
        args.teacherIds ? args.teacherIds = args.teacherIds.split(',') : null;
        args.studentsCount ? args.studentsCount = args.studentsCount.split(',') : null;
        args.lessonsPerPage = args.lessonsPerPage ?? 5;
        args.page = args.page ?? 1;
        await this.repository.getLessons(args);
        return "OK";

        const result = await this.repository.getLessons(conditions, values);
    }

    // async getLessonsByTeachers(args) {
    //     let lessonTeachers;
    //     if (args.teacherIds) {
    //         lessonTeachers = await this.repository.getLessonsByTeachers(args.teacherIds.split(','));
    //     } else {
    //         lessonTeachers = await this.repository.getAllLessonTeachers();
    //     }
    //     return lessonTeachers;
    // }
}

module.exports = { Service };