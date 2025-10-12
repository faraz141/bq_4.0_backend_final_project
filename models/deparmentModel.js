const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for performance
departmentSchema.index({ name: 1 }, { unique: true });
departmentSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Department', departmentSchema);
