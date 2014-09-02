var express = require('express');
var router = express.Router();


var jwt = require('jsonwebtoken');

var jwt_secret = 'cis_secret';
var url = require('url');
var async = require("async");


router.post('/login', function (req, res) {
    var _body = req.body;
    if (_body) {
        var _userId = _body.userId;
        var _password = _body.password;

        var _userService = require('../service/service.user');
        _userService.login(_userId, _password, function (status, role, entity) {
            if (status === 'failed') {
                console.log('登陆失败，用户不存在')
                res.send({
                    status: status,
                    msg: '登陆失败'
                });
                return;
            }
            req.session.auth = entity;
            var token = jwt.sign(entity, jwt_secret, { expiresInMinutes: 60 * 5 });
            if (status && status == 'success') {
                res.json({
                    token: token,
                    role: role,
                    status: status,
                    entity: entity
                });
            } else {
                res.send({
                    status: status,
                    msg: '登陆失败'
                });
            }
        });
    }
});

router.get('/answers', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var _eid = query.eid;
    var _cid = query.cid;
    var _sno = query.sno;
    var PostExercise = require('../models').PostExercise;
    var Answer = require('../models').Answer;
    PostExercise.hasMany(Answer);
    Answer.belongsTo(PostExercise, { foreignKey: 'eid'});
    if (_eid) {
        Answer.find({where: {cid: _cid, eid: _eid, sno: _sno}})
            .complete(function (err, dbAnswer) {
                if (!err && dbAnswer) {
                    res.send(dbAnswer);
                }
            });
    } else {
        Answer.findAll({where: {cid: _cid, sno: _sno}, include: [PostExercise]})
            .complete(function (err, dbAnswer) {
                if (!err && dbAnswer) {
                    res.send(dbAnswer);
                }
            });
    }
    /* var _sno = req.session.auth.*/
});


router.get('/postexercises', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var _sno = query.sno;
    var _cid = query.cid;
    require('../models').PostExercise.findAll({where: {cid: _cid}})
        .complete(function (err, dbPostExercises) {
            if (!err && dbPostExercises) {
                var Answer = require('../models').Answer;
                var _len = dbPostExercises.length;
                var _newExercises = [];

                var count = 0;
                async.whilst(function () {
                        return count < _len;
                    },
                    function (next) {
                        var _exercise = dbPostExercises[count];
                        Answer.find({where: {eid: _exercise.id}}).complete(function (err, dbAnswer) {
                            var _content =  _exercise.exerciseContent;
                            if(_content) {
                                var _contentLen = _content.length;
                                if(_contentLen > 20) {
                                    _content =  _content.substring(0, 20) + "..."
                                }
                            }

                            var _postExercise = {
                                id: _exercise.id,
                                tno: _exercise.tno,
                                cid: _exercise.cid,
                                eid: _exercise.eid,
                                exerciseTitle: _exercise.exerciseTitle,
                                exerciseContent: _content,
                                options: _exercise.options,
                                type: _exercise.type,
                                createdAt: _exercise.createdAt,
                                answer: dbAnswer
                            };
                            _newExercises.push(_postExercise);
                            count++;
                            next();
                        });

                    },
                    function (err) {
                        res.send(_newExercises);
                    });
            }
        });
});

router.get('/postexercises/:id', function (req, res) {
    var _id = req.params.id;
    require('../models').PostExercise.find({where: {id: _id}})
        .complete(function (err, dbPostExercise) {
            if (!err && dbPostExercise) {
                var pid = dbPostExercise.id;
                require('../models').Answer.find({where: {eid: pid}}).complete(function (err, dbAnswer) {
                    var _postExercise = {
                        id: dbPostExercise.id,
                        tno: dbPostExercise.tno,
                        cid: dbPostExercise.cid,
                        eid: dbPostExercise.eid,
                        exerciseTitle: dbPostExercise.exerciseTitle,
                        exerciseContent: dbPostExercise.exerciseContent,
                        options: dbPostExercise.options,
                        type: dbPostExercise.type,
                        createdAt: dbPostExercise.createdAt,
                        answer: dbAnswer
                    };
                    res.send(_postExercise);
                });
            }
        });
});

router.get('/courses', function (req, res) {
    var _speaker = req.session.auth;
    require('../models').Course.findAll({ where: {tid: _speaker.id}})
        .complete(function (err, courses) {
            if (!err && courses) {
                res.send(courses)
            }
        });
});

router.get('/exercises', function (req, res) {
    var _cid = url.parse(req.url, true).query.courseId;

    var Course = require('../models').Course;
    var Exercise = require('../models').Exercise;

    Course.hasMany(Exercise, {through: 'course_exercise'})
    Exercise.hasMany(Course, {through: 'course_exercise'})
    Course.find({ where: {id: _cid}})
        .complete(function (err, course) {
            course.getExercises({attributes: ['exercise.id', 'type', 'title', 'content', 'answer', 'options']}).success(function (exercises) {
                var _exeArray = [];
                for (var i = 0; i < exercises.length; i++) {
                    _exeArray.push(exercises[i].selectedValues);
                }
                res.send(_exeArray);
            })
        });
});

router.get('/exercises/:id', function (req, res) {
    var _eid = req.params.id;
    require('../models').Exercise.find({ where: {id: _eid}})
        .complete(function (err, exercise) {
            if (!err && exercise) {
                res.send(exercise)
            }
        });
});

router.get('/courses/:id', function (req, res) {
    var _speaker = req.session.auth;
    var cid = req.params.id;
    var _jsonResult = {};
    require('../models').Course.find({ where: {id: cid}})
        .complete(function (err, course) {
            if (!err && course) {
                require('../models').Student.count({ where: {classname: course.classname}})
                    .complete(function (err, numOfStudent) {

                        require('../models').CourseExercise.count({where : {courseId : cid}})
                            .complete(function (err, numOfExercise) {
                                var _course = {
                                    id : course.id,
                                    title : course.title,
                                    classname : course.classname,
                                    tid : course.tid,
                                    createdAt : course.createdAt,
                                    numOfStudent : numOfStudent,
                                    numOfExercise: numOfExercise
                                };
                                res.send(_course);
                            });
                    });
            }
        });
});

router.get('/students', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var _classname = query.classname;
    if (!_classname) {
        console.log('缺少请求参数classname');
        res.send([]);
        return false;
    }
    require('../models').Student.findAll({ where: {classname: _classname}})
        .complete(function (err, students) {
            if (!err && students) {
                res.send(students)
            }
        });
});

module.exports = router;
