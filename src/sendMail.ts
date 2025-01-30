import nodemailer from "nodemailer";
import fs from "fs";

// Configure your mail transporter (for sending)
const transporter = nodemailer.createTransport({
  host: "18.215.159.195", // localhost or your server IP
  port: 465,
  secure: true, // Enable TLS
  tls: {
    key: fs.readFileSync("/etc/letsencrypt/live/mail.devakash.in/privkey.pem"),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/mail.devakash.in/fullchain.pem"
    ),
  },
  auth: {
    user: process.env.USERNAME,
    pass: process.env.PASSWORD,
  },
});

// Email sending function
async function sendEmail({
  from,
  to,
  subject,
  text,
}: {
  from: string;
  to: string;
  subject: string;
  text: string;
}) {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export default sendEmail;
