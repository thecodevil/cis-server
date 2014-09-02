var mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
    qtype     : String,
    title     : String,
    detail    : String,
    choices   : [String],
    refAnswer : String,
    postTime  : Date,
    answers   : [{
       aid :  mongoose.Schema.Types.ObjectId,
       content : String,
       from    : String
    }],
    creator   : { type: mongoose.Schema.Types.ObjectId,  ref: 'Speaker' }
});
QuestionSchema.statics = {
    findById : function(qid, cb) {
        return this.findOne({_id : qid}).exec(cb);
    }
}

module.exports = QuestionSchema;