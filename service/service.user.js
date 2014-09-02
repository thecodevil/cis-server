var UserService = function () {
    this.speakers = [];
    this.speakerSocketsQueue = {};
    this.audienceSocketsQueue = {};

    this.db = require('../models');
};

UserService.prototype = {

    login : function(userId, password, callback) {
        var _this = this;
        var _len = userId.length;
        // 如果角色是教师
        if(_len == 4) {
            this.db.Teacher.find({ where : {tno : userId, password : password}})
                .complete(function(err, dbTeacher) {
                    if(!!err || !dbTeacher) {
                        callback('failed');
                    } else {
                        console.log('教师[' + dbTeacher.tno + ']成功登陆');
                        var _entity = {
                            id : dbTeacher.id,
                            tno : dbTeacher.tno,
                            name : dbTeacher.name,
                            role : dbTeacher.role,
                            position: 'teacher'
                        };
                        callback('success', 'teacher', _entity);
                    }
                });
        } else {
            this.db.Student.find({ where : {sno : userId, password : password}})
                .complete(function(err, dbStudent) {
                    if(!!err || !dbStudent) {
                        callback('failed', dbStudent);
                    } else {
                        console.log('学生[' + dbStudent.sno + ']成功登陆');
                        var _entity = {
                            id : dbStudent.id,
                            sno : dbStudent.sno,
                            name : dbStudent.name,
                            classname : dbStudent.classname,
                            position: 'student'
                        };
                        callback('success', 'student', _entity);
                    }
                });
        }

        /*if (_this.isSpeaker(userId)) {
            _this.Speaker.findByUIDAndPassword(userId, password, function (err, dbSpeaker) {
               if(!err && dbSpeaker) {
                   callback('success', 'speaker', dbSpeaker);
               } else {
                   callback('failed', dbSpeaker);
               }

            });
        } else if (_this.isAudience(userId)) {
            _this.Audience.findByUIDAndPassword(userId, password, function (err, dbAudience) {
                if(!err && dbAudience) {
                    callback('success', 'audience', dbAudience);
                } else {
                    callback('failed', dbAudience);
                }
            });
        }*/
    },

    loginWithSocket: function (name, password, socket, callback) {
        var _this = this;
        if (_this.isSpeaker(name)) {
            _this.Speaker.findByNameAndPassword(name, password, function (err, dbSpeaker) {
                if (!err && dbSpeaker) {
                    _this.pushSpeaker(dbSpeaker, socket);
                    socket.emit('login', {
                        userId: dbSpeaker.id,
                        userName: name,
                        role: 'speaker',
                        chatIds: dbSpeaker.chatIds
                    });
                }
            });
        } else if (_this.isAudience(name)) {
            _this.Audience.findByNameAndPassword(name, password, function (err, dbAudience) {
                if (!err && dbAudience) {
                    _this.pushAudience(dbAudience.id, socket);
                    /*var _speakerSocket = _this.getSpeakerSocket(_chat.speakerId);
                     if(_speakerSocket) {
                     _speakerSocket.emit('newAudienceJoined', {fromId : dbAudience.id, newAudience : name});
                     }*/
                    socket.emit('login', {
                        userId: dbAudience.id,
                        userName: name,
                        role: 'audience'
                    });
                }
            });
        }
    },

    pushAudience: function (audience, socket) {
        this.audienceSocketsQueue[audience._id] = socket;
    },

    pushSpeaker: function (speaker, socket) {
        this.speakerSocketsQueue[speaker._id] = socket;
        this.speakers.push(speaker);
    },

    getAudienceSocket: function (audience) {
        return this.audienceSocketsQueue[audience._id];
    },

    getSpeakerSocket: function (speakerId) {
        return this.speakerSocketsQueue[speakerId];
    },

    getSpeaker: function (speakerId) {
        for (var i = 0, len = this.speakers.length; i < len; i++) {
          var _speaker = this.speakers[i];
            if(_speaker.id = speakerId) {
                return _speaker;
            }
        }
    },

    isSpeaker: function (name) {
        return name.substring(0, 3) != 'uid';
    },

    isAudience: function (name) {
        return name.substring(0, 3) == 'uid';
    }
};

var userService = module.exports = exports = new UserService;