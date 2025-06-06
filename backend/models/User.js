const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  appPassword: { type: String, required: true },
  otpVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  emails: { type: Array, default: [] }, // Added emails field to store fetched emails
  lastEmailFetchAt: { type: Date }, // New field to store last email fetch timestamp
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
