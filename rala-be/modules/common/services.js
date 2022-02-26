const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const { uuid } = require('uuidv4');

exports.getRandomUniqueId = function(prefix) {

    return prefix + "_" + uuid();

}

exports.sendMail = async function(data) {

    var options = {};

    if(process.env.MAIL_API == "oauth2") {
        options= {
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.MAIL_USERNAME,
                clientId: process.env.MAIL_CLIENT_ID,
                clientSecret: process.env.MAIL_CLIENT_SECRET,
                refreshToken: process.env.MAIL_REFRESH_TOKEN
            }
        }
    } else if(process.env.MAIL_API == "gmail") {
        options = {
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        }

    }
    let transporter = nodemailer.createTransport(options);

    transporter.sendMail(data, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log("Sent a new email");
        }
    })

}


exports.generateToken = function(data) {

    data = JSON.parse(JSON.stringify(data));

    var token = jwt.sign(data, fixedData.JWT_KEY, {
        expiresIn: fixedData.JWT_EXPIRY
    })

    return token;

}


exports.isValidToken = function(token, callback) {

    jwt.verify(token, fixedData.JWT_KEY, function(err, data) {
        callback(err, data);
    })

}

exports.generateResetToken = function(data) {

    var token = jwt.sign(data, fixedData.JWT_RESET_KEY, {
        expiresIn: fixedData.JWT_RESET_EXPIRY
    })

}

exports.isValidResetToken = function(token, callback) {

    jwt.verify(token, fixedData.JWT_RESET_KEY, function(err, data) {
        callback(err, data);
    })

}