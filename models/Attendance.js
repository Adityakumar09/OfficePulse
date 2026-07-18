const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  date: { type: String, required: true },   // Format: YYYY-MM-DD
  status: { type: String, enum: ['office', 'wfh', 'holiday'], default: 'office' },
  quarterId: { type: String, required: true } // Format: e.g., "Q3-2026"
});

// Ensure a user can only have one record per specific calendar date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);