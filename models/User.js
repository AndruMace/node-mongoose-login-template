const mongoose = require("mongoose");

//simple schema
const UserSchema = new mongoose.Schema({
  // role: {
  //   type: String,
  //   require: true
  // },
  // comments: {
  //   type: String
  // },
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);

