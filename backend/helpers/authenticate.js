const md5 = require('md5');
const { authenticate } = require('ldap-authentication');
const { SMTPClient } = require('smtp-client');
const loginConfig = require('../config/login.js');
const smtpConfig = require('../config/smtp.js');
const ldapConfig = require('../config/ldap.js');
const Account = require('../models/account_model.js');


// Authenticate via local MongoDB database
async function loginLocal(username, password) {
    if(!username || !password) {
        return false;
    }

    password = md5(password);

    // Add email suffix if not including "@"
    let email = username.includes('@') ? username : username.concat(loginConfig.defaultEmailSuffix);

    let account = await Account.findOne({email: email, password: password, active: true});
    if (!account) {
        return false;
    }

    return true;
}


// Authenticate via LDAP directory service
async function loginLDAP(username, password) {
    if (!username || !password) {
        return false;
    }

    // Remove email suffix if including "@"
    username = username.includes('@') ? username.split('@')[0] : username;

    // auth with admin
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
        return true;
    } catch(error) {
        console.log(error);
        return false;
    }
}


// Authenticate via SMTP mail server
async function loginSMTP(username, password) {
    let s = new SMTPClient({
        host: smtpConfig.host,
        port: smtpConfig.port
    });

    try {
        await s.connect();
        await s.greet({hostname: smtpConfig.host}); // runs EHLO command or HELO as a fallback
        await s.authPlain({username: username, password: password}); // authenticates a user
        await s.quit(); // runs QUIT command

        // console.log('SMTP authentication successful');
        return true;
    } catch(error) {
        console.error(error);
        return false;
    }
}


module.exports = {
    loginLocal,
    loginLDAP,
    loginSMTP
}