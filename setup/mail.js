const nodemailer = require('nodemailer');
const env        = process.env.NODE_ENV || 'development';
const config     = require(__dirname + '/../config/config.json')[env];
/**
 * mail setup
 */

let smtpConfig = {
    pool: true,
    service: config.smtp.service,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.password
    }
};

let transporter = nodemailer.createTransport(smtpConfig);

module.exports = transporter;