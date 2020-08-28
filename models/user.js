const mongose = require("mongoose");
const UserSchema = new mongose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  user_name: {
    type: String,
    required: true,
  },
  role_id: {
    type: Number,
    required: true,
  },
  image_path: {
    type: String,
    default: undefined,
  },
  device_token: {
    type: String,
    default: undefined,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  reset_password_code: {
    type: String,
    default: undefined,
  },
  reset_password_expires: {
    type: Date,
    default: undefined,
  },
  phone: {
    type: String,
    default: undefined,
  },
  date:{
      type:Date,
      default:Date.now()
  }
});
const User = mongose.model("User", UserSchema);
module.exports = User;
