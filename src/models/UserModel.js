const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  contact: { type: String },
  address: { type: String },
  role: {
    type: String,
    enum: ["admin", "subadmin", "staff", "doctor", "patient"],
    default: "patient",
  },
  departmentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
  specialization: { type: String },
  availableSlots: [{ day: String, start: String, end: String }],
  createdAt: { type: Date, default: Date.now },
});

// Add indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ departmentIds: 1 });
userSchema.index({ specialization: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
