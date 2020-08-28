const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "olololoe1001st2@gmail.com",
    pass: "Hantinh12120",
  },
});

exports.send_mail = async (res,mailOptions, userNew) => {

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
        res.json({
            success: false,
            data: {},
            status_code: 500,
            messages: "Error: "+ error,
          });
      console.log(error);
    } else {
      res.json({
        success: true,
        data: {},
        status_code: 200,
        messages: ` Successfully! Sent to ${userNew.email}`,
      });
    }
  });
  // end
};
  exports.send_mail_2= async (res,mailOptions, userNew) => {

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
          res.json({
              success: false,
              data: {},
              status_code: 500,
              messages: "Error: "+ error,
            });
        console.log(error);
      } else {
        res.json({
          success: true,
          data: {},
          status_code: 200,
          messages: ` Successfully! Sent to ${userNew.email}`,
        });
      }
    });
    // end
  };
