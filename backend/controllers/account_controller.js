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
        if(a)  return res.status(406).json({message: '此邮箱已注册，不能重复注册！'});

        account = await Account.create(req.body);
        res.json(account);
    } catch(error) {
        console.log(error.message);
        return res.status(500).json({message: error.message});
    }

    let subject = "Clog新用户注册确认";
    let text = "请点击如下链接完成Clog用户注册\n" + frontendConfig.url;
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
        if(!a)  return res.status(406).json({message: '未找到待确认的注册信息！'});

        if(a.active === true)  return res.status(406).json({message: '此注册信息已经确认，无需重复确认！'});

        account = await Account.findOneAndUpdate({ random: random, active: false }, {$set: req.body}, {new: true, useFindAndModify: false});
        res.json(account);
    } catch(error) {
        console.log(error.message);
        return res.status(500).json({message: error.message});
    }

    let subject = "Clog新用户注册完成";
    let text = `您的Clog用户注册已经完成\n登录邮箱：${account.email}\n姓名：${account.name}`;
    text += "\n登录地址如下：\n" + frontendConfig.url;

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
        if(!a)  return res.status(406).json({message: '未找到相应账号，请先注册！'});

        if(a.password !== req.body.currentPassword)  return res.status(406).json({message: '当前密码输入错误，请重新输入！'});

        account = await Account.findOneAndUpdate({email: email, active: true}, {$set: req.body}, {new: true, useFindAndModify: false})
        res.json(account);
    } catch(error) {
        console.log(error.message);
        return res.status(500).json({message: error.message});
    }

    let subject = "Clog用户信息修改完成";
    let text = "您的Clog用户信息已经修改完成。";
    text += "\n登录地址如下：\n" + frontendConfig.url;

    notifier.sendMail(subject, text, account.email);
};

// Forget password
exports.forgetPassword = async (req, res, next) => {
    let email = req.params.email;
    req.body.random = crypto.randomBytes(16).toString('hex');

    let account;
    try {
        let a = await Account.findOne({email: email, active: true});
        if(!a)  return res.status(406).json({message: '未找到相应账号，请先注册！'});

        account = await Account.findOneAndUpdate({email: email, active: true}, {$set: req.body}, {new: true, useFindAndModify: false})
        res.json(account);
    } catch(error) {
        console.log(error.message);
        return res.status(500).json({message: error.message});
    }

    let subject = "Clog找回密码";
    let text = "请点击如下链接重置Clog用户密码\n" + frontendConfig.url;
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
        if(!a)  return res.status(406).json({message: '未找到相应账号，请先注册！'});

        account = await Account.findOneAndUpdate({random: random}, {$set: req.body}, {new: true, useFindAndModify: false})
        res.json(account);
    } catch(error) {
        console.log(error.message);
        return res.status(500).json({message: error.message});
    }

    let subject = "Clog用户密码重置";
    let text = "您的Clog用户密码已经重置。";
    text += "\n登录地址如下：\n" + frontendConfig.url;

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
    req.body.active = false;
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
