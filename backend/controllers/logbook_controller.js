const Logbook = require('../models/logbook_model.js');
const Log = require('../models/log_model.js');
const User = require('../models/user_model.js');
const Group = require('../models/group_model.js');


async function finishLogbooksInfo(logbooks) {
    if(!Array.isArray(logbooks)) {
        logbooks = [logbooks];
    }
    if(logbooks.length === 0) return;

    for(let logbook of logbooks) {
        logbook.entries = await Log.countDocuments({ active: true, logbook: logbook._id });

        let data = await Log.find({ active: true, logbook: logbook._id }).sort({ "updatedAt": -1 }).limit(1);
        if(!data || !data[0]) continue;
        let lastLog = data[0];

        let lastSubmittedAt = lastLog.updatedAt;
        logbook.lastSubmittedAt = lastSubmittedAt;
        
        let user = await User.findOne({ email: lastLog.updatedBy });
        if(!user) continue;
        logbook.lastSubmittedBy = { name: user.name, email: user.email };
    }
}


// Get all logbooks
exports.findAll = async (req, res, next) => {	
    let query = {};
    let sort = { number: 1 };

    try {
        let logbooks = await Logbook.find(query).sort(sort).populate('group');
        res.json(logbooks);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Get all logbooks with detail information
exports.findAllDetail = async (req, res, next) => {	
    let sort = { number: 1 };

    try {
        // Grouped logbooks
        let groups = await Group.find().sort(sort).lean();
        for(let group of groups) {
            let logbooks = await Logbook.find({ group: group._id }).sort(sort).lean();
            group.logbooks = logbooks;
            await finishLogbooksInfo(logbooks);
        }
        // Logbooks without group
        let query = { $or: [{ group: null }, { group: { $exists: false } }] };
        let logbooks = await Logbook.find(query).sort(sort).lean();
        await finishLogbooksInfo(logbooks);
        if(logbooks && logbooks.length) {
            groups.push({ logbooks: logbooks });
        }
        let result = groups;
        res.json(result);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Add a logbook
exports.addLogbook = async (req, res, next) => {	
    try {
	    let logbook = await Logbook.create(req.body);
        res.json(logbook);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Get single logbook
exports.findLogbook = async (req, res, next) => {	
    try {
        let logbook = await Logbook.findById(req.params.id);
        res.json(logbook);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Update a logbook
exports.updateLogbook = async (req, res, next) => {	
    try {
        let logbook = await Logbook.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, useFindAndModify: false})
        res.json(logbook);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Delete a logbook
exports.deleteLogbook = async (req, res, next) => {	
    try {
        let logbook = await Logbook.findByIdAndRemove(req.params.id);
        res.json(logbook);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

