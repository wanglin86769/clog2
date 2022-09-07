const express = require('express');
const router = express.Router();
const md5 = require('md5');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const axios = require('axios');
const https = require('https');
const { authenticate } = require('ldap-authentication');
const jwtConfig = require('../config/jwt.js');
const loginConfig = require('../config/login.js');
const ldapConfig = require('../config/ldap.js');
const Account = require('../models/account_model.js');
const User = require('../models/user_model.js');


// At request level
const agent = new https.Agent({
    rejectUnauthorized: false
});


async function updateLoginTime(username) {
    if(!username) {
        console.log("updateLoginTime(): No username specified.");
        return;
    }
    let email = username.includes('@') ? username : username.concat(loginConfig.defaultEmailSuffix);

    let currentUser = await User.findOne({email: email});
    if(!currentUser) {
        console.log("updateLoginTime(): currentUser not found.");
        return;
    }

    let lastLoginAt = currentUser.thisLoginAt;
    let thisLoginAt = new Date();

    try {
        await User.findOneAndUpdate({ email: email }, { $set: { lastLoginAt: lastLoginAt, thisLoginAt: thisLoginAt } }, { new: true, useFindAndModify: false });
    } catch(error) {
        console.log(error);
    }
}


// Authenticate via local account database
router.post('/local', async function(req, res, next) {
    if(loginConfig.loginMethod !== LOGIN_METHOD_LOCAL) {
        return res.status(401).send({ auth: false, token: null, message: "Current configuration of server side does not support authentication via local database." });
    }

    let username = req.body.username;
    let password = md5(req.body.password);

    if (!username || !password) {
        return res.status(401).send({ auth: false, token: null, message: "Username and password cannot be empty." });
    }

    let email = username.includes('@') ? username : username.concat(loginConfig.defaultEmailSuffix);

    try {
        let account = await Account.findOne({email: email, password: password, active: true});
        if (!account) {
            return res.status(401).send({ auth: false, token: null, message: "Username or password is incorrect." });
        }

        let jwtUser = {};
        let currentUser = await User.findOne({email: email});
        if(currentUser) {
            jwtUser.name = currentUser.name;
            jwtUser.email = currentUser.email;
            jwtUser.admin = currentUser.admin;
        } else {
            let newUser = {
                name: account.name,
                email: account.email,
                admin: false
            }
            let createdUser = await User.create(newUser);
            jwtUser.name = createdUser.name;
            jwtUser.email = createdUser.email;
            jwtUser.admin = createdUser.admin;
        }
            
        // If user is found and password is valid, create a token
        // console.log(user);
        let token = jwt.sign(jwtUser, jwtConfig.secret, {
            expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token, user: jwtUser });

        // Update last login time
        await updateLoginTime(username);
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }

});


// Authenticate via LDAP
router.post('/ldap', async function(req, res, next) {
    if(loginConfig.loginMethod !== LOGIN_METHOD_LDAP) {
        return res.status(401).send({ auth: false, token: null, message: "Current configuration of server side does not support authentication via LDAP." });
    }

    let username = req.body.username;
    let password = req.body.password

    if (!username || !password) {
        return res.status(401).send({ auth: false, token: null, message: "Username and password cannot be empty." });
    }

    // auth with regular user
    let options = {
        ldapOpts: {
            url: ldapConfig.url,
            // tlsOptions: { rejectUnauthorized: false }
        },
        adminDn: ldapConfig.adminDn,
        adminPassword: ldapConfig.adminPassword,
        userSearchBase: ldapConfig.userSearchBase,
        usernameAttribute: ldapConfig.usernameAttribute,
        username: username,
        userPassword: password,
        // starttls: false
    }

    let user;
    try {
        user = await authenticate(options);
        if(!user) {
            return res.status(401).send({ auth: false, token: null, message: "No user detail returned from LDAP server." });
        }
        // console.log(user);
    } catch(error) {
        console.log(error);
        return res.status(401).json({message: "Username or password is incorrect."});
    }

    try {
        let jwtUser = {};
        let currentUser = await User.findOne({email: user[ldapConfig.emailAttribute]});
        if(currentUser) {
            jwtUser.name = currentUser.name;
            jwtUser.email = currentUser.email;
            jwtUser.admin = currentUser.admin;
        } else {
            let newUser = {
                name: user[ldapConfig.displayNameAttribute],
                email: user[ldapConfig.emailAttribute],
                admin: false
            }
            let createdUser = await User.create(newUser);
            jwtUser.name = createdUser.name;
            jwtUser.email = createdUser.email;
            jwtUser.admin = createdUser.admin;
        }
            
        // If user is found and password is valid, create a token
        // console.log(user);
        let token = jwt.sign(jwtUser, jwtConfig.secret, {
            expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token, user: jwtUser });

        // Update last login time
        await updateLoginTime(username);
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: error});
    }
});


// Authenticate via OAuth2
router.post('/oauth', async function(req, res, next) {
    if(loginConfig.loginMethod !== LOGIN_METHOD_OAUTH) {
        return res.status(401).send({ auth: false, token: null, message: "Current configuration of server side does not support authentication via OAuth2." });
    }

    url = req.body.url;
    if(!url) return res.status(400).json({message: 'The URL information is not received.'});
    // console.log(url);

    try {
        let response = await axios.post(url, null, { httpsAgent: agent });
        // let response = await axios.post(url, null);
        if(!response || !response.data || !response.data.userInfo) {
            return res.status(500).json({message: 'The user login information is not obtained from the unified authentication server.'});
        }

        let userInfo = JSON.parse(response.data.userInfo);
        let email = userInfo.cstnetId;
        let truename = userInfo.truename;

        // console.log(userInfo);
        // console.log(email);
        // console.log(truename);

        let jwtUser = {};
        let currentUser = await User.findOne({email: email});
        if(currentUser) {
            jwtUser.name = currentUser.name;
            jwtUser.email = currentUser.email;
            jwtUser.admin = currentUser.admin;
        } else {
            let newUser = {
                name: truename,
                email: email,
                admin: false
            }
            let createdUser = await User.create(newUser);
            jwtUser.name = createdUser.name;
            jwtUser.email = createdUser.email;
            jwtUser.admin = createdUser.admin;
        }
            
        // If user is found and password is valid, create a token
        // console.log(user);
        let token = jwt.sign(jwtUser, jwtConfig.secret, {
            expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token, user: jwtUser });

        // Update last login time
        await updateLoginTime(email);
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }

});


module.exports = router;