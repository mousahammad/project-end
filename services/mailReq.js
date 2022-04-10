const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const config = require("config");
const res = require("express/lib/response");

//mail:projectdog30@outlook.co.il
//pass:Project1234!
async function mailReq(to, subject, text, html) {
  try {
    const transport = nodemailer.createTransport({
      service: config.get("service"),
      auth: {
        user: config.get("email"),
        pass: config.get("pass"),
      },
    });

    const mailOptions = {
      from: config.get("email"),
      to,
      subject,
      text,
      html,
    };

    transport.sendMail(mailOptions, (err, info) => {
      if (err) return res.send("the mail isnt sent");
      if (info) return res.send("Email Sent :)");
    });
  } catch (error) {
    return `Opss... An error occurred! The email was not sent: ${error.message}`;
  }
}

module.exports = { mailReq };
