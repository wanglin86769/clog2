const multer  = require('multer');
const upload = multer();
const mongoose = require('mongoose');
const User = require('../models/user_model.js');
const Log = require('../models/log_model.js');
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime');
const authorize = require('../auth/authorize.js');
const Logbook = require('../models/logbook_model.js');
const notifier = require('../helpers/notifier.js');
const backendConfig = require('../config/backend.js');
const rootdir = path.normalize(require('../config/attachment').rootdir);
const attachmentdir = path.join(rootdir, require('../config/attachment').attachments_path);
const richtextdir = path.join(rootdir, require('../config/attachment').rich_text_images_path);


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
                    query[key] = new mongoose.Types.ObjectId(value);
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


exports.runScript = async (req, res, next) => {
    /**** Convert attachments from MongoDB to file system ****/
    // let logs = await Log.find();
    // for(let log of logs) {
    //     if(log.attachments && log.attachments.length) {
    //         let createdAt = new Date(log.createdAt);
    //         let month = createdAt.getUTCMonth() + 1; //months from 1-12
    //         let day = createdAt.getUTCDate();
    //         let year = createdAt.getUTCFullYear();
    //         let fileDir = path.join(attachmentdir, year.toString(), month.toString(), day.toString(), log._id.toString());
    //         await fs.mkdir(fileDir, { recursive: true });
    //         for(let attachment of log.attachments) {
    //             let fileName = attachment.name;
    //             if(fileName.includes(':')) {
    //                 // Replace all appearances of ':' to '_'
    //                 fileName = fileName.replace(/:/g, '_');
    //             }
    //             let content = attachment.content;
    //             let fileFullPath = path.join(fileDir, fileName);
    //             await fs.writeFile(fileFullPath, content, "binary");
    //         }
    //     }
    // }
    // res.json({ result: 'Done' });

    /**** Remove attachments from MongoDB ****/
    // let logs = await Log.find();
    // for(let log of logs) {
    //     log.attachments = undefined;
    //     await log.save();
    // }
    // res.json({ result: 'Done' });
}


function generateSort(sort, sortField, sortOrder) {
    if(sortField && sortOrder) {
        sort[sortField] = sortOrder;
    }

    if(!sort['createdAt'])  sort['createdAt'] = -1;
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
                    logbook: new mongoose.Types.ObjectId(logbook),
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

    let l = await Logbook.findById(req.query.logbook);
    if(!l) {
        return res.status(401).json({ message: 'The specified logbook cannot be found.' });
    }

    // If the logbook is private, check if the current user have sufficient permission.
    if(l.members && l.members.length) {
        let u = authorize.getUserFromRequest(req);
        // Only super admins, logbook admins and logbook members can access logs in the logbook.
        // If the current user does not have sufficient permission, return 403 status code.
        if(!u || !(u.admin || (l.admins && l.admins.includes(u.email)) || l.members.includes(u.email))) {
            return res.status(403).json({ message: 'Permission denied.' });
        }
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

    let query = { active: true, logbook: new mongoose.Types.ObjectId(logbook) };
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
                'attachments': 0
            } 
        }
    ];

    // console.log(pipeline);

    try {
        // Retrieve data
        let results = await Log.aggregate(pipeline);
        // Calculate count
        let count = await Log.countDocuments(query).exec();

        if(!results) results = [];
        if(!count) count = 0;

        // console.log(results);
        // console.log(count);

        // Post process for attachments
        for(let log of results) {
            let date = new Date(log.createdAt);
            let month = date.getUTCMonth() + 1; //months from 1-12
            let day = date.getUTCDate();
            let year = date.getUTCFullYear();

            let fileDir = path.join(attachmentdir, year.toString(), month.toString(), day.toString(), log._id.toString());

            if(fs.existsSync(fileDir)) {
                let files = await fs.readdir(fileDir);
                if(files && files.length) {
                    let attachments = [];
                    for (const file of files){
                        let fileFullPath = path.join(fileDir, file);
                        let stats = await fs.stat(fileFullPath);
                        attachments.push({name: file, size: stats.size, contentType: mime.getType(file)});
                    }
                    log.attachments = attachments;
                }
            }
        }

        let finalData = {};
        finalData.entries = results;
        finalData.count = count;

        /**** This part is commented since it is not necessary and seriously affect the performance ****/
        // Post process for history authors
        // for(let log of finalData.entries) {
        //     if(Array.isArray(log.histories) && log.histories.length) {
        //         for(let history of log.histories) {
        //             let user;
        //             if(history.createdBy) {
        //                 user = await User.findOne({ email: history.createdBy });
        //                 history.createdBy = user ? { email: user.email, name: user.name } : { email: '', name: '' };
        //             }
        //             if(history.updatedBy) {
        //                 user = await User.findOne({ email: history.updatedBy });
        //                 history.updatedBy = user ? { email: user.email, name: user.name } : { email: '', name: '' };
        //             }
        //         }
        //     }
        // }

        // console.log(finalData);
        res.json(finalData);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
}


exports.findLog = async (req, res, next) => {
    let pipeline = [
        { 
            $match: { _id: new mongoose.Types.ObjectId(req.params.logId) }
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
                'attachments': 0
            } 
        },
    ]

    try {
        let data = await Log.aggregate(pipeline);
        if(!data || !data[0])  return res.json(null);
            
        let log = data[0];

        // Retrieve the logbook info
        let l = log.logbook;
        // If the logbook is private, check if the current user have sufficient permission.
        if(l && l.members && l.members.length) {
            let u = authorize.getUserFromRequest(req);
            // Only super admins, logbook admins and logbook members can access logs in the logbook.
            // If the current user does not have sufficient permission, return 403 status code.
            if(!u || !(u.admin || (l.admins && l.admins.includes(u.email)) || l.members.includes(u.email))) {
                return res.status(403).json({ message: 'Permission denied.' });
            }
        }

        // Post process for attachments
        let date = new Date(log.createdAt);
        let month = date.getUTCMonth() + 1; //months from 1-12
        let day = date.getUTCDate();
        let year = date.getUTCFullYear();

        let fileDir = path.join(attachmentdir, year.toString(), month.toString(), day.toString(), log._id.toString());

        if(fs.existsSync(fileDir)) {
            let files = await fs.readdir(fileDir);
            if(files && files.length) {
                let attachments = [];
                for (const file of files){
                    let fileFullPath = path.join(fileDir, file);
                    let stats = await fs.stat(fileFullPath);
                    attachments.push({name: file, size: stats.size, contentType: mime.getType(file)});
                }
                log.attachments = attachments;
            }
        }

        // Post process for history authors
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

        let result = log;
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

    let data;
    try {
        if(req.query.append) {  // Process append request
            let existingLog = await Log.findOne({ logbook: log.logbook, title: log.title, active: true }, null, { sort: { updatedAt: -1 } });
            if(existingLog) {
                if(log.description) {
                    existingLog.createdAt = timeNow;
                    existingLog.createdBy = user.email;
                    existingLog.updatedAt = timeNow;
                    existingLog.updatedBy = user.email;
                    existingLog.lastActiveAt = timeNow;
                    existingLog.description = existingLog.description + '\n' + log.description;
                    // Append the log
                    data = await existingLog.save();
                } else {
                    data = existingLog;
                }
            } else {
                // Create the log
                data = await Log.create(log);
            }
        } else {  // Process normal create request
            // Create the log
            data = await Log.create(log);
        }

        // Process attachments
        if(Array.isArray(req.files) && req.files.length) {
            // Create the directory for attachments
            let createdAt = new Date(data.createdAt);
            let month = createdAt.getUTCMonth() + 1; //months from 1-12
            let day = createdAt.getUTCDate();
            let year = createdAt.getUTCFullYear();
            let fileDir = path.join(attachmentdir, year.toString(), month.toString(), day.toString(), data._id.toString());
            await fs.mkdir(fileDir, { recursive: true });

            // Create attachments in the directory
            for(let file of req.files) {
                /* 
                 * By default, 
                 * if all chars are latin1, then re-decoding
                 */
                if (!/[^\u0000-\u00ff]/.test(file.originalname)) {
                    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
                }
                
                let fileFullPath = path.join(fileDir, file.originalname);
                await fs.writeFile(fileFullPath, file.buffer, "binary");
            }
        }

        res.json(data);
    } catch(error) {
        res.status(500).json({message: error.message})
    }

    if(data && data._id) {
        notifier.notifyLogUpdate('create', data._id);
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

    let data;
    try {
        let currentLog = await Log.findById(req.params.logId);
        if(!currentLog) return res.status(400).json({message: "CurrentLog not found."});

        // Locate current attachments
        let date = new Date(currentLog.createdAt);
        let month = date.getUTCMonth() + 1; //months from 1-12
        let day = date.getUTCDate();
        let year = date.getUTCFullYear();

        let fileDir = path.join(attachmentdir, year.toString(), month.toString(), day.toString(), currentLog._id.toString());

        let currentAttachments = [];
        if(fs.existsSync(fileDir)) {
            let files = await fs.readdir(fileDir);
            if(files && files.length) {
                for (const file of files){
                    let fileFullPath = path.join(fileDir, file);
                    let stats = await fs.stat(fileFullPath);
                    currentAttachments.push({name: file, size: stats.size, contentType: mime.getType(file)});
                }
            }
        }

        // Build the log histories
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
        if(currentAttachments && currentAttachments.length) {
            historyItem.attachments = currentAttachments;
        }

        let push = { histories: historyItem };

        // Update the log
        data = await Log.findByIdAndUpdate(req.params.logId, { $set: log, $push: push }, { new: true });

        // Increase attachments
        if(Array.isArray(req.files) && req.files.length) {
            await fs.mkdir(fileDir, { recursive: true });

            for(let file of req.files) {
                /* 
                 * By default, 
                 * if all chars are latin1, then re-decoding
                 */
                if (!/[^\u0000-\u00ff]/.test(file.originalname)) {
                    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
                }
                
                let fileFullPath = path.join(fileDir, file.originalname);
                await fs.writeFile(fileFullPath, file.buffer, "binary");
            }
        }

        // Reduce attachments
        let reduceAttachments = JSON.parse(req.body.reduceAttachments);
        for(let fileName of reduceAttachments) {
            let fileFullPath = path.join(fileDir, fileName);
            if(fs.existsSync(fileFullPath)) {
                await fs.unlink(fileFullPath);
            }
        }

        res.json(data);
    } catch(error) {
        res.status(500).json({message: error.message})
    }

    if(data && data._id) {
        notifier.notifyLogUpdate('update', data._id);
    }
}];


exports.deleteLog = async (req, res, next) => {
    let user = req.headers['user'];
    if(!user) return res.status(500).json({message: 'No user information is extracted.'});

    let timeNow = new Date();
    req.body.updatedAt = timeNow;
    req.body.updatedBy = user.email;
    req.body.active = false;
    req.body.lastActiveAt = timeNow;

    let data;
    try {
        data = await Log.findByIdAndUpdate(req.params.logId, { $set: req.body }, { new: true });
        res.json(data);
    } catch(error) {
        res.status(500).json({message: error.message})
    }

    if(data && data._id) {
        notifier.notifyLogUpdate('delete', data._id);
    }
}


exports.findAttachment = async (req, res, next) => {
    let logId = req.params.logId;
    let fileName = req.params.fileName;

    if(!logId) return res.status(400).json({message: "No logId is specified."});
    if(!fileName) return res.status(400).json({message: "No fileName is specified."});

    try {
        let log = await Log.findOne({ _id: logId });
        if(!log) return res.status(204).json({message: "Log not found."});

        let date = new Date(log.createdAt);
        let month = date.getUTCMonth() + 1; // months from 1-12
        let day = date.getUTCDate();
        let year = date.getUTCFullYear();
        let fileFullPath = path.join(attachmentdir, year.toString(), month.toString(), day.toString(), logId, fileName);

        if(!fs.existsSync(fileFullPath)) {
            return res.status(204).json({message: "Attachment for the specified name is not found."});
        }

        // Another implementation
        // let content = await fs.readFile(fileFullPath, 'binary');
        // res.write(content, 'binary');
        // res.end();

        let content = await fs.readFile(fileFullPath, 'binary');
        res.send(new Buffer.from(content, 'binary'))

    } catch(error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}


exports.createRichTextImage = [upload.single('upload'), async (req, res, next) => {	
    let user = req.headers['user'];
    if(!user) {
        let errMessage = {
            error: {
                message: "Only logged in users can upload rich-text images."
            }
        }        
        return res.status(400).json(errMessage);
    }

    let file = req.file;
    if(!file) return res.status(400).json({ message: "No image information is extracted." });

    // Create the directory for attachments
    let createdAt = new Date();
    let month = createdAt.getUTCMonth() + 1; // months from 1-12
    let day = createdAt.getUTCDate();
    let year = createdAt.getUTCFullYear();
    let fileDir = path.join(richtextdir, year.toString(), month.toString(), day.toString());
    await fs.mkdir(fileDir, { recursive: true });

    /* Create the image in the directory */

    /* 
     * By default, 
     * if all chars are latin1, then re-decoding
     */
    if (!/[^\u0000-\u00ff]/.test(file.originalname)) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    }
    
    let fileFullPath = path.join(fileDir, file.originalname);
    let fileName;
    if(fs.existsSync(fileFullPath)) { // If filename already exists, append timestamp to avoid duplication
        let name = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
        let extension = file.originalname.substring(file.originalname.lastIndexOf('.') + 1);
        fileName = `${name}_${String(Date.now())}.${extension}`;
    } else {
        fileName = file.originalname;
    }
    
    fileFullPath = path.join(fileDir, fileName);
    await fs.writeFile(fileFullPath, file.buffer, "binary");

    // Return the available URL to the rich-text editor
    let url = `${backendConfig.url}/logs/richtext/${year}/${month}/${day}/${fileName}`;
    res.json({ url: url });
}];


exports.findRichTextImage = async (req, res, next) => {
    let year = req.params.year;
    let month = req.params.month;
    let day = req.params.day;
    let fileName = req.params.fileName;

    if(!year) return res.status(400).json({message: "No year is specified."});
    if(!month) return res.status(400).json({message: "No month is specified."});
    if(!day) return res.status(400).json({message: "No day is specified."});
    if(!fileName) return res.status(400).json({message: "No fileName is specified."});

    try {
        let fileFullPath = path.join(richtextdir, year.toString(), month.toString(), day.toString(), fileName);

        if(!fs.existsSync(fileFullPath)) {
            return res.status(204).json({message: "Rich text image for the specified date and name is not found."});
        }

        let content = await fs.readFile(fileFullPath, 'binary');

        // Download the image
        // res.send(new Buffer.from(content, 'binary'));

        // Display the image in the browser
        res.write(content,'binary');
        res.end();

    } catch(error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}