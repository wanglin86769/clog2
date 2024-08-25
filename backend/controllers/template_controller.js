const Template = require('../models/template_model.js');


// Get all templates using query
exports.findAll = async (req, res, next) => {	
    let query = {};
    let sort = { number: 1 };

    try {
        let templates = await Template.find(query).sort(sort);
        res.json(templates);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Add a template
exports.addTemplate = async (req, res, next) => {
    let user = req.headers['user'];
    if(!user) return res.status(500).json({message: 'No user information is extracted.'});
    
    let timeNow = new Date();
    req.body.createdAt = timeNow;
    req.body.createdBy = user.email;
    req.body.updatedAt = timeNow;
    req.body.updatedBy = user.email;
    try {
	    let template = await Template.create(req.body);
        res.json(template);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Get single template
exports.findTemplate = async (req, res, next) => {	
    try {
        let template = await Template.findById(req.params.id);
        res.json(template);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Update a template
exports.updateTemplate = async (req, res, next) => {
    let user = req.headers['user'];
    if(!user) return res.status(500).json({message: 'No user information is extracted.'});
    
    let timeNow = new Date();
    req.body.updatedAt = timeNow;
    req.body.updatedBy = user.email;
    try {
        let template = await Template.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, useFindAndModify: false})
        res.json(template);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Delete a template
exports.deleteTemplate = async (req, res, next) => {	
    try {
        let template = await Template.findByIdAndRemove(req.params.id);
        res.json(template);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};
