// const nodemailer = require("nodemailer");
// const { google } = require("googleapis");
// require("dotenv").config();

// async function mailReq(to, subject, text, html) {
//   // const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = process.env;

//   const clientId =
//     "392984850922-igevnrntt077chv8kuiek8epit8hnelu.apps.googleusercontent.com";
//   const clientSecret = "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";
//   const redirectUri = REDIRECT_URI;
//   const refreshToken = "https://oauth2.googleapis.com/token";

//   const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
//   auth.setCredentials({ refresh_token: refreshToken });

//   try {
//     const accessToken = await auth.getAccessToken();

//     const transport = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: "userMail@gmail.com",
//         clientId,
//         clientSecret,
//         refreshToken,
//         accessToken,
//       },
//     });

//     const mailOptions = { to, subject, text, html };

//     transport.sendMail(mailOptions, (err) => {
//       if (err) return null;
//       return res.send("Email Sent :)");
//     });
//   } catch (error) {
//     return `Opss... An error occurred! The email was not sent: ${error.message}`;
//   }
// }

// exports.mailReq = mailReq;
