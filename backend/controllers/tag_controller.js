const Tag = require('../models/tag_model.js');


// Get all tags using query
exports.findAll = async (req, res, next) => {	
    let query = {};
    let sort = { number: 1 };

    try {
        let tags = await Tag.find(query).sort(sort);
        res.json(tags);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Add a tag
exports.addTag = async (req, res, next) => {	
    try {
	    let tag = await Tag.create(req.body);
        res.json(tag);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Get single tag
exports.findTag = async (req, res, next) => {	
    try {
        let tag = await Tag.findById(req.params.id);
        res.json(tag);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Update a tag
exports.updateTag = async (req, res, next) => {	
    try {
        let tag = await Tag.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, useFindAndModify: false})
        res.json(tag);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Delete a tag
exports.deleteTag = async (req, res, next) => {	
    try {
        let tag = await Tag.findByIdAndRemove(req.params.id);
        res.json(tag);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};



