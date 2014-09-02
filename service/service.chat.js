/*!
 * This service is mainly for processing
 * all business logic about chat
 *
 * @author JD.Young.Yang
 * @since 2014-05-13
 *
 */

var ChatService = function () {
    this.courseId;
    this.teacherSocket;

    this.waittingNum = 0;
    this.waittingSockets = {};
    this.waittingAudiences = {};


    this.numOfStudent   = 0;
    this.students       = {};
    this.studentSockets = {};
};

ChatService.prototype = {



    onTeacherJoin : function(courseId, socket) {
        socket.join(courseId);
        this.courseId = courseId;
        console.log('当前会话/课程[id=' + this.courseId + ']');
        this.teacherSocket = socket;
    },

    onAudienceJoin : function(student, socket, cb) {

        if(this.studentSockets[student.sno] || this.waittingSockets[student.sno]) {
            console.log('[' + student.sno + ']重复登陆, 断开旧连接');
            var _oldSocket = this.getStudentSocket(student.sno);
            if(!_oldSocket) {
                _oldSocket = this.waittingSockets[student.sno];
            }
            this.onStudentLeave(_oldSocket);
        }

        this.studentSockets[student.sno] = socket;
        console.log(student.sno + '[' + socket.id + ']成功连接服务器');

        if(!this.courseId) {
            this.waittingNum ++;
            //this.waittingSockets[student.sno] = socket;
            console.log('共有' + this.waittingNum + '个学生在等待课程开始...');
            return null;
        }

        if(student && socket && this.courseId) {
            socket.join(this.courseId);
            console.log('线上人数[' + (++ this.numOfStudent) + ']');
            //this.studentSockets[student.sno] = socket;
        }
        return this.courseId;
    },

    moveFromWaitQueueToWorkingQueue: function(sno, socket) {
        //this.waittingNum --;
        //delete this.waittingSockets[sno];
        console.log('共有' + (--this.waittingNum) + '个学生在等待课程开始...');
        this.studentSockets[sno] = socket;
        socket.join(this.courseId);
        console.log('线上人数[' + (++ this.numOfStudent) + ']');

        // 通知学生客户端成功加入课堂
        socket.emit('student:joinedSuccess', {
            cid : this.courseId
        });
        // 通知教师学生成功加入课堂
        this.teacherSocket.emit('teacher:studentJoinedSuccess', {
            sno: sno
        });
    },

    studentJoinClass : function(socket, student) {
        var _sno = student.sno;
        socket.join(this.courseId);
        this.students[socket.id] = student;
        this.studentSockets[student.sno] = socket;
        console.log('学生['+  _sno + ']加入课堂[' + this.courseId + '], 线上人数[' + (++ this.numOfStudent) + '], 等待人数[' + (--this.waittingNum) + "]");
        return this.courseId;
    },

    checkDuplicate : function(student) {
        var _sno = student.sno;
        var _oldSocket = this.getStudentSocket(_sno);
        if(_oldSocket) {
            console.log('[' + student.sno + ']重复登陆, 断开旧连接');
            this.onStudentLeave(_oldSocket);
        }
    },

    addToWaitingQueue : function(student, socket) {
        this.checkDuplicate(student);
        this.students[socket.id] = student;
        this.studentSockets[student.sno] = socket;
        console.log('学生进入等待队列, 线上人数[' + (this.numOfStudent) + '], 等待人数[' + (++ this.waittingNum) + "]");
    },

    getStudentSocket : function(sno) {
        return this.studentSockets[sno];
    },

    getTeacherSocket : function (callback) {
        if(this.teacherSocket) {
            callback(this.teacherSocket);
        }
    },

    onStudentLeave : function(socket) {
        var _student = this.students[socket.id];
        console.log(socket.id + '对应的[' + _student.sno + ']断开连接');
        if(this.courseId) {
            console.log('学生[' + _student.sno + ', ' + _student.name +']退出了课堂[' + this.courseId + '], 线上人数[' + (-- this.numOfStudent) + '], 等待人数[' + (this.waittingNum) + ']');
            socket.leave(this.courseId);
        } else if(this.courseId == -1) {
            console.log('学生[' + _student.sno + ', ' + _student.name +']退出了课堂[' + this.courseId + '], 线上人数[' + (--this.numOfStudent) + '], 等待人数[' + (this.waittingNum) + ']');
        } else {
            console.log('学生[' + _student.sno + ', ' + _student.name +']退出了课堂[' + this.courseId + '], 线上人数[' + (this.numOfStudent) + '], 等待人数[' + (--this.waittingNum) + ']');
        }
        delete this.studentSockets[_student.sno];
        delete this.students[socket.id];
        socket.disconnect();
    },

    onClassOver : function() {
        this.courseId = -1;
    }

};

var chatService = module.exports = exports = new ChatService;