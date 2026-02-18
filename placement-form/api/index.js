require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (Frontend) if running locally
app.use(express.static(path.join(__dirname, '../public')));

// --- 1. MONGODB CONNECTION (Optimized for Vercel) ---
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return; 
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Error:", err);
    }
};

// --- 2. DATA SCHEMA ---
const StudentSchema = new mongoose.Schema({
    name: String,
    prn: String,
    classYear: String,
    branch: String,
    email: String,
    companies: String,
    reason: String,
    date: { type: Date, default: Date.now }
});
const Student = mongoose.model('Student', StudentSchema);

// --- 3. API ROUTE ---
app.post('/api/submit', async (req, res) => {
    await connectDB();
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(200).json({ message: "Data Saved Successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to save data" });
    }
});

// Default Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// --- 4. SERVER START (Local Only) ---
// This allows it to run locally on port 3000, but export for Vercel
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;