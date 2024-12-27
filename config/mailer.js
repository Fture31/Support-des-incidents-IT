require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // utilisez votre service de messagerie (par ex. Gmail)
    auth: {
        user: process.env.EMAIL_USER, // votre email
        pass: process.env.EMAIL_PASS  // votre mot de passe
    }
});

module.exports = transporter;

