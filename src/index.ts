import { SMTPServer } from "smtp-server";
import fs from "fs";
import { config } from "dotenv";
config();
import sendEmail from "./sendMail";

const receiveServer = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,
  logger: true,

  // Enable TLS
  secure: true,
  key: fs.readFileSync("/etc/letsencrypt/live/mail.devakash.in/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/mail.devakash.in/fullchain.pem"),

  onAuth(auth, session, callback) {
    console.log("Inside Auth Request :", session);
    console.log("Auth object :", auth);

    // Perform the credential check here:
    if (
      auth.username === process.env.USERNAME &&
      auth.password === process.env.PASSWORD
    ) {
      return callback(null, { user: auth.username });
    }

    // If credentials fail, return an error
    return callback(new Error("Invalid username or password"));
  },

  onConnect(session, callback) {
    console.log("OnConnect session:", session);
    callback();
  },

  onMailFrom(address, session, callback) {
    console.log("onMailFrom:", address, session.id);
    callback();
  },

  onRcptTo(address, session, callback) {
    console.log("onReceiptTo:", address, session.id);
    const recipientDomain = address.address.split("@")[1];

    if (recipientDomain === "devakash.in") {
      console.log("Local recipient:", address.address);
      return callback();
    }

    // Reject emails for external domains
    return callback(new Error("Relaying not allowed"));
  },

  onData(stream, session, callback) {
    let emailData = "";

    stream.on("data", (chunk) => {
      emailData += chunk.toString();
    });

    stream.on("end", () => {
      console.log("Received email:", emailData);

      // Store email in database
      // Auto-reply example
      sendEmail({
        from: "hello@devakash.in",
        to: "cleverakash1@gmail.com",
        subject: "Message Received",
        text: "Thank you for your email!",
      });

      callback();
    });
  },
});

receiveServer.listen(465, () => {
  console.log("Server listening on port 465 with TLS");
});
