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

    async getLessons({ date, status, teacherIds, studentsCount }) {
        const { Teacher, Student, Lesson, LessonTeacher, LessonStudent } = this.sequelize.models;

        let lessonConstraint = {};
        if (date && date.length == 2) {
            lessonConstraint.q = ' lessons.date BETWEEN to_date(?,YYYY-MM-DD) AND to_date(?,YYYY-MM-DD) ';
            lessonConstraint.val = [date[0], date[1]];
        } else {
            lessonConstraint.q = ' (lessons.date = ? or ? is null) ';
            lessonConstraint.val = [date, date]
        }

        let teacherIdsConstraint = teacherIds ? ' and array_agg(teachers.id) && array['+teacherIds+'] ' : null;

        let studentsConstraint = {};
        if (studentsCount && studentsCount.length == 2) { 
            studentsConstraint.q = ' and COUNT(lesson_students.student_id) BETWEEN ? AND ? ';
            studentsConstraint.val = [studentsCount[0], studentsCount[1]]
        } else {
            studentsConstraint.q = ' and (COUNT(lesson_students.student_id) = ? OR ? IS NULL) ';
            studentsConstraint.val = [studentsCount, studentsCount];
        }

        console.log(([status, status]).concat(lessonConstraint.val).concat(studentsConstraint.val))

        let res1 = await this.sequelize.query(
            'select \
                lessons.id lessonId, lessons.date, array_agg(teachers.id) teachersList \
            from \
                lessons \
                    join lesson_teachers on lesson_teachers.lesson_id = lessons.id \
                    join teachers on lesson_teachers.teacher_id = teachers.id \
                    join lesson_students on lesson_students.lesson_id = lessons.id \
                    join students on students.id = lesson_students.student_id \
                    where (lessons.status = ? or ? is null) and '+lessonConstraint.q+
                    ' group by lessons.id \
                    having true ' + teacherIdsConstraint + studentsConstraint.q,
            {
                replacements: ([status, status]).concat(lessonConstraint.val).concat(studentsConstraint.val),
                type: QueryTypes.SELECT
            }
        );

        console.log(res1);

        // result.forEach(item => {
        //     console.log(item.dataValues.id + ' ' + item.dataValues.date);
        //     // console.log(item)
        //     // item.dataValues.Teachers.forEach(t => console.log(t.dataValues));
        //     console.log('\n*****\n')
        // });
    }
}

module.exports = { Repository };