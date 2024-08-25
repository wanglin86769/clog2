let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let TemplateSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    number: Number,
    content: {
        type: String,
        required: true
    },

    /* Meta data */
    createdAt: {
        type: Date,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        required: true
    },
    updatedBy: {
        type: String,
        required: true
    },
}, {
    collection: 'template'
})

module.exports = mongoose.model('Template', TemplateSchema);