const dotenv = require('dotenv');
dotenv.config();

const nodemailer = require('nodemailer');
const Verify = require('../utils/verify')

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});


let ContractSender = (to) => {
  let mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'VocalRiser Contract',
    text: 'Congratulations!',
    attachments: [{
      filename: 'contract.pdf',
      path: './contract.pdf',
      contentType: 'application/pdf'
    }],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}



let MailSender = (to, token) => {
  let mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'You registered successfully',
    text: 'That was easy!',
    html: Verify.confirmEmail(token)
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}


module.exports = {
  Vocalist: 'V',
  Producer: 'P',
  Male: 'M',
  Female: 'F',
  Both: 'VP',
  MailSender,
  ContractSender
}