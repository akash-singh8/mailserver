const SMTPConnection = require("nodemailer/lib/smtp-connection");
import dns from "dns";

async function sendMail(rawEmail: string, recipient: string) {
  return new Promise((resolve, reject) => {
    // Extract the domain from the recipient address
    const recipientDomain = recipient.split("@")[1];

    // Perform an MX lookup to get the recipient’s mailserver
    dns.resolveMx(recipientDomain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return reject(
          new Error("Failed to resolve MX records for " + recipientDomain)
        );
      }

      // Sort by priority and choose the top MX record
      addresses.sort((a, b) => a.priority - b.priority);
      console.log("Addresses :", addresses);
      const mxRecord = addresses[0].exchange;
      console.log(`Forwarding email to MX server: ${mxRecord}`);

      // Create an SMTP connection to the recipient's mailserver
      const connection = new SMTPConnection({
        host: mxRecord,
        port: 25,
        secure: false,
      });

      connection.connect(() => {
        connection.send(
          { from: "hello@devakash.in", to: [recipient] },
          rawEmail,
          (err: any, info: any) => {
            connection.quit();
            if (err) {
              return reject(err);
            }
            console.log(`Email forwarded to ${recipient}: ${info.response}`);
            resolve(info);
          }
        );
      });

      connection.on("error", (err: any) => {
        reject(err);
      });
    });
  });
}

export default sendMail;
