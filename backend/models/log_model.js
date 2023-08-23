let mongoose = require('mongoose');
let Schema = mongoose.Schema;


let Attachment = new Schema({
    name: String,
    size: Number,
    contentType: String,
    // content: Buffer,  // Attachment content is stored in file system
});


const History = new mongoose.Schema({
    active: Boolean,
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    lastActiveAt: Date,
    logbook: Schema.Types.ObjectId,
    tags: [Schema.Types.ObjectId],
    category: String,
    title: String,
    description: String,
    attachments: [Attachment],
});


let LogSchema = new Schema({
    /* Meta data */
    active: {
        type: Boolean,
        default: true
    },
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
    lastActiveAt: {
        type: Date,
        required: true
    },

    /* Archiver data */
    histories: {
        type: [History],
        default: void 0
    },

    /* Actual data */
    logbook: {
        type: Schema.Types.ObjectId,
        ref: 'Logbook',
        required: true
    },
    tags: {
        type: [Schema.Types.ObjectId],
        ref: 'Tag',
        default: void 0
    },
    category: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // Attachments are stored in file system
    // attachments: {
    //     type: [Attachment],
    //     default: void 0
    // }
}, {
    collection: 'log'
});


module.exports = mongoose.model('Log', LogSchema);