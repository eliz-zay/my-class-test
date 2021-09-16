const { Sequelize, DataTypes } = require('sequelize');

class SequelizeInstance {
    static #instance = null;
    sequelize = null;

    constructor() {
        if (SequelizeInstance.#instance) {
            return SequelizeInstance.#instance;
        }

        SequelizeInstance.#instance = this;
        this.sequelize = new Sequelize(process.env.DB_URL, { logging: false });

        this.sequelize.define(
            'Lesson', 
            {
                id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
                date: { type: DataTypes.DATEONLY, allowNull: false },
                title: { type: DataTypes.STRING(100) },
                status: { type: DataTypes.INTEGER }
            },
            { tableName: 'lessons', timestamps: false }
        );
        this.sequelize.define(
            'Teacher', 
            {
                id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
                name: { type: DataTypes.STRING(10) },
            },
            { tableName: 'teachers', timestamps: false }
        );
        this.sequelize.define(
            'Student', 
            {
                id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
                name: { type: DataTypes.STRING(10) },
            },
            { tableName: 'students', timestamps: false  }
        );
        this.sequelize.define(
            'LessonTeacher',
            {
                lesson_id: {
                    type: DataTypes.INTEGER,
                    references: { model: this.sequelize.models.Lesson, key: 'id' }
                },
                teacher_id: {
                    type: DataTypes.INTEGER,
                    references: { model: this.sequelize.models.Teacher, key: 'id' }
                }
            },
            { tableName: 'lesson_teachers', timestamps: false }
        );
        this.sequelize.define(
            'LessonStudent',
            {
                lesson_id: {
                    type: DataTypes.INTEGER,
                    references: { model: this.sequelize.models.Lesson, key: 'id' }
                },
                student_id: {
                    type: DataTypes.INTEGER,
                    references: { model: this.sequelize.models.Student, key: 'id' }
                },
                visit: { type: DataTypes.BOOLEAN }
            },
            { tableName: 'lesson_students', timestamps: false }
        );

        const { Teacher, Student, Lesson, LessonTeacher, LessonStudent } = this.sequelize.models;

        Teacher.belongsToMany(Lesson, { through: LessonTeacher, foreignKey: 'teacher_id' });
        Lesson.belongsToMany(Teacher, { through: LessonTeacher, foreignKey: 'lesson_id' });

        Student.belongsToMany(Lesson, { through: LessonStudent, foreignKey: 'student_id' });
        Lesson.belongsToMany(Student, { through: LessonStudent, foreignKey: 'lesson_id' });
    }
}

module.exports = { SequelizeInstance };