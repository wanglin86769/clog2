let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let AccountSchema = new Schema({
    random: String,
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    },
    createdAt: Date,
    verifiedAt: Date,
    updatedAt: Date,
}, {
    collection: 'account'
});

module.exports = mongoose.model('Account', AccountSchema);