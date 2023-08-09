const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide with a name']
  },
  emailId: {
    type: String,
    required: [true, "Please provide username"],
    match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide a valid email ID!'],
    unique: [true, "This username already exists"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
});

module.exports = userSchema;