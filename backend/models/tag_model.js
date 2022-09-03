let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let TagSchema = new Schema({
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