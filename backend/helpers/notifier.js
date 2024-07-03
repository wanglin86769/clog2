const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const smtpConfig = require('../config/smtp.js');
const Log = require('../models/log_model.js');
const rootdir = path.normalize(require('../config/attachment').rootdir);
const frontendConfig = require('../config/frontend.js');


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


// Send an email when there is log creation, update or deletion in the logbook
async function notifyLogUpdate(operation, logId) {
    let pipeline = [
        { 
            $match: { _id: new mongoose.Types.ObjectId(logId) }
        },
        {
            $lookup: {
                from:"user",
                localField: "createdBy",
                foreignField: "email",
                as: "createdBy"
            }
        },
        {
            $unwind: {
                path: '$createdBy',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from:"user",
                localField: "updatedBy",
                foreignField: "email",
                as: "updatedBy"
            }
        },
        {
            $unwind: {
                path: '$updatedBy',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from:"logbook",
                localField: "logbook",
                foreignField: "_id",
                as: "logbook"
            }
        },
        {
            $unwind: {
                path: '$logbook',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from:"tag",
                localField: "tags",
                foreignField: "_id",
                as: "tags"
            }
        },
        { 
            $project: { 
                'attachments': 0
            } 
        },
    ]

    let log;
    let attachments = [];
    try {
        let data = await Log.aggregate(pipeline);
        if(!data || !data[0]) {
            console.log(`Log ${logId} is not found.`);
            return;
        }
            
        log = data[0];

        // If there are no observers in the logbook, no need to send email.
        if(!log.logbook || !log.logbook.observers || !log.logbook.observers.length) {
            return;
        }

        let date = new Date(log.createdAt);
        let month = date.getUTCMonth() + 1; //months from 1-12
        let day = date.getUTCDate();
        let year = date.getUTCFullYear();

        let fileDir = path.join(rootdir, year.toString(), month.toString(), day.toString(), log._id.toString());

        if(fs.existsSync(fileDir)) {
            let files = await fs.readdir(fileDir);
            if(files && files.length) {
                for (const file of files){
                    let fileFullPath = path.join(fileDir, file);
                    attachments.push({ filename: file, path: fileFullPath });
                }
            }
        }
    } catch(error) {
        console.log(error.message);
        return;
    }

    let transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass
        }
    });

    let to = log.logbook.observers.join();

    let html = `
        <table border="1">
            <tr>
                <td width="20%" style="background-color: RGB(179, 217, 255); padding: 5px;">Logbook</td>
                <td width="80%" style="background-color: RGBA(221, 238, 187); padding: 5px;">${log.logbook.name}</td>
            </tr>
            <tr>
                <td width="20%" style="background-color: RGB(179, 217, 255); padding: 5px;">Author</td>
                <td width="80%" style="background-color: RGBA(221, 238, 187); padding: 5px;">${log.updatedBy.name}</td>
            </tr>
            <tr>
                <td width="20%" style="background-color: RGB(179, 217, 255); padding: 5px;">Author Email</td>
                <td width="80%" style="background-color: RGBA(221, 238, 187); padding: 5px;">${log.updatedBy.email}</td>
            </tr>
            <tr>
                <td width="20%" style="background-color: RGB(179, 217, 255); padding: 5px;">Tag</td>
                <td width="80%" style="background-color: RGBA(221, 238, 187); padding: 5px;">${log.logbook.tags && log.logbook.tags.length ? log.logbook.tags.join(', ') : ''}</td>
            </tr>
            <tr>
                <td width="20%" style="background-color: RGB(179, 217, 255); padding: 5px;">Category</td>
                <td width="80%" style="background-color: RGBA(221, 238, 187); padding: 5px;">${log.category}</td>
            </tr>
            <tr>
                <td width="20%" style="background-color: RGB(179, 217, 255); padding: 5px;">Title</td>
                <td width="80%" style="background-color: RGBA(221, 238, 187); padding: 5px;">${log.title}</td>
            </tr>
            <tr>
                <td width="20%" style="background-color: RGB(179, 217, 255); padding: 5px;">Log URL</td>
                <td width="80%" style="background-color: RGBA(221, 238, 187); padding: 5px;">${operation==='delete' ? '' : frontendConfig.url+'/logdetail/'+log._id}</td>
            </tr>
        </table>
        <hr style="margin-top: 2em; margin-bottom: 2em;">
        ${log.description}
    `;

    let subject;
    switch(operation) {
        case 'create':
            subject = `Logbook ${log.logbook.name}: ${log.title} created by ${log.createdBy.name}`;
            html = `<p>A new entry has been created by ${log.createdBy.name}</p>` + html;
            break;
        case 'update':
            subject = `Logbook ${log.logbook.name}: ${log.title} updated by ${log.updatedBy.name}`;
            html = `<p>An entry has been updated by ${log.updatedBy.name}</p>` + html;
            break;
        case 'delete':
            subject = `Logbook ${log.logbook.name}: ${log.title} deleted by ${log.updatedBy.name}`;
            html = `<p>An entry has been deleted by ${log.updatedBy.name}</p>` + html;
            break;
        default:
            console.log("Unknown log operation");
            return;
    }
        
    let mailOptions = {
        // from: smtpConfig.user,
        from: `${smtpConfig.name} <${smtpConfig.user}>`,
        to: to,
        subject: subject,
        text: log.description,
        html: html,
        // html: '<h1>Welcome</h1><p>That was easy!</p>',
        attachments: attachments,
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${to}    Response: ${info.response}`);
    } catch(error) {
        console.log(error.message);
        return;
    }
}


module.exports = {
    sendMail,
    notifyLogUpdate,
}