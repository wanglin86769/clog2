const Group = require('../models/group_model.js');


// Get all groups using query
exports.findAll = async (req, res, next) => {	
    let query = {};
    let sort = { number: 1 };

    try {
        let groups = await Group.find(query).sort(sort);
        res.json(groups);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Add a group
exports.addGroup = async (req, res, next) => {	
    try {
	    let group = await Group.create(req.body);
        res.json(group);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Get single group
exports.findGroup = async (req, res, next) => {	
    try {
        let group = await Group.findById(req.params.id);
        res.json(group);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Update a group
exports.updateGroup = async (req, res, next) => {	
    try {
        let group = await Group.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, useFindAndModify: false})
        res.json(group);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Delete a group
exports.deleteGroup = async (req, res, next) => {	
    try {
        let group = await Group.findByIdAndRemove(req.params.id);
        res.json(group);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};