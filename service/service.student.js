/*!
 *
 * @author JD.Young.Yang
 * @since 2014-05-13
 *
 */


var AudienceService = function() {
    this.chatService = require('../service/service.chat');
    this.userService = require('../service/service.user');

    this.teacherIOHandler   = require('../iohandler/teacherIOHandler');

    this.db = require('../models');
};

AudienceService.prototype = {

    acceptInvitation : function(socket) {
        var _sno = socket.handshake.decoded_token.sno;
        console.log('[' + _sno +']正在接收教师的邀请');
        this.chatService.moveFromWaitQueueToWorkingQueue(_sno, socket);
    },

    /**
     * 学生提交答案，答案保存到数据库(answer表)
     * sno : 学号(作答人id)
     * eid : 题目id(exercise id)
     * cid : 课程id(course id)
     * answer :　学生作答答案
     * @param sno
     * @param eid
     * @param cid
     * @param answer
     */
    postAnswer : function(sno, eid, cid, answer, callback) {
        this.db.Answer
            .create({
                sno    : sno,
                eid    : eid,
                cid    : cid,
                answer : answer
            })
            .complete(function(err, dbAnswer) {
                if (!!err) {
                    console.log('答案保存失败', err);
                } else {
                    callback(dbAnswer);
                    console.log('答案保存成功');
                }
            });
    },

    join : function(topic, me, socket) {
        var _chatService = this.chatService;
        var _chat = _chatService.onAudienceJoin(me, socket);
        /*if(_chat) {
            console.log(me.name + "加入对话[" + _chat.title + "]");
            this.Answer.findSelfCurrentChatAnswers(me._id, _chat._id, function(err, dbAnswers) {
                if(!err && dbAnswers) {
                    socket.emit(topic, {
                        audience  : me,
                        chat      : _chat,
                        answers   : dbAnswers,
                        status    : 'success'
                    });
                    _chatService.getTeacherSocket().emit('speaker:onAudienceJoined', {
                        audience : me
                    });
                } else {
                    console.log('err = ' + err)
                }
            });
        }*/
    }

    /*onInvite : function(topic, me, socket) {
        this.join('onJoin', me, socket);
        var _speakerSocket = this.chatService.getSpeakerSocket();
        if(_speakerSocket) {
            _speakerSocket.emit(topic , {

            });
        }
    },*/

    /*postAnswer : function(me, question, content, socket) {
        var _this = this;
        var _chat = _this.chatService.getChat();
        var _answer = new _this.Answer({
            content    : content,
            audience   : me._id,
            chat     : _chat._id,
            question : {qid:question._id,title:question.title,detail:question.detail,qtype:question.qtype,choices:question.choices}
        });

        _answer.save(function(err, dbAnswer) {
            if(!err) {
                _this.Question.findById(question._id, function(err, dbQuestion) {
                    dbQuestion.answers.push({
                        aid : dbAnswer._id,
                        content : dbAnswer.content,
                        from : me.name
                    });
                    var _speakerSocket = _this.chatService.getSpeakerSocket();
                    if(_speakerSocket) {
                        _speakerSocket.emit('speaker:onAnswer', {
                            audienceName   : me.name,
                            answer         : content,
                            theQuestion    : dbQuestion
                        });
                    }
                });
                _this.Answer.findSelfCurrentChatAnswers(me._id, _chat._id, function (err, dbAnswers) {

                    socket.emit('audience:refreshQuestions', {
                        answers : dbAnswers
                    });
                });
            }
        });
    },

    onFetchAnswers : function(me, socket) {
        var _this = this;
        var _chat = _this.chatService.getChat();
        _this.Answer.findSelfCurrentChatAnswers(me._id, _chat._id, function (err, dbAnswers) {
            socket.emit('audience:refreshQuestions', {
                answers : dbAnswers
            });
        });
    },

    onLeave : function(socket) {
        this.chatService.onAudienceLeave(socket);
        var _speakerSocket = this.chatService.getSpeakerSocket();
        if(_speakerSocket) {
            _speakerSocket.emit('speaker:onAudienceLeave', {
                audienceId : socket.userId
            });
        }
        //socket.emit('audience:onLeft');
    }*/

};

var audienceService = module.exports = exports = new AudienceService;