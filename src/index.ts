import { SMTPServer } from "smtp-server";
import sendEmail from "./sendMail";

const receiveServer = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,

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
        to: "developer.akash8@gmail.com",
        subject: "Message Received",
        text: "Thank you for your email!",
      });

      callback();
    });
  },
});

receiveServer.listen(25, () => {
  console.log("Server listening on port 25");
});
