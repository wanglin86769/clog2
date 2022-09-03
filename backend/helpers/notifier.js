const nodemailer = require('nodemailer');
const smtpConfig = require('../config/smtp.js');


// Send an email
function sendMail(subject, text, to) {
    let transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass
        }
    });
        
    let mailOptions = {
        // from: smtpConfig.user,
        from: `${smtpConfig.name} <${smtpConfig.user}>`,
        to: to,
        subject: subject,
        text: text
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log(`Email sent to: ${to}    Response: ${info.response}`);
        }
    }); 
}


module.exports = {
    sendMail
}