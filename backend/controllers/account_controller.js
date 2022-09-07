const md5 = require('md5');
const crypto = require('crypto');
const Account = require('../models/account_model.js');
const notifier = require('../helpers/notifier.js');
const frontendConfig = require('../config/frontend.js');


// Register an account
exports.registerAccount = async (req, res, next) => {
    req.body.random = crypto.randomBytes(16).toString('hex');
    req.body.password = md5(req.body.password);
    req.body.active = false;
    req.body.createdAt = new Date();

    let account;
    try {
        let a = await Account.findOne({email: req.body.email, active: true});
        if(a)  return res.status(406).json({message: 'This email has been registered and cannot be registered again.'});

        account = await Account.create(req.body);
        res.json(account);
    } catch(error) {
        console.log(error.message);
        return res.status(500).json({message: error.message});
    }

    let subject = "Clog new user registration confirmation";
    let text = "Please click the following link to complete Clog user registration\n" + frontendConfig.url;
    text += text.endsWith("/") ? "" : "/"
    text += "verifyaccount" + "/" + account.random;

    notifier.sendMail(subject, text, account.email);
};

// Verify an account to complete account register
exports.verifyAccount = async (req, res, next) => {
    let random = req.params.random;
    req.body.active = true;
    req.body.verifiedAt = new Date();
    req.body.random = crypto.randomBytes(16).toString('hex');

    let account;
    try {
        let a = await Account.findOne({ random: random, active: false });
        if(!a)  return res.status(406).json({message: 'No registration information to be confirmed found.'});

        if(a.active === true)  return res.status(406).json({message: 'This registration information has been confirmed, there is no need to repeat the confirmation.'});

        account = await Account.findOneAndUpdate({ random: random, active: false }, {$set: req.body}, {new: true, useFindAndModify: false});
        res.json(account);
    } catch(error) {
        console.log(error.message);
        return res.status(500).json({message: error.message});
    }

    let subject = "Clog new user registration completed";
    let text = `Your Clog user registration is complete.\nLogin Email: ${account.email}\nName: ${account.name}`;
    text += "\nThe login address is as follows: \n" + frontendConfig.url;

    notifier.sendMail(subject, text, account.email);
}

// Update password
exports.updatePassword = async (req, res, next) => {
    let email = req.params.email;
    if(req.body.currentPassword)  req.body.currentPassword = md5(req.body.currentPassword);
    if(req.body.password)  req.body.password = md5(req.body.password);
    req.body.updatedAt = new Date();

    let account;
    try {
        let a = await Account.findOne({email: email, active: true});
        if(!a)  return res.status(406).json({message: 'No corresponding account found, please register first.'});

        if(a.password !== req.body.currentPassword)  return res.status(406).json({message: 'The current password is incorrect. Please re-enter it.'});

        account = await Account.findOneAndUpdate({email: email, active: true}, {$set: req.body}, {new: true, useFindAndModify: false})
        res.json(account);
    } catch(error) {
        console.log(error.message);
        return res.status(500).json({message: error.message});
    }

    let subject = "The Clog user password is changed successfully";
    let text = "Your Clog user password has been changed.";
    text += "\nThe login address is as follows: \n" + frontendConfig.url;

    notifier.sendMail(subject, text, account.email);
};

// Forget password
exports.forgetPassword = async (req, res, next) => {
    let email = req.params.email;
    req.body.random = crypto.randomBytes(16).toString('hex');

    let account;
    try {
        let a = await Account.findOne({email: email, active: true});
        if(!a)  return res.status(406).json({message: 'No corresponding account found, please register first.'});

        account = await Account.findOneAndUpdate({email: email, active: true}, {$set: req.body}, {new: true, useFindAndModify: false})
        res.json(account);
    } catch(error) {
        console.log(error.message);
        return res.status(500).json({message: error.message});
    }

    let subject = "Clog Retrieve Password";
    let text = "Please click the following link to reset the Clog user password\n" + frontendConfig.url;
    text += text.endsWith("/") ? "" : "/"
    text += "resetpassword" + "/" + account.random;

    notifier.sendMail(subject, text, account.email);
};

// Reset password
exports.resetPassword = async (req, res, next) => {
    let random = req.params.random;
    req.body.password = md5(req.body.password);
    req.body.updatedAt = new Date();
    req.body.random = crypto.randomBytes(16).toString('hex');

    let account;
    try {
        let a = await Account.findOne({random: random, active: true});
        if(!a)  return res.status(406).json({message: 'No corresponding account found, please register first.'});

        account = await Account.findOneAndUpdate({random: random}, {$set: req.body}, {new: true, useFindAndModify: false})
        res.json(account);
    } catch(error) {
        console.log(error.message);
        return res.status(500).json({message: error.message});
    }

    let subject = "Clog user password reset";
    let text = "Your Clog user password has been reset.";
    text += "\nThe login address is as follows:\n" + frontendConfig.url;

    notifier.sendMail(subject, text, account.email);
};

// Get all accounts using query
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
        let accounts = await Account.find(query).sort({ email: 1 });
        res.json(accounts);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Add an account
exports.addAccount = async (req, res, next) => {
    req.body.active = true;
    req.body.password = md5(req.body.password);
    req.body.createdAt = new Date();
    try {	
        let account = await Account.create(req.body);
        res.json(account);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Get single account
exports.findAccount = async (req, res, next) => {	
    try {
        let account = await Account.findById(req.params.id).populate({ path: 'system'})
        res.json(account);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Update an account
exports.updateAccount = async (req, res, next) => {
    req.body.password = md5(req.body.password);
    req.body.updatedAt = new Date();
    try {	
        let account = await Account.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, useFindAndModify: false})
        res.json(account);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};

// Delete an account
exports.deleteAccount = async (req, res, next) => {	
    try {
        let account = await Account.findByIdAndRemove(req.params.id)
        res.json(account);
    } catch(error) {
        res.status(500).json({message: error.message})
    }
};
