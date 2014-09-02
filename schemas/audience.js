var mongoose = require('mongoose');

var AudienceSchema = new mongoose.Schema({
    uid      : String,
    name     : String,
    password : String
});

AudienceSchema.statics = {
    fetchAll : function(cb) {
        return this.find({}).exec(cb);
    },

    getById : function(uid,cb) {
        return this.findOne({uid : uid}).exec(cb);
    },
    findByUIDAndPassword: function(uid, password, cb) {
        return this.findOne({uid : uid, password: password}).exec(cb);
    }
};

module.exports = AudienceSchema;