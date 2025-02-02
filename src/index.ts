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
    callback();
  },

  onData(stream, session, callback) {
    let emailData = "";

    stream.on("data", (chunk) => {
      emailData += chunk.toString();
    });

    stream.on("end", () => {
      console.log("Received email:", emailData);

      const recipients = session.envelope.rcptTo.map((usr) => usr.address);

      recipients.forEach(async (recipient) => {
        const rcptDomain = recipient.split("@")[1];

        if (rcptDomain !== "devakash.in") {
          try {
            await sendEmail(emailData, recipient);
          } catch (err) {
            console.error(`Error sending email to ${recipient}:`, err);
            // handle errors (e.g., queue for retry) instead of just logging.
          }
        } else {
          console.log("Cannot send email to the same recipient :", recipient);
        }
      });

      callback();
    });
  },
});

receiveServer.listen(465, () => {
  console.log("Server listening on port 465 with TLS");
});
