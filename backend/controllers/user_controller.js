const User = require('../models/user_model.js');


// Get all users using query
exports.findAll = async (req, res, next) => {	
    let query = {};

    for (const [key, value] of Object.entries(req.query)) {
        switch(key) {
            case 'name':
                query[key] = { "$regex": value, "$options": "i" };
                break;
            case 'email':
                query[key] = { "$regex": value, "$options": "i" };
                break;
            case 'admin':
                query[key] = value;
                break;
            case 'search':
                query['$and'] = [{
                    $or: [
                        { name: { "$regex": value, "$options": "i" } },
                        { email: { "$regex": value, "$options": "i" } }
                    ]
                }];
                break;
            default:
                console.log("Unknown query parameter: " + key + ", " + value)
                break;
        }
    }

    try {
        let users = await User.find(query).sort({ email: 1 });
        res.json(users);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Add a user
exports.addUser = async (req, res, next) => {	
    try {
	    let user = await User.create(req.body);
        res.json(user);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Get single user
exports.findUser = async (req, res, next) => {	
    try {
        let user = await User.findById(req.params.id);
        res.json(user);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Update a user
exports.updateUser = async (req, res, next) => {	
    try {
        let user = await User.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, useFindAndModify: false})
        res.json(user);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Delete a user
exports.deleteUser = async (req, res, next) => {	
    try {
        let user = await User.findByIdAndRemove(req.params.id);
        res.json(user);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};



