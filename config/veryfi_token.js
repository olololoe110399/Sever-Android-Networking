const jwt = require("jsonwebtoken");
const config = require("./config");

const verify_token = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"]; // Express headers are auto converted to lowercase
  if (token != undefined && token != null) {
    if (token.startsWith("Bearer ")) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
    jwt.verify(token, config.secret,  (err, decoded) => {
      if (err)
        return res.json({
          success: false,
          data: [],
          status_code: 401,
          messages: "Failed to authenticate token.",
        });
      next();
    });
  } else {
    return res.json({
      success: false,
      data: [],
      status_code: 404,
      messages: "No token provided.",
    });
  }
};

module.exports = verify_token;
