const nodemailer = require("nodemailer");
const { google } = require("googleapis");
//require("dotenv").config();

//mail:projectdog30@gmail.com
//pass:Project1234!
async function mailReq(to, subject, text, html) {
  // const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = process.env;

  const clientId =
    "128729560388-41l47hrpcdr77m7jpe5s8144pvh0ugm6.apps.googleusercontent.com";

  const clientSecret = "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";
  const redirectUri = "https://developers.google.com/oauthplayground";
  const refreshToken =
    "1//04G-YAsyWzBQlCgYIARAAGAQSNwF-L9IrP20Kx8Z3iRBbc1kAgghauVxmIOcrRlA2VXHKrWiuc393G9LB_Q8v_qJXJY78a5k69L0";

  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  auth.setCredentials({ refresh_token: refreshToken });

  try {
    const accessToken = await auth.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "projectdog30@gmail.com",
        clientId,
        clientSecret,
        refreshToken,
        accessToken,
      },
    });

    const mailOptions = { to, subject, text, html };

    transport.sendMail(mailOptions, (err, info) => {
      if (err) return null;
      return res.send("Email Sent :)");
    });
  } catch (error) {
    return `Opss... An error occurred! The email was not sent: ${error.message}`;
  }
}

module.exports = { mailReq };
