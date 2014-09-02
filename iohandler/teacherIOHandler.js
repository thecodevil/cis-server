
var TeacherIOHandler = function() {
    this.chatService     = require('../service/service.chat');
    this.teacherService  = require('../service/service.teacher');
};

TeacherIOHandler.prototype = {

    emit : function(speakerId, topic, data) {
        var _speakerSocket = this.chatService.getSpeakerSocket(speakerId);
        if(_speakerSocket) {
            _speakerSocket.emit(topic, data);
        }
    },

    onListen : function(socket, session) {

        var _this = this;

        /**
         * 教师进入上课界面，预备数据准备好之后，发送的连接请求返回到客户端后，客户端请求正式开始上课
         * 扫描目前正在等待的学生，广播邀请消息
         */
        socket.on('teacher:onCourseBegin', function(params) {
            var _tno = socket.handshake.decoded_token.tno;
            console.log('教师[' + _tno + ']正式上课');
            _this.teacherService.beginCourse(params.courseId, socket)
        });

        socket.on('teacher:inviteStudent', function(params) {
            var _sno = params.sno;
            console.log('教师邀请学生[' + _sno + ']');
            var _studentSocket = _this.chatService.getStudentSocket(_sno);
            if(_studentSocket) {
                _studentSocket.emit('student:onInvite');
            }
        });

        socket.on('teacher:postExercise', function(params) {
            var _tno = socket.handshake.decoded_token.tno;
            var _eid = params.exercise.id;
            var _cid = params.cid;
            console.log('老师[' + _tno + ']发送一条新的题目id[' + _eid + '],课堂id['+ _cid + ']');
            _this.teacherService.postExercise(params.exercise, _tno, _cid, function(postexercise) {
                socket.broadcast.emit('student:doExercise', {
                    exercise : postexercise
                });
            });
        });

        socket.on('teacher:feedback2student', function(params) {
            var _sno = params.sno;
            var _studentSocket = _this.chatService.getStudentSocket(_sno);
            _studentSocket.emit('student:answerPostSuccess');
        });

        /**
         * 老师发送开放问题给学生作答
         * 1. 把开放问题存到数据库
         * 2. 通知学生
         */
        socket.on('teacher:postOpenQuestion', function(params) {
            var _teacher = socket.handshake.decoded_token;
            console.log('教师广播开放问题');
            var _exercise = params.exercise;
            _this.teacherService.postOpenExercise(_teacher, params.cid, function(postexercise) {
                socket.broadcast.emit('student:doExercise', {
                    exercise : postexercise
                });
            });
        });

        socket.on('teacher:classOver', function() {
            console.log('后台收到教师下课消息');
            _this.chatService.onClassOver();
            socket.broadcast.emit('student:classOver');
        });

       /* socket.on('speaker:onChats', function(params) {
            _this.speakerService.getChats(
                socket.handshake.decoded_token._id,
                socket
            );
        });

        socket.on('speaker:getChatDetail', function(params) {

            _this.Chat.findById(params.chatId, function(err, dbChat) {
                socket.emit('speaker:returnChatDetail', {
                    chat : dbChat
                });
            });

        });

        socket.on('speaker:onJoining', function(params) {
            console.log('speaker on joining')
            _this.speakerService.join(
                socket.handshake.decoded_token,
                params.chatId,
                socket);
        });

        socket.on('speaker:onQuestion', function (params) {
            var _chat = _this.chatService.getChat();
            socket.broadcast.to(_chat._id).emit('audience:onQuestion', {
                question: params.question
            });
        });

        socket.on('speaker:onOpenQuestion', function (params) {

            var _q = new _this.Question({
                postTime: params.question.postTime,
                qtype: params.question.qtype,
                title: params.question.title,
                detail: params.question.detail
            });

            _q.save(function(err, dbQ) {
                var _chat = _this.chatService.getChat();
                socket.broadcast.to(_chat._id).emit('audience:onQuestion', {
                    question: dbQ
                });
            });
        });

        socket.on('speaker:onLeave', function(params) {
            _this.speakerService.onLeave(socket);
        });*/
    }
};

var teacherIOHandler = module.exports = exports = new TeacherIOHandler;
