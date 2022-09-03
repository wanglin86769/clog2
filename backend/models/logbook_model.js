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
}, {
    collection: 'logbook'
})

module.exports = mongoose.model('Logbook', LogbookSchema);