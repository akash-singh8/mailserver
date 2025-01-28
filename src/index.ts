import { SMTPServer } from "smtp-server";

const server = new SMTPServer({
  // we added next two config as right now we are not handling the sending part of the email, as in that case we also need to handle ssl certificates & all
  allowInsecureAuth: true,
  authOptional: true,

  onConnect(session, callback) {
    console.log("OnConnect session :", session);
    callback(); // accepts the connection
    // callback(new Error('Cannot accept the connection')) denies the connection
  },

  onMailFrom(address, session, callback) {
    console.log("onMailFrom :::", address, session.id);
    callback();
  },

  onRcptTo(address, session, callback) {
    console.log("onReceiptTo", address, session.id);
    // here we need to add check for if the receipient email is correct or not, basically the user eg. akash@
    callback();
  },

  onData(stream, session, callback) {
    stream.on("data", (chunk) => {
      // store it on the database, so we can see it on a interface
      console.log("Receiving data :::", chunk.toString());
    });
    stream.on("end", callback);
  },
});

server.listen(25, () => {
  console.log("Server listening on port 25");
});
