/*!
 *
 * @author JD.Young.Yang
 * @since 2014-05-23
 *
 */

var StudentIOHandler = function() {
    this.chatService    = require('../service/service.chat');
    this.studentService = require('../service/service.student');
};

StudentIOHandler.prototype = {

    emit : function(socket, topic, data) {
        socket.emit(topic, data);
    },

    onListen : function(socket) {
        var _this = this;

        /**
         * 学生申请加入课堂
         * 1. 发送申请消息给老师
         */
        socket.on('student:applyToJoinClass', function(params) {
            console.log('学生申请加入课堂');
            var _student = socket.handshake.decoded_token;
            var _sno     = _student.sno;
            _this.chatService.addToWaitingQueue(_student, socket);
            _this.chatService.getTeacherSocket(function(socket) {
                socket.emit('teacher:applyToJoinClass', {
                    sno: _sno
                });
            });
        });

        /**
         * 学生收到教师的邀请信息后，发送回来[acceptInvitation]的”接受邀请“的反馈信息
         * 1. 学生加入课堂
         * 2. 通知教师学生成功进入课堂
         */
        socket.on('student:acceptInvitation', function(params) {
            var _student = socket.handshake.decoded_token;
            var _sno     = _student.sno;

            console.log('学生[' + _sno +']正在接收教师的邀请');
            var _courseId = _this.chatService.studentJoinClass(socket, _student);
            // 通知学生客户端成功加入课堂
            socket.emit('student:joinedSuccess', {
                cid : _courseId
            });
            // 通知教师学生成功加入课堂
            _this.chatService.getTeacherSocket(function(socket) {
                socket.emit('teacher:studentJoinedSuccess', {
                    sno: _sno
                });
            });
        });

        /**
         * 学生更新当前上课状态，实时反馈给教师
         */
        socket.on('student:updateStatus', function (params) {
            var _sno = socket.handshake.decoded_token.sno;
            console.log('学生[' + _sno + ']更新状态[' + params.status + ']');
            _this.chatService.getTeacherSocket(function(teacherSocket) {
                teacherSocket.emit('teacher:updateStatus', {
                    sno    : _sno,
                    status : params.status
                });
            });
            socket.emit('student:updateStatusSuccess');

        });

        /**
         * 学生提交答案，保存答案到数据库，保存成功后通知教师自己的答案
         */
        socket.on('student:postAnswer', function(params) {
            var _sno = socket.handshake.decoded_token.sno;
            console.log('学生[' + _sno + ']提交答案');
            _this.studentService.postAnswer(
                _sno,
                params.eid,
                params.cid,
                params.answer,
                function(dbAnswer) {
                    _this.chatService.getTeacherSocket(function(teacherSocket) {
                        teacherSocket.emit('teacher:postAnswer', {
                            sno    : _sno,
                            answer : params.answer
                        });
                    });
                }
            );
        });

        /**
         * 学生退出应用
         */
        socket.on('student:leave', function(params) {
            var _sno = socket.handshake.decoded_token.sno;
            console.log('学生[' + _sno + ']退出应用');
            _this.chatService.onStudentLeave(socket);
            _this.chatService.getTeacherSocket(function(teacherSocket) {
                teacherSocket.emit('teacher:studentLeave', {
                    sno    : _sno
                });
            });
        });
    }

};

var studentIOHandler = module.exports = exports = new StudentIOHandler;
