const admin = require("firebase-admin");
const service_account = require("../assignment-5d16f-firebase-adminsdk-2ga7f-65bf63ab1c.json");
const options = {
  priority: "high",
  timeToLive: 60 * 60 * 24,
};
admin.initializeApp({
  credential: admin.credential.cert(service_account),
  databaseURL: "https://assignment-5d16f.firebaseio.com",
});

const push_notification = (device_token,message) => {
  admin
    .messaging()
    .sendToDevice(device_token, message, options)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = push_notification;
