/*!
 *
 * @author JD.Young.Yang
 * @since 2014-05-13
 *
 */

var TeacherService = function () {
    this.chatService = require('../service/service.chat');
    this.db = require('../models');

};

TeacherService.prototype = {

    /**
     * 教师正式开始上课(即打开通信会话[id=courseId])
     * @param courseId
     */
    beginCourse : function(courseId, socket) {
        // 教师加入会话
        this.chatService.onTeacherJoin(courseId, socket);
        // 发送广播邀请信息给所有等待中的学生(即发送广播消息给在同一个会话中的学生)
        socket.broadcast.emit('student:onInvite', {});
    },

    /**
     * 教师广播问题
     * @param exercise
     * @param tno
     * @param cid
     * @param callback
     */
    postExercise : function(exercise, tno, cid, callback) {
        this.db.PostExercise
            .create({
                tno  : tno,
                eid  : exercise.id,
                cid  : cid,
                type : exercise.type,
                exerciseTitle : exercise.title,
                exerciseContent: exercise.content,
                options : exercise.options
            })
            .complete(function(err, postexercise) {
                if (!!err) {
                    console.log('发布题目保存失败', err);
                } else {
                    console.log('发布题目[' + postexercise.id + '[保存成功');
                    callback(postexercise);
                }
            });
    },

    /**
     * 教师广播开放问题
     * @param exercise
     * @param tno
     * @param cid
     * @param callback
     */
    postOpenExercise : function(teacher, cid, callback) {
        var _this = this;
        this.db.Exercise
            .create({
                tid     : teacher.id,
                type    : 3,
                content : '这是一道开放问题，请留意听老师说的问题哦！',
                title   : '开放问题',
                cid     : cid,
                answer  : ''
            })
            .complete(function(err, dbExercise) {
                if (!!err) {
                    console.log('开放题目保存失败', err);
                } else {
                    console.log('开放题目[' + dbExercise.id + '[保存成功');
                    _this.postExercise(dbExercise, teacher.tno, cid, callback);
                }
            });
    }

    /*join : function (me, chatId, socket) {
        var _this = this;
        _this.Chat.findById(chatId, function(err, dbChat) {
            _this.chatService.onSpeakerJoin(me, dbChat, socket);
            socket.emit('speaker:onJoined', {
                speaker : me,
                chat    : dbChat
            });
            socket.broadcast.emit('audience:onInvite', {
                speaker : me
            });
        });
    },

    broadcastQuestions : function (qid, qTitle, qDetail, socket) {
        if (data.chat) {
            var _data;
            if(data.msgType == 'question') {
                socket.broadcast.to(data.chat._id).emit('fromSpeaker', {
                    msg        : data.msg,
                    from       : data.from,
                    msgType    : data.msgType,
                    questionId : data.questionId
                });
            } else {
                socket.broadcast.to(data.chat._id).emit('fromSpeaker', {
                    msg     : data.msg,
                    from    : data.from,
                    msgType : data.msgType
                });
            }
        }
    },

    queryQuestionDetail: function (speakerId, questionId) {
        var _this = this;
        var _question = _this.Question.findById(questionId);
        var _speakerSocket = _this.userService.getSpeakerSocket(speakerId);
        _speakerSocket.emit('queryQuestionDetail', {question: _question});
    },

    getChats: function (speakerId, socket) {
        var _this = this;
        this.Speaker.findById(speakerId, function(err, speaker) {
            var _chats = speaker.chats;

            if(_chats && _chats.length > 0) {
                _this.Chat.findById(_chats[0]._id, function(err, dbChat) {
                    socket.emit('speaker:getChats', {
                        speaker   : speaker,
                        firstChat : dbChat
                    });
                });
            }

        });
    },

    onLeave : function(socket) {
        this.chatService.onSpeakerLeave(socket);
    }*/

};

var teacherService = module.exports = exports = new TeacherService;