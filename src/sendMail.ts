import nodemailer from "nodemailer";

// Configure your mail transporter (for sending)
const transporter = nodemailer.createTransport({
  host: "18.215.159.195", // localhost or your server IP
  port: 25,
  secure: false, // or true if using TLS on port 465,
  tls: {
    rejectUnauthorized: false, // Disable certificate verification
  },
  auth: {
    user: "username",
    pass: "password",
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
