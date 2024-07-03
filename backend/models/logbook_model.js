let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let LogbookSchema = new Schema({
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
    },
    name: {
        type: String,
        required: true
    },
    number: Number,
    description: String,
    admins: {
        type: [String],
        default: undefined,
        ref: 'User',
    },
    members: {
        type: [String],
        default: undefined,
        ref: 'User',
    },
    observers: {
        type: [String],
        default: undefined,
        ref: 'User',
    },
}, {
    collection: 'logbook'
})

module.exports = mongoose.model('Logbook', LogbookSchema);