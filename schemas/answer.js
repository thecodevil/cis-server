var mongoose       = require('mongoose');
//mongoose.set('debug', true);

var AnswerSchema = new mongoose.Schema({
    chat     : mongoose.Schema.Types.ObjectId,
    audience : mongoose.Schema.Types.ObjectId,
    question : {qid : mongoose.Schema.Types.ObjectId, title : String, detail : String, qtype:String,choices:[String]},
    content  : String,
    time     : Date
});

AnswerSchema.statics = {
    findSelfCurrentChatAnswers : function(audienceId, chatId, cb) {
        return this.find({
            'chat'     : chatId,
            'audience' : audienceId
        }).select('question time content').exec(cb);
    }
};

module.exports = AnswerSchema;