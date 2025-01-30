import { SMTPServer } from "smtp-server";
import sendEmail from "./sendMail";
import fs from "fs";
import { config } from "dotenv";
config();

const receiveServer = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,

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
    callback();
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
