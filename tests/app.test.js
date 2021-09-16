const request = require('supertest');
const assert = require('chai').assert;

let app = require('../src/index').app;

describe('GET "/": requests lessons data', () => {
    it('between two dates with other options', done => {
        request(app)
            .get('/')
            .send({
                date: '2020-01-01,2020-03-04'
            })
            .expect(200)
            .expect(res => {
                res.body.every(elem => {
                    assert.hasAllKeys(elem, [
                        'id', 'date', 'title', 'status', 'visitCount', 'teachers', 'students'
                    ]);
                    if (elem.teachers.length) {
                        elem.teachers.every(teacher => {
                            assert.hasAllKeys(teacher, ['id', 'name']);
                        });
                    }
                    if (elem.students.length) {
                        elem.students.every(student => {
                            assert.hasAllKeys(student, ['id', 'name', 'visit']);
                        });
                    }
                });
            })
            .end(done);
    });
    
    it('in one date', done => {
        request(app)
            .get('/')
            .send({
                date: '2020-01-01',
            })
            .expect(200)
            .expect(res => {
                res.body.every(elem => {
                    assert.hasAllKeys(elem, [
                        'id', 'date', 'title', 'status', 'visitCount', 'teachers', 'students'
                    ]);
                    if (elem.teachers.length) {
                        elem.teachers.every(teacher => {
                            assert.hasAllKeys(teacher, ['id', 'name']);
                        });
                    }
                    if (elem.students.length) {
                        elem.students.every(student => {
                            assert.hasAllKeys(student, ['id', 'name', 'visit']);
                        });
                    }
                });
            })
            .end(done);
    });
    
    it('with several teacher IDs', done => {
        request(app)
            .get('/')
            .send({
                teacherIds: '1,2,3'
            })
            .expect(200)
            .expect(res => {
                res.body.every(elem => {
                    assert.hasAllKeys(elem, [
                        'id', 'date', 'title', 'status', 'visitCount', 'teachers', 'students'
                    ]);
                    if (elem.teachers.length) {
                        elem.teachers.every(teacher => {
                            assert.hasAllKeys(teacher, ['id', 'name']);
                        });
                    }
                    if (elem.students.length) {
                        elem.students.every(student => {
                            assert.hasAllKeys(student, ['id', 'name', 'visit']);
                        });
                    }
                });
            })
            .end(done);
    });
    
    it('with interval of students number', done => {
        request(app)
            .get('/')
            .send({
                studentsCount: '2,3'
            })
            .expect(200)
            .expect(res => {
                res.body.every(elem => {
                    assert.hasAllKeys(elem, [
                        'id', 'date', 'title', 'status', 'visitCount', 'teachers', 'students'
                    ]);
                    if (elem.teachers.length) {
                        elem.teachers.every(teacher => {
                            assert.hasAllKeys(teacher, ['id', 'name']);
                        });
                    }
                    if (elem.students.length) {
                        elem.students.every(student => {
                            assert.hasAllKeys(student, ['id', 'name', 'visit']);
                        });
                    }
                });
            })
            .end(done);
    });
    
    it('with a single students number', done => {
        request(app)
            .get('/')
            .send({
                studentsCount: '2'
            })
            .expect(200)
            .expect(res => {
                res.body.every(elem => {
                    assert.hasAllKeys(elem, [
                        'id', 'date', 'title', 'status', 'visitCount', 'teachers', 'students'
                    ]);
                    if (elem.teachers.length) {
                        elem.teachers.every(teacher => {
                            assert.hasAllKeys(teacher, ['id', 'name']);
                        });
                    }
                    if (elem.students.length) {
                        elem.students.every(student => {
                            assert.hasAllKeys(student, ['id', 'name', 'visit']);
                        });
                    }
                });
            })
            .end(done);
    });
    
    it('with all parameters', done => {
        request(app)
            .get('/')
            .send({
                date: '2019-01-01,2019-03-06',
                teacherIds: '1,2',
                studentsCount: '2',
                status: 1,
                page: 2,
                lessonsPerPage: 3
            })
            .expect(200)
            .expect(res => {
                res.body.every(elem => {
                    assert.hasAllKeys(elem, [
                        'id', 'date', 'title', 'status', 'visitCount', 'teachers', 'students'
                    ]);
                    if (elem.teachers.length) {
                        elem.teachers.every(teacher => {
                            assert.hasAllKeys(teacher, ['id', 'name']);
                        });
                    }
                    if (elem.students.length) {
                        elem.students.every(student => {
                            assert.hasAllKeys(student, ['id', 'name', 'visit']);
                        });
                    }
                });
            })
            .end(done);
    });

    it('with no filter', done => {
        request(app)
            .get('/')
            .expect(200)
            .expect(res => {
                res.body.every(elem => {
                    assert.hasAllKeys(elem, [
                        'id', 'date', 'title', 'status', 'visitCount', 'teachers', 'students'
                    ]);
                    if (elem.teachers.length) {
                        elem.teachers.every(teacher => {
                            assert.hasAllKeys(teacher, ['id', 'name']);
                        });
                    }
                    if (elem.students.length) {
                        elem.students.every(student => {
                            assert.hasAllKeys(student, ['id', 'name', 'visit']);
                        });
                    }
                });
            })
            .end(done);
    });

    it('error: 3 dates given', done => {
        request(app)
            .get('/')
            .send({
                date: '2019-01-01,2019-03-06,2020-01-03'
            })
            .expect(400)
            .end(done);
    });

    it('error: 2 values for students count given', done => {
        request(app)
            .get('/')
            .send({
                studentsCount: '1,2,3'
            })
            .expect(400)
            .end(done);
    });
});

describe('POST "/lessons": creates one or more lessons', () => {
    it('with lessons count', done => {
        request(app)
            .post('/lessons')
            .send({
                teacherIds: [1,2],
                title: 'Some title',
                days: [0,4,6],
                firstDate: '2019-01-01',
                lessonsCount: 10
            })
            .expect(200)
            .expect(res => {
                assert.isArray(res.body);
            })
            .end(done);
    });

    it('with last date', done => {
        request(app)
            .post('/lessons')
            .send({
                teacherIds: [1,2],
                title: 'Some title',
                days: [0,4,6],
                firstDate: '2019-01-01',
                lastDate: '2019-04-04'
            })
            .expect(200)
            .expect(res => {
                assert.isArray(res.body);
            })
            .end(done);
    });

    it('error: no parameters', done => {
        request(app)
            .post('/lessons')
            .expect(400)
            .end(done);
    });

    it('error: both last date and lessons count given', done => {
        request(app)
            .post('/lessons')
            .send({
                teacherIds: [1,2],
                title: 'Some title',
                days: [0,4,6],
                firstDate: '2019-01-01',
                lastDate: '2019-04-04',
                lessonsCount: 8
            })
            .expect(400)
            .end(done);
    });
});