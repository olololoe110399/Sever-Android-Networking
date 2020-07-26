const mongose = require ('mongoose');
const UserSchema = new mongose.Schema ({
  full_name: {
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
  role_id:{
      type:Number,
      required:true,
  }
});
const User = mongose.model ('User', UserSchema);
module.exports = User;