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
const mail = require("../config/send_mail");
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
                if (userNew.role_id == 1) {
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
                  mail.send_mail(res, mailOptions, userNew);
                } else {
                  const file = await fs.readFileSync(
                    "public/assets/confirm_admin.html"
                  );
                  const html = await file.toString("utf-8");
                  const template = await insecureHandlebars.compile(html);
                  const newHtml = template({
                    email: userNew.email,
                    link: link,
                  });
                  const mailOptions = {
                    from: "olololoe1001st2@gmail.com",
                    to: "olololoe1001st2@gmail.com",
                    subject: "Please confirm administrator form member",
                    html: newHtml,
                  };
                  mail.send_mail(res, mailOptions, userNew);
                }
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
        user.device_token = undefined;
        user
          .save()
          .then((newUser) => {
            res.status(401).send({
              success: true,
              data: {},
              status_code: 200,
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
        res.status(401).send({
          success: true,
          data: {},
          status_code: 401,
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
    .then(async (user) => {
      if (user) {
        if (user.role_id == 0) {
          const file = await fs.readFileSync("public/assets/confirm2.html");
          const html = await file.toString("utf-8");
          const template = await insecureHandlebars.compile(html);
          const newHtml = template({
            user: user.user_name,
          });
          const mailOptionAdmin = {
            from: "olololoe1001st2@gmail.com",
            to: user.email,
            subject: "Welcome to C4F Community!",
            html: newHtml,
          };
          mail.send_mail_2(res, mailOptionAdmin, user);
        }
        res.render("confirm");
      } else {
        res.end("Bad Request");
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
            mail.send_mail(res, mailOptions, newUser);
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
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            user.reset_password_code = undefined;
            user.reset_password_expires = undefined;
            user.password = hash;
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
                  messages:
                    "There was a problem when save reset password code.",
                });
              });
          })
        );
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

// getUserDetail
exports.getUser = (req, res) => {
  let id = req.params.id;
  User.findById(id, { password: 0, device_token: 0 })
    .then((user) => {
      if (user)
        res.json({
          success: true,
          data: user,
          status_code: 200,
          messages: "Get User Successfully!",
        });
      else
        res.status(401).send({
          success: false,
          data: {},
          status_code: 401,
          messages: "Not found user!",
        });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        data: {},
        status_code: 500,
        messages: "There was a problem when get User details.",
      });
    });
};

exports.editUser = (req, res) => {
  User.findByIdAndUpdate(req.params.id, req.body, (err, user) => {
    if (err) {
      console.log(err);
      res.json({
        success: false,
        data: {},
        status_code: 500,
        messages: "There was a problem when update the user",
      });
    } else {
      res.json({
        success: true,
        data: {},
        status_code: 200,
        messages: "Update user '" + user.email + "' Successfully!",
      });
    }
  });
};
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
