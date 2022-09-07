const multer  = require('multer');
const upload = multer();
const mongoose = require('mongoose');
const User = require('../models/user_model.js');
const Log = require('../models/log_model.js');


function generateQuery(query, filters) {
    if(filters) {
        for (const [key, value] of Object.entries(filters)) {
            if(!value)  continue;

            switch(key) {
                case 'year':
                    let year = value;
                    let startDate = new Date(year, 0, 1);
                    let endDate = new Date(year + 1, 0, 1);
                    // console.log(startDate);
                    // console.log(endDate);
                    query['createdAt'] = { 
                        $gte: startDate,
                        $lt: endDate
                    };
                    break;
                case 'author':
                    query['createdBy.name'] = { "$regex": value, "$options": "i" };
                    console.log(query);
                    break;
                case 'email':
                    query['createdBy.email'] = { "$regex": value, "$options": "i" };
                    break;
                case 'category':
                    query[key] = value;
                    break;
                case 'tags':
                    query[key] = mongoose.Types.ObjectId(value);
                    break;
                case 'title':
                    query[key] = { "$regex": value, "$options": "i" };
                    break;
                case 'description':
                    query[key] = { "$regex": value, "$options": "i" };
                    break;
                case 'search':
                    query['$and'] = [{
                        $or: [
                            { 'createdBy.name': { "$regex": value, "$options": "i" } },
                            { 'createdBy.email': { "$regex": value, "$options": "i" } },
                            { title: { "$regex": value, "$options": "i" } },
                            { description: { "$regex": value, "$options": "i" } },
                            { 'attachments.name': { "$regex": value, "$options": "i" } },
                        ]
                    }];
                    break;
                default:
                    console.log("Unknown query parameter: " + key + ", " + value)
                    break;
            }
        }
    }
}


function generateSort(sort, sortField, sortOrder) {
    if(sortField && sortOrder) {
        sort[sortField] = sortOrder;
    }

    if(!sort['updatedAt'])  sort['updatedAt'] = -1;
}


exports.findLastActive = async (req, res, next) => {
    let logbook = req.query.logbook;
    if(!logbook) {
        return res.status(401).json({ message: 'Logbook is not specified.' });
    }

    try {
        let data = await Log.aggregate([
            { 
                $match: {
                    logbook: mongoose.Types.ObjectId(logbook),
                    active: true
                }
            },
            {
                $sort: { 
                    updatedAt: -1 
                }
            },
            { 
                $limit: 1
            },
            {
                $project: {
                    _id: 0,  
                    'lastActive': '$updatedAt'  //aliasing 
                }
            }
        ]);
            
        if(!data || !data[0]) {
            res.json(null);
        } else {
            res.json(data[0]);
        }
    } catch(error) {
        res.status(500).json({message: error.message})
    }
}


exports.findLogs = async (req, res, next) => {
    if(!req.query.logbook) {
        return res.status(401).json({ message: 'Logbook is not specified.' });
    }

    if(!req.query.lazyEvent) {
        return res.status(401).json({ message: 'No lazy loading parameter is specified.' });
    }

    let lazyEvent = JSON.parse(req.query.lazyEvent);

    // console.log(lazyEvent);
    let logbook = req.query.logbook;

    let first = lazyEvent.first;
    let rows = lazyEvent.rows;
    let sortField = lazyEvent.sortField;
    let sortOrder = lazyEvent.sortOrder;
    let filters = lazyEvent.filters;

    if(isNaN(first) || isNaN(rows)) {
        return res.status(401).json({ message: 'Starting data and quantity are not specified.' });
    }

    let query = { active: true, logbook: mongoose.Types.ObjectId(logbook) };
    generateQuery(query, filters);

    let sort = {};
    generateSort(sort, sortField, sortOrder);

    // console.log(query);
    // console.log(sort);

    let pipeline = [
        {
            $lookup: {
                from:"user",
                localField: "createdBy",
                foreignField: "email",
                as: "createdBy"
            }
        },
        {
            $unwind: {
                path: '$createdBy',
                preserveNullAndEmptyArrays: true
            }
        },
        { 
            $match: query 
        },
        {
            $facet: {
                totalCount: [
                    {
                        $count: 'count'
                    }
                ],
                paginatedResults: [
                    {
                        $sort: sort
                    },
                    { 
                        $skip: first
                    },
                    { 
                        $limit: rows
                    },
                    {
                        $lookup: {
                            from:"user",
                            localField: "updatedBy",
                            foreignField: "email",
                            as: "updatedBy"
                        }
                    },
                    {
                        $unwind: {
                            path: '$updatedBy',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from:"logbook",
                            localField: "logbook",
                            foreignField: "_id",
                            as: "logbook"
                        }
                    },
                    {
                        $unwind: {
                            path: '$logbook',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from:"tag",
                            localField: "tags",
                            foreignField: "_id",
                            as: "tags"
                        }
                    },
                    { 
                        $project: { 
                            'attachments.content': 0
                        } 
                    }
                ]
            }
        }
    ];

    // console.log(pipeline);

    try {
        let results = await Log.aggregate(pipeline);

        // console.log(results);

        let finalData = {};

        if(results && results.length === 0) {
            finalData.entries = [];
            finalData.count = 0;
            return res.json(finalData);
        }

        let data = results[0];

        if(!data.paginatedResults || data.paginatedResults.length === 0 || !data.totalCount || data.totalCount.length === 0) {
            finalData.entries = [];
            finalData.count = 0;
        } else {
            finalData.entries = data.paginatedResults;
            finalData.count = data.totalCount[0].count;
        }

        // console.log(finalData.entries);

        // Post process for history authors
        for(let log of finalData.entries) {
            if(Array.isArray(log.histories) && log.histories.length) {
                for(let history of log.histories) {
                    let user;
                    if(history.createdBy) {
                        user = await User.findOne({ email: history.createdBy });
                        history.createdBy = user ? { email: user.email, name: user.name } : { email: '', name: '' };
                    }
                    if(history.updatedBy) {
                        user = await User.findOne({ email: history.updatedBy });
                        history.updatedBy = user ? { email: user.email, name: user.name } : { email: '', name: '' };
                    }
                }
            }
        }

        // console.log(finalData);
        res.json(finalData);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
}


exports.findLog = async (req, res, next) => {
    let pipeline = [
        { 
            $match: { _id: mongoose.Types.ObjectId(req.params.logId) }
        },
        {
            $lookup: {
                from:"user",
                localField: "createdBy",
                foreignField: "email",
                as: "createdBy"
            }
        },
        {
            $unwind: {
                path: '$createdBy',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from:"user",
                localField: "updatedBy",
                foreignField: "email",
                as: "updatedBy"
            }
        },
        {
            $unwind: {
                path: '$updatedBy',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from:"logbook",
                localField: "logbook",
                foreignField: "_id",
                as: "logbook"
            }
        },
        {
            $unwind: {
                path: '$logbook',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from:"tag",
                localField: "tags",
                foreignField: "_id",
                as: "tags"
            }
        },
        { 
            $project: { 
                'attachments.content': 0
            } 
        },
    ]

    try {
        let data = await Log.aggregate(pipeline);
        if(!data || !data[0])  return res.json(null);
            
        // Post process for history authors
        let log = data[0];
        if(Array.isArray(log.histories) && log.histories.length) {
            for(let history of log.histories) {
                let user;
                if(history.createdBy) {
                    user = await User.findOne({ email: history.createdBy });
                    history.createdBy = user ? { email: user.email, name: user.name } : { email: '', name: '' };
                }
                if(history.updatedBy) {
                    user = await User.findOne({ email: history.updatedBy });
                    history.updatedBy = user ? { email: user.email, name: user.name } : { email: '', name: '' };
                }
            }
        }

        let result = data[0];
        res.json(result);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
}


exports.createLog = async (req, res, next) => {
    if(!req.headers['user']) return res.status(500).json({message: 'No user information is extracted.'});
    
    let timeNow = new Date();
    req.body.createdAt = timeNow;
    req.body.createdBy = req.headers['user'].email;
    req.body.updatedAt = timeNow;
    req.body.updatedBy = req.headers['user'].email;
    req.body.lastActiveAt = timeNow;

    try {
        let data = await Log.create(req.body);
        res.json(data)
    } catch(error) {
        res.status(500).json({message: error.message})
    }
}


exports.updateLog = async (req, res, next) => {
    if(!req.headers['user']) return res.status(500).json({message: 'No user information is extracted.'});

    let timeNow = new Date();
    req.body.updatedAt = timeNow;
    req.body.updatedBy = req.headers['user'].email;
    req.body.lastActiveAt = timeNow;

    try {
        let origin = await Log.findById(req.params.logId);
        if(!origin) return res.status(400).json({ message: 'The specified log was not found.' });

        historyItem = {};
        historyItem.createdAt = origin.createdAt;
        historyItem.createdBy = origin.createdBy;
        historyItem.updatedAt = origin.updatedAt;
        historyItem.updatedBy = origin.updatedBy;
        historyItem.lastActiveAt = origin.lastActiveAt;
        historyItem.logbook = origin.logbook;
        historyItem.tags = origin.tags;
        historyItem.category = origin.category;
        historyItem.title = origin.title;
        historyItem.description = origin.description;

        let push = { histories: historyItem };

        let data = await Log.findByIdAndUpdate(req.params.logId, { $set: req.body, $push: push }, { new: true });
        res.json(data);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
}


exports.createLogFormData = [upload.array('attachments', 20), async (req, res, next) => {
    let user = req.headers['user'];
    if(!user) return res.status(500).json({message: 'No user information is extracted.'});

    // console.log(req.body);
    
    let log = JSON.parse(req.body.log);
    // console.log(log);
    let timeNow = new Date();
    log.createdAt = timeNow;
    log.createdBy = user.email;
    log.updatedAt = timeNow;
    log.updatedBy = user.email;
    log.lastActiveAt = timeNow;

    let attachments = [];
    if(Array.isArray(req.files) && req.files.length) {
        for(let file of req.files) {
            attachments.push({
                'name': file.originalname,
                'size': file.size,
                'contentType': file.mimetype,
                'content': file.buffer,
            });
        }
    }
    log.attachments = attachments;

    try {
        let data = await Log.create(log);
        res.json(data);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
}];


exports.updateLogFormData = [upload.array('attachments', 20), async (req, res, next) => {
    let user = req.headers['user'];
    if(!user) return res.status(500).json({message: 'No user information is extracted.'});

    let log = JSON.parse(req.body.log);
    // console.log(log);
    let timeNow = new Date();
    log.updatedAt = timeNow;
    log.updatedBy = user.email;
    log.lastActiveAt = timeNow;

    try {
        let currentLog = await Log.findById(req.params.logId);
        if(!currentLog) return res.status(400).json({message: "CurrentLog not found."});

        let increaseAttachments = [];
        if(Array.isArray(req.files) && req.files.length) {
            for(let file of req.files) {
                increaseAttachments.push({
                    'name': file.originalname,
                    'size': file.size,
                    'contentType': file.mimetype,
                    'content': file.buffer,
                });
            }
        }
        // console.log(increaseAttachments);

        let reduceAttachments = JSON.parse(req.body.reduceAttachments);
        // console.log(reduceAttachments);
        let currentAttachments = JSON.parse(JSON.stringify(currentLog.attachments));
        for(let reduceAttachment of reduceAttachments) {
            for(let i = currentAttachments.length - 1; i >= 0 ; i--) {
                // console.log(currentAttachments[i]._id);
                // console.log(reduceAttachment);
                
                // if(currentAttachments[i]._id.equals(reduceAttachment)) {
                if(currentAttachments[i]._id === reduceAttachment) {
                    currentAttachments.splice(i, 1);
                    // console.log(i);
                }
            }
        }
           
        let newAttachments = currentAttachments.concat(increaseAttachments);
        log.attachments = newAttachments;

        historyItem = {};
        historyItem.active = currentLog.active;
        historyItem.createdAt = currentLog.createdAt;
        historyItem.createdBy = currentLog.createdBy;
        historyItem.updatedAt = currentLog.updatedAt;
        historyItem.updatedBy = currentLog.updatedBy;
        historyItem.lastActiveAt = currentLog.lastActiveAt;
        historyItem.logbook = currentLog.logbook;
        historyItem.tags = currentLog.tags;
        historyItem.category = currentLog.category;
        historyItem.title = currentLog.title;
        historyItem.description = currentLog.description;
        historyItem.attachments = JSON.parse(JSON.stringify(currentLog.attachments));
        for(let attachment of historyItem.attachments) {
            attachment.content = undefined;
        }

        let push = { histories: historyItem };

        let data = await Log.findByIdAndUpdate(req.params.logId, { $set: log, $push: push }, { new: true });
        res.json(data);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
}];


exports.deleteLog = async (req, res, next) => {
    if(!req.headers['user']) return res.status(500).json({message: 'No user information is extracted.'});

    let timeNow = new Date();
    req.body.updatedAt = timeNow;
    req.body.updatedBy = req.headers['user'].email;
    req.body.active = false;
    req.body.lastActiveAt = timeNow;

    try {
        let data = await Log.findByIdAndUpdate(req.params.logId, { $set: req.body }, { new: true });
        res.json(data);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
}


exports.findAttachment = async (req, res, next) => {
    let logId = req.params.logId;
    let attachmentId = req.params.attachmentId;

    // console.log(logId);
    // console.log(attachmentId);

    if(!logId) return res.status(400).json({message: "No logId is specified."});
    if(!attachmentId) return res.status(400).json({message: "No attachmentId is specified."});

    try {
        let log = await Log.findOne({ _id: logId });
        if(!log) return res.status(204).json({message: "Log not found."});

        // console.log(log);

        if(!Array.isArray(log.attachments) || log.attachments.length === 0) return res.status(204).json({message: "No attachments found for this log."});
        let attachment = null;
        for(let item of log.attachments) {
            if(item._id.equals(attachmentId)) {
                attachment = item;
                break;
            }
        }
        if(!attachment) return res.status(204).json({message: "Attachment for specified id is not found."});

        // console.log(attachment);

        res.contentType(attachment.contentType);
        // res.send(attachment.content.buffer);
        res.send(attachment.content);
    } catch(error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}