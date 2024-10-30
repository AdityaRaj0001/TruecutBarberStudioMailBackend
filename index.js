const express = require("express");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(
  cors({
    origin: "*", // Replace with your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow cookies and other credentials if needed
  })
);
app.options("*", cors()); // Allow preflight requests for all routes

app.get("/", (req, res) => {
  res.send("Hello World!");
});
let transport = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.post("/message", (req, res) => {
  const { email, subject, message } = req.body; // Get data from the request body
  let recipient = email;

  const mailOptionsToUser = {
    from: process.env.EMAIL_USERNAME,
    to: recipient, // Use the provided email as the recipient
    subject: `Message Recieved: ${subject}`,
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      
    </style>
  </head>
  <body>
    <h3>Here's what we have recieved:</h3>
    <p><span>"</span>${message}<span>"</span></p>
    <p style={{ marginTop: '16px', color: '#6B7280' }}>
  Thanks a lot for reaching out to us! We really appreciate your feedback.
</p>
  </body>
</html>`, // Include the message in the email body
  };

  // Send the first email to the provided recipient
  transport.sendMail(mailOptionsToUser, (err, info) => {
    if (err) {
      console.error("Error sending email to user:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send email to user" });
    }

    // Create mail options for the hardcoded recipient
    const mailOptionsToTrueCut = {
      from: process.env.EMAIL_USERNAME,
      to: "rback499@gmail.com", // Hardcoded recipient
      subject: `New Message Recieved: ${subject}`,
      html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
          </head>
          <body>
            <h1>${subject}</h1>
            <p>${message}</p>
            <span>Sender: ${email}</span>
          </body>
        </html>
      `, // Template with issue title, body, and sender
    };

    // Send the second email to the hardcoded recipient
    transport.sendMail(mailOptionsToTrueCut, (err, info) => {
      if (err) {
        console.error("Error sending email to truecut:", err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to send email to truecut" });
      }

      // Both emails were sent successfully
      res.json({ success: true, message: "Emails sent successfully" });
    });
  });
});

transport.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
