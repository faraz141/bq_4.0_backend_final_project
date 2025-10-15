const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    required: false, 
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { 
    type: String, 
    enum: ["Male", "Female", "Other"], 
    required: true 
  },
  address: { type: String },
  emergencyContact: { type: String },
  medicalHistory: [{ 
    condition: String,
    date: Date,
    notes: String 
  }],
  createdAt: { type: Date, default: Date.now },
});


patientSchema.index({ email: 1 });
patientSchema.index({ contact: 1 });


patientSchema.pre("save", async function (next) {
  if (this.isNew) {
   
    const year = new Date().getFullYear();
    const count = await mongoose.model("Patient").countDocuments();
    const paddedCount = String(count + 1).padStart(6, '0');
    this.patientId = `PAT-${year}-${paddedCount}`;
  }
  next();
});

module.exports = mongoose.model("Patient", patientSchema);