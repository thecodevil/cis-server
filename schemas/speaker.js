var mongoose = require('mongoose');
var Chat =  mongoose.model('Chat', require('./chat'));

var SpeakerSchema = new mongoose.Schema({
    uid      : String,
    name     : String,
    password : String,
    chats    : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }]
});


SpeakerSchema.statics = {

    findByUID : function(uid, cb) {
        return this.findOne({
            uid : uid
        }).exec(cb);
    },

    findById : function(id, cb) {
      return this.findOne({
          _id : id
      }).populate('chats').exec(cb);
    },

    findByUIDAndPassword : function(uid, password, cb) {
        return this.findOne({
            uid      : uid,
            password : password
        }).exec(cb);
    }
};

SpeakerSchema.methods = {
};

module.exports = SpeakerSchema;