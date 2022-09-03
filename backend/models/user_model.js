let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    admin: Boolean,
    lastLoginAt: Date,
    thisLoginAt: Date,
}, {
    collection: 'user'
})

module.exports = mongoose.model('User', UserSchema);