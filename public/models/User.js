var mongoose = require('mongoose');
var UserSchema = mongoose.Schema;

module.exports = mongoose.model('User', new UserSchema({
    name: String,
    password: String,
    admin: Boolean
}));