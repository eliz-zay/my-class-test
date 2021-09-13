const { ClientPool } = require('./ClientPool');
const { QueryTypes, DataTypes, Op } = require('sequelize');

class Repository {
    constructor() {
        const clientPool = new ClientPool();
        this.sequelize = clientPool.sequelize;
        this.sequelize.define(
            'Lesson', 
            {
                id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
                date: { type: DataTypes.DATEONLY, allowNull: false },
                title: { type: DataTypes.STRING(100) },
                status: { type: DataTypes.INTEGER }
            },
            { tableName: 'lessons', timestamps: false }
        );
        this.sequelize.define(
            'Teacher', 
            {
                id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
                name: { type: DataTypes.STRING(10) },
            },
            { tableName: 'teachers', timestamps: false }
        );
        this.sequelize.define(
            'Student', 
            {
                id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
                name: { type: DataTypes.STRING(10) },
            },
            { tableName: 'students', timestamps: false  }
        );
        this.sequelize.define(
            'LessonTeacher',
            {
                lesson_id: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: this.sequelize.models.Lesson,
                        key: 'id'
                    }
                },
                teacher_id: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: this.sequelize.models.Teacher,
                        key: 'id'
                    }
                }
            },
            { tableName: 'lesson_teachers', timestamps: false }
        );
        this.sequelize.define(
            'LessonStudent',
            {
                lesson_id: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: this.sequelize.models.Lesson,
                        key: 'id'
                    }
                },
                student_id: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: this.sequelize.models.Student,
                        key: 'id'
                    }
                },
                visit: { type: DataTypes.BOOLEAN }
            },
            { tableName: 'lesson_students', timestamps: false }
        );

        const { Teacher, Student, Lesson, LessonTeacher, LessonStudent } = this.sequelize.models;

        Teacher.belongsToMany(Lesson, { through: LessonTeacher, foreignKey: 'teacher_id' });
        Lesson.belongsToMany(Teacher, { through: LessonTeacher, foreignKey: 'lesson_id' });

        Student.belongsToMany(Lesson, { through: LessonStudent, foreignKey: 'student_id'});
        Lesson.belongsToMany(Student, { through: LessonStudent, foreignKey: 'lesson_id'});
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

        let teacherIdsConstraint = teacherIds ? ' and array_agg(teachers.id) && array['+teacherIds+'] ' : '';

        let studCountConstraint = {};
        if (studentsCount && studentsCount.length == 2) { 
            studCountConstraint.q = ' and count(lesson_students.student_id) BETWEEN ? AND ? ';
            studCountConstraint.val = [studentsCount[0], studentsCount[1]]
        } else {
            studCountConstraint.q = ' and (count(lesson_students.student_id) = ? OR ? IS NULL) ';
            studCountConstraint.val = [studentsCount, studentsCount];
        }

        // Get lesson IDs for lessons that match the filter
        let queryRes = await this.sequelize.query(
            'select \
                lessons.id \
            from \
                lessons \
                    join lesson_teachers on lesson_teachers.lesson_id = lessons.id \
                    join teachers on lesson_teachers.teacher_id = teachers.id \
                    join lesson_students on lesson_students.lesson_id = lessons.id \
                    join students on students.id = lesson_students.student_id \
                    where (lessons.status = ? or ? is null) and '+dateConstraint.q+
                    ' group by lessons.id \
                    having true ' + teacherIdsConstraint + studCountConstraint.q,
            {
                replacements: ([status, status]).concat(dateConstraint.val).concat(studCountConstraint.val),
                type: QueryTypes.SELECT
            }
        );

        const lessonIds = queryRes.map(item => item.id)
        
        // Get full info for chosen lessons
        let res = await Lesson.findAll({
            where: { id: lessonIds }, // id IN lessonIds
            include: [
                { model: Teacher },
                { model: Student }
            ],
            offset: (page - 1) * lessonsPerPage,
            limit: lessonsPerPage
        });

        // Add visitCount for lesson, visit for each student
        res.forEach(lesson => {
            let visitCount = 0;
            lesson.Students.forEach(student => {
                visitCount += student.LessonStudent.dataValues.visit;
                student.dataValues.visit = student.LessonStudent.dataValues.visit;
            });
            lesson.dataValues.visitCount = visitCount;
        });

        res.forEach(item => {
            console.log('id: ' + item.dataValues.id);
            console.log('date: ' + item.dataValues.date);
            console.log('title: ' + item.dataValues.title);
            console.log('status: ' + item.dataValues.status);
            console.log('visitCount: ' + item.dataValues.visitCount);
            item.dataValues.Teachers.forEach(t => console.log(t.dataValues.id + ' ' + t.dataValues.name));
            item.dataValues.Students.forEach(t => console.log(t.dataValues.id + ' ' + t.dataValues.name + ' ' + t.dataValues.visit));
            console.log('\n*****\n')
        });
    }
}

module.exports = { Repository };