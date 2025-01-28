import nodemailer from "nodemailer";

// Configure your mail transporter (for sending)
const transporter = nodemailer.createTransport({
  host: "localhost", // Using your own server for sending
  port: 25,
  secure: false, // true for 465, false for other ports
  tls: {
    rejectUnauthorized: false, // For self-signed certificates
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
