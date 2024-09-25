let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let TagSchema = new Schema({
    logbook: {
        type: Schema.Types.ObjectId,
        ref: 'Logbook',
    },
    name: {
        type: String,
        required: true
    },
    number: Number,
    description: String,
}, {
    collection: 'tag'
})

module.exports = mongoose.model('Tag', TagSchema);