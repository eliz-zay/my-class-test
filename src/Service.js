const { Repository } = require('./Repository');
const { ApiError } = require('./ApiError');

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

        const lessons = await this.repository.getLessons(args);

        return lessons;
    }

    async createLessons({ firstDate: aFirstDate, lastDate: aLastDate, days, lessonsCount, teacherIds, title }) {
        if (!days.length) {
            throw new ApiError('Days must not be empty.')
        }

        let addDays = (date, daysNum) => {
            let result = new Date(date);
            result.setDate(result.getDate() + daysNum);
            return result;
        }

        let checkLimit = () => !(lessonsRegistered >= 300 || currentDate >= yearFromFirstLesson);

        const firstDate = new Date(aFirstDate);
        const lastDate = new Date(aLastDate);
        const firstDay = firstDate.getDay();
        const yearFromFirstLesson = new Date(
            firstDate.getFullYear() + 1,
            firstDate.getMonth(),
            firstDate.getDate()
        );

        if (firstDate > lastDate) {
            throw new ApiError('First date cannot be less than last date.')
        }

        let dates = [];
        let currentDate = firstDate;
        let lessonsRegistered = 0;

        if (lessonsCount) {
            // loop current week
            if (firstDay != 0) {
                days.forEach(day => {
                    currentDate = addDays(firstDate, day - firstDay);
                    if (lessonsCount && day >= firstDay && checkLimit()) {
                        dates.push(currentDate);
                        lessonsCount--;
                        lessonsRegistered++;
                    }
                });
            }
    
            // loop other weeks
            let sunday = addDays(firstDate, (7 - firstDay) % 7);
            while (lessonsCount && checkLimit()) {
                days.forEach(day => {
                    currentDate = addDays(sunday, day);
                    if (lessonsCount && checkLimit()) {
                        dates.push(currentDate);
                        lessonsCount--;
                        lessonsRegistered++;
                    }
                });
                sunday = addDays(sunday, 7);
            }

        } else { // lastDate check
            // loop current week
            if (firstDay != 0) {
                days.forEach(day => {
                    currentDate = addDays(firstDate, day - firstDay);
                    if (currentDate <= lastDate && day >= firstDay && checkLimit()) {
                        dates.push(currentDate);
                        lessonsRegistered++;
                    }
                });
            }

            // loop other weeks
            let sunday = addDays(firstDate, (7 - firstDay) % 7);
            while (currentDate < lastDate && checkLimit()) {
                days.forEach(day => {
                    currentDate = addDays(sunday, day);
                    if (currentDate <= lastDate && checkLimit()) {
                        dates.push(currentDate);
                        lessonsRegistered++;
                    }
                });
                sunday = addDays(sunday, 7);
            }
        }

        const lessonIds = await this.repository.createLessons(dates, title, teacherIds);

        return lessonIds;
    }
}

module.exports = { Service };