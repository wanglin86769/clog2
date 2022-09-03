let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let GroupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    number: Number,
    description: String,
}, {
    collection: 'group'
})

module.exports = mongoose.model('Group', GroupSchema);