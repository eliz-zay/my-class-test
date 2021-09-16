const { QueryTypes } = require('sequelize');

const { SequelizeInstance } = require('./SequelizeInstance');

class Repository {
    constructor() {
        const seqInstance = new SequelizeInstance();
        this.sequelize = seqInstance.sequelize;
    }

    async getLessons({ date, status, teacherIds, studentsCount, page, lessonsPerPage }) {
        const { Teacher, Student, Lesson } = this.sequelize.models;

        let dateConstraint = {};
        if (date && date.length == 2) {
            dateConstraint.q = " lessons.date between to_date(?,'YYYY-MM-DD') AND to_date(?,'YYYY-MM-DD') ";
            dateConstraint.val = [date[0], date[1]];
        } else {
            dateConstraint.q = " (lessons.date = to_date(?,'YYYY-MM-DD') or ? is null) ";
            dateConstraint.val = [date, date]
        }

        let teacherIdsConstraint = '';
        if (teacherIds) {
            teacherIdsConstraint = 
                ' and (\
                    (select array_agg(teacher_id) from lesson_teachers \
                    group by lesson_id having lesson_id = lessons.id) && \
                    array['+teacherIds+']\
                )';
        }

        let studCountConstraint = {};
        if (studentsCount && studentsCount.length == 2) { 
            studCountConstraint.val = [studentsCount[0], studentsCount[1]];
            studCountConstraint.q =
                ' and (\
                    (select count(student_id) from lesson_students \
                    group by lesson_id having lesson_id = lessons.id) \
                    BETWEEN ? AND ?  \
                )';
        } else {
            studCountConstraint.val = [studentsCount, studentsCount];
            studCountConstraint.q =
                ' and (\
                    (select count(student_id) from lesson_students \
                    group by lesson_id having lesson_id = lessons.id) \
                    = ? OR ? IS NULL \
                )';
        }

        // Get lesson IDs for lessons that match the filter
        let queryRes = await this.sequelize.query(
            'select \
                lessons.id \
            from \
                lessons \
                    left join lesson_teachers on lesson_teachers.lesson_id = lessons.id \
                    left join teachers on lesson_teachers.teacher_id = teachers.id \
                    left join lesson_students on lesson_students.lesson_id = lessons.id \
                    left join students on students.id = lesson_students.student_id \
                    where (lessons.status = ? or ? is null) and '+
                    dateConstraint.q + teacherIdsConstraint + studCountConstraint.q +
                    ' group by lessons.id',
            {
                replacements: ([status, status]).concat(dateConstraint.val).concat(studCountConstraint.val),
                type: QueryTypes.SELECT
            }
        );

        const lessonIds = queryRes.map(item => item.id)
        
        // Get full info for chosen lessons
        let dbResult = await Lesson.findAll({
            where: { id: lessonIds }, // id IN lessonIds
            include: [
                { model: Teacher },
                { model: Student }
            ],
            offset: (page - 1) * lessonsPerPage,
            limit: lessonsPerPage
        });

        // Add visitCount for lesson and visit for each student
        dbResult.forEach(lesson => {
            let visitCount = 0;
            lesson.Students.forEach(student => {
                visitCount += student.LessonStudent.dataValues.visit;
                student.dataValues.visit = student.LessonStudent.dataValues.visit;
            });
            lesson.dataValues.visitCount = visitCount;
        });

        const lessonsData = dbResult.map(item => ({
            id: item.dataValues.id,
            date: item.dataValues.date,
            title: item.dataValues.title,
            status: item.dataValues.status,
            visitCount: item.dataValues.visitCount,
            students: item.dataValues.Students.map(stud => ({
                id: stud.dataValues.id,
                name: stud.dataValues.name,
                visit: stud.dataValues.visit
            })),
            teachers: item.dataValues.Teachers.map(teacher => ({
                id: teacher.dataValues.id,
                name: teacher.dataValues.name
            }))
        }));

        return lessonsData;
    }

    async createLessons(dates, title, teacherIds) {
        const { Lesson } = this.sequelize.models;

        let ids = [];

        await Promise.all(dates.map(async (date) => {
            const lesson = await Lesson.create({
                title: title,
                date: date
            });

            await lesson.addTeachers(teacherIds);

            ids.push(lesson.dataValues.id);
        }));

        return ids;
    }
}

module.exports = { Repository };