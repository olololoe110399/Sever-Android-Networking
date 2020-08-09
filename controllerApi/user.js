const User = require("../models/user");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const crypto = require("crypto-random-string");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const insecureHandlebars = allowInsecurePrototypeAccess(Handlebars);
const send_mail = require("../config/send_mail");
const push_notification = require("../config/push_notification");

// delete User
// start
exports.deleteUser = (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      res.json({
        success: true,
        data: {},
        status_code: 200,
        messages: "Delete Successfully!",
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        data: [],
        status_code: 500,
        messages: "There was a problem when finding the users.",
      });
    });
};
// end

// get All User
// start
exports.getAllUser = async (req, res) => {
  await User.find({}, { password: 0, device_token: 0 })
    .then((users) => {
      res.json({
        success: true,
        data: users,
        status_code: 200,
        messages: "Get users successfully!",
      });
    })
    .catch((err) => {
      res.json({
        success: false,
        data: [],
        status_code: 500,
        messages: "There was a problem when finding the users.",
      });
    });
};
//end

// login user
// start
exports.checkLogin = async (req, res) => {
  const { email, password, device_token } = req.body;
  // check email
  await User.findOne({ email: email })
    .then((user) => {
      if (!user)
        res.json({
          success: false,
          data: {},
          status_code: 404,
          messages: "That email is not resgistered!",
        });
      else {
        // check password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            // check account is active
            if (user.isActive) {
              user.device_token = device_token;
              user
                .save()
                .then((newUser) => {
                  const token = jwt.sign({ id: user._id }, config.secret, {
                    expiresIn: 86400, // expires in 24 hours
                  });
                  res.json({
                    success: true,
                    data: {
                      user: {
                        image_path: newUser.image_path,
                        _id: newUser._id,
                        user_name: newUser.user_name,
                        email: newUser.email,
                        role_id: newUser.role_id,
                        isActive: newUser.isActive,
                      },
                      auth_token: token,
                      is_admin: newUser.role_id == 0 ? true : false,
                    },
                    status_code: 200,
                    messages: "Login Successfully!",
                  });
                })
                .catch((err) => {
                  res.json({
                    success: false,
                    data: {},
                    status_code: 500,
                    messages: "There was a problem when save device token.",
                  });
                });
            } else {
              res.json({
                success: false,
                data: {},
                status_code: 401,
                messages:
                  "Your account has not been activated. Please check your email!",
              });
            }
            //end
          } else {
            res.json({
              success: false,
              data: {},
              status_code: 401,
              messages: "Password is incorrect!",
            });
          }
        });
      }
    })
    .catch((err) => {
      res.json({
        success: false,
        data: {},
        status_code: 500,
        messages: "There was a problem when finding the user.",
      });
    });
};
// end

// register user
// start
exports.checkRegister = async (req, res) => {
  const { email, password, user_name, role_id } = req.body;
  await User.findOne({ email: email })
    .then((user) => {
      if (user)
        res.json({
          success: false,
          data: {},
          status_code: 404,
          messages: "That email is resgistered!",
        });
      else {
        const newUser = new User(req.body);
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //bcrypt password
            newUser.password = hash;
            newUser
              .save()
              .then(async (userNew) => {
                // send mail
                const host = req.get("host");
                const link =
                  "http://" + host + "/api/user/verify?id=" + userNew._id;
                const file = await fs.readFileSync(
                  "public/assets/confirm.html"
                );
                const html = await file.toString("utf-8");
                const template = await insecureHandlebars.compile(html);
                const newHtml = template({
                  user: userNew.user_name,
                  link: link,
                });
                const mailOptions = {
                  from: "olololoe1001st2@gmail.com",
                  to: userNew.email,
                  subject: "Please confirm your Email adress",
                  html: newHtml,
                };
                send_mail(res, mailOptions, userNew);
              })
              .catch((err) => {
                console.log(err);
                res.json({
                  success: false,
                  data: {},
                  status_code: 500,
                  messages: "There was a problem when registering the user.",
                });
              });
          })
        );
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        data: {},
        status_code: 500,
        messages: "There was a problem when finding the user.",
      });
    });
};
// end

// logout
// start
exports.logout = async (req, res) => {
  let device_token = req.body.device_token;
  await User.findOne({ device_token: device_token })
    .then((user) => {
      if (user) {
        user.device_token = "";
        user
          .save()
          .then((newUser) => {
            res.json({
              success: true,
              data: {},
              status_code: 404,
              messages: "Logout Successfully!",
            });
          })
          .catch((err) => {
            res.json({
              success: false,
              data: {},
              status_code: 500,
              messages: "There was a problem when remove device token.",
            });
          });
      } else {
        res.json({
          success: false,
          data: {},
          status_code: 404,
          messages: "Not Found User ",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        data: {},
        status_code: 500,
        messages: "There was a problem when finding the user.",
      });
    });
};
// end

// Verify email
// start
exports.verifyEmail = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.query.id },
    { $set: { isActive: true } },
    { new: true }
  )
    .then((user) => {
      if (user) {
        res
          .status(200)
          .end(
            " Chúc mừng " +
              user.user_name +
              " đã đăng ký tài khoản thành công! <3<3"
          );
      } else {
        res.end("<h1>Bad Request</h1>");
      }
    })
    .catch((err) => {
      res.json({
        success: false,
        data: {},
        status_code: 500,
        messages: "There was a problem when verify the user.",
      });
    });
};
// end

// Forget Password
exports.forgotPassword = async (req, res) => {
  await User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        const code = crypto({ length: 6, type: "numeric" });
        user.reset_password_code = code;
        user.reset_password_expires = Date.now() + 3600000;
        user
          .save()
          .then((newUser) => {
            // send mail
            const file = fs.readFileSync("public/assets/forgot.html");
            const html = file.toString("utf-8");
            const template = insecureHandlebars.compile(html);
            const newHtml = template({
              user: newUser.email,
              code: code,
            });
            const mailOptions = {
              from: "olololoe1001st2@gmail.com",
              to: newUser.email,
              subject: "Send Code Password Reset",
              html: newHtml,
            };
            send_mail(res, mailOptions, newUser);
          })
          .catch((err) => {
            res.json({
              success: false,
              data: {},
              status_code: 500,
              messages: "There was a problem when save reset password code.",
            });
          });
      } else {
        res.json({
          success: false,
          data: {},
          status_code: 401,
          messages: "That user is not found!",
        });
      }
    })
    .catch((err) => {
      res.json({
        success: false,
        data: {},
        status_code: 500,
        messages: "There was a problem when finding the user.",
      });
    });
};
//end

// Reset Password
exports.resetPassword = async (req, res) => {
  await User.findOne({
    reset_password_code: req.params.code,
    reset_password_expires: { $gt: Date.now() },
  })
    .then((user) => {
      if (user) {
        user.reset_password_code = undefined;
        user.reset_password_expires = undefined;
        user
          .save()
          .then((newUser) => {
            res.json({
              success: true,
              data: {},
              status_code: 200,
              messages: "Change password successfully!",
            });
          })
          .catch((err) => {
            res.json({
              success: false,
              data: {},
              status_code: 500,
              messages: "There was a problem when save reset password code.",
            });
          });
      } else {
        res.json({
          success: false,
          data: {},
          status_code: 401,
          messages: "That user is not found!",
        });
      }
    })
    .catch((err) => {
      res.json({
        success: false,
        data: {},
        status_code: 500,
        messages: "There was a problem when finding the user.",
      });
    });
};
// end

// const message = {
//   notification: {
//     title: "title",
//     body: "messages",
//   },
//   data: {
//     title: "title",
//     body: "messages",
//     image: "",
//     id: "0",
//     type: "alo",
//   },
// };
// push_notification(device_token,message);
