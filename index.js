require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/User');
const Attendance = require('./models/Attendance');

const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use(cors({ origin: '*' }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// --- NEW ROUTE: Generate User ---
app.post('/api/user/setup', async (req, res) => {
  try {
    const newUuid = uuidv4();
    const newUser = new User({ uuid: newUuid });
    await newUser.save();
    
    res.status(201).json({ 
      message: 'Workspace generated successfully', 
      uuid: newUuid
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Failed to generate tracker' });
  }
});

// Helper function to figure out the quarter from a YYYY-MM-DD string
const getQuarter = (dateString) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const quarter = Math.ceil(month / 3);
  return `Q${quarter}-${year}`;
};

// --- NEW ROUTE: Log a Day ---
app.post('/api/attendance/log', async (req, res) => {
  try {
    const { userId, date, status } = req.body;
    const quarterId = getQuarter(date);

    // Update if exists, otherwise create new (upsert)
    const record = await Attendance.findOneAndUpdate(
      { userId, date },
      { status, quarterId },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Day logged successfully', record });
  } catch (error) {
    console.error('Error logging day:', error);
    res.status(500).json({ error: 'Failed to log day' });
  }
});

// --- NEW ROUTE: Get User Data ---
app.get('/api/attendance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await Attendance.find({ userId });
    res.status(200).json({ records });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// --- NEW ROUTE: Delete a Logged Day ---
app.delete('/api/attendance/remove', async (req, res) => {
  try {
    const { userId, date } = req.body;
    await Attendance.findOneAndDelete({ userId, date });
    res.status(200).json({ message: 'Day removed successfully' });
  } catch (error) {
    console.error('Error removing day:', error);
    res.status(500).json({ error: 'Failed to remove day' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});