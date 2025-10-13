const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    required: false, // Auto-generated in pre-save hook, so not required at creation
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

// Add indexes for performance (patientId index is automatic via unique: true)
patientSchema.index({ email: 1 });
patientSchema.index({ contact: 1 });

// Generate patient ID automatically
patientSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Generate patient ID in format: PAT-YYYY-NNNNNN
    const year = new Date().getFullYear();
    const count = await mongoose.model("Patient").countDocuments();
    const paddedCount = String(count + 1).padStart(6, '0');
    this.patientId = `PAT-${year}-${paddedCount}`;
  }
  next();
});

module.exports = mongoose.model("Patient", patientSchema);