const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  cnic: { type: String, required: true, unique: true },
  role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
  password: { type: String, required: true },
  otp: { type: String }, // For Forgot Password
  sellerStats: {
    totalSales: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  }
},{ timestamps: true });

// Add the matchPassword method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model("User", UserSchema);
