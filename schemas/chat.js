var mongoose       = require('mongoose');
var AudienceSchema = require('./audience');

var Audience = mongoose.model('Audience', AudienceSchema);

var ChatSchema = new mongoose.Schema({
    title       : String,
    status      : String,
    beginTime   : Date,
    audiences   : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Audience'}],
    questions   : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question'}]
});

ChatSchema.statics = {
    findById : function(chatId, cb) {
        return this.findOne({_id : chatId}).populate('questions audiences').exec(cb);
    },

    getAudienceChat : function(audienceId, cb) {
        this.findOne({'audiences': audienceId})
            .populate('questions')
            .populate('speaker', '_id name')
            .select('_id title status beginTime questions').exec(cb);
    },

    getQuestions : function(questionRefs, cb) {
        return this.find({questions : questionRefs}).exec(cb);
    }

};

module.exports = ChatSchema;