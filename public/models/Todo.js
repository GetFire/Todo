var mongoose = require('mongoose');
var TodoSchema = mongoose.Schema;

module.exports = mongoose.model('Todo', new TodoSchema({
    text: String,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}));