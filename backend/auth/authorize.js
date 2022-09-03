const jwt = require('jsonwebtoken');  // used to create, sign, and verify tokens
const jwtConfig = require('../config/jwt.js');
const loginConfig = require('../config/login.js');
const authenticate = require('../helpers/authenticate.js');
const User = require('../models/user_model.js');
const Log = require('../models/log_model.js');


// Supporting basic base64-encoded and bearer token authentications, either one can be used.
async function loggedIn(req, res, next) {

    // Check authentication header for user credential or token
    let authHeader = req.headers['authorization'];
    if(!authHeader) {
      return res.status(401).json({ message: '未检测到 Authentication Header' });
    }

    let success;
    let user;
    if(authHeader.includes('Basic')) {  // Basic base64-encoded credential
        let credential = Buffer.from(authHeader.replace('Basic ', ''), 'base64').toString('utf8');
        let username = credential.split(':')[0];
        let password = credential.split(':')[1];
        
        switch(loginConfig.loginMethod) {
            case LOGIN_METHOD_LOCAL:  // Authenticate via local database
                success = await authenticate.loginLocal(username, password);
                break;
            case LOGIN_METHOD_LDAP:  // Authenticate via ldap
                success = await authenticate.loginLDAP(username, password);
                break;
            case LOGIN_METHOD_OAUTH:  // Authenticate via SMTP mail server
                success = await authenticate.loginSMTP(username, password);
                break;
            default:
                return res.status(401).json({ message: 'Unknown login method' });
        }
        
        if(success) {            
            let email = username.includes('@') ? username : username.concat(loginConfig.defaultEmailSuffix);
            user = await User.findOne({email: email});
            if(!user) {
                return res.status(401).json({ message: 'User information not found' });
            }
        } else {
            return res.status(401).json({ message: 'Basic authentication failed, username or password is incorrect' });
        }
    } else if(authHeader.includes('Bearer')) {  // Bearer token
        let token = authHeader.replace('Bearer ', '');
        let decoded;
        try {
            // Verifies secret and checks expiration
            decoded = jwt.verify(token, jwtConfig.secret);
            user = decoded;
        } catch(error) {
            return res.status(401).json({ message: 'JWT Token解析错误' });
        }
    } else {
        return res.status(401).json({ message: 'Unknown Authentication Header' });
    }

    req.headers['user'] = user;
    next();
}


async function canEditLog(req, res, next) {
    let user = req.headers['user'];
    if(!user) {
        return res.status(401).json({ message: 'No user information was found' });
    }

    let logId = req.params.logId;
    if(!logId) {
        return res.status(401).json({ message: 'Cannot extract log id' });
    }

    let log = await Log.findById(logId);
    if(!log) {
        return res.status(401).json({ message: 'No log with specified id was found' });
    }

    // Only log author or admin can edit the log
    if(log.createdBy !== user.email && user.admin !== true) {
        return res.status(401).json({ message: 'Insufficient permission, only author or admin can edit / delete the log' });
    }

    // authentication and authorization successful
    next();
}


function admin(req, res, next) {
    let user = req.headers['user'];
    if(!user) {
        return res.status(401).json({ message: '未提取到用户信息' });
    }
    if(user.admin !== true) {
        return res.status(401).json({ message: '用户权限不足' }); 
    }

    next();
}


module.exports = {
    loggedIn,
    canEditLog,
    admin,
}