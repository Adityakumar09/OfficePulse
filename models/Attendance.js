const attendanceSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // References User.uuid
  date: { type: String, required: true },   // Stored as ISO string YYYY-MM-DD to avoid timezone shifts
  status: { type: String, enum: ['office', 'wfh', 'holiday'], default: 'office' },
  quarterId: { type: String, required: true } // format: "2026-Q3"
});
// Composite index to ensure one unique record per user per calendar date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });