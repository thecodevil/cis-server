var mongoose = require('mongoose');

var ChatQuestionSchema = new mongoose.Schema({
    chat     : { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    question : { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    status   : String
});

ChatQuestionSchema.statics = {
    findByChat : function(chat, cb) {
        return this.find({chat : chat}).populate('question', '_id title detail refAnswer').exec(cb);
    }
};

module.exports = ChatQuestionSchema;