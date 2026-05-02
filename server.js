const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 10000;

// Increase payload limit because images (base64 strings) can be large!
app.use(cors());
app.use(express.json({ limit: '10mb' })); 

const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to Permanent MongoDB Database!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 1. UPGRADED DATABASE SCHEMA (Now holds EVERYTHING)
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    studentClass: String,
    term: String,
    photoData: String, // This stores the image!
    subjects: Array,   // This stores the list of subjects and scores
    affective: Object, // This stores the 1-5 ratings
    remarks: Object    // This stores the teacher/principal comments
});

const Student = mongoose.model('Student', studentSchema);

app.get('/api/check-result', async (req, res) => {
    try {
        const studentName = req.query.name.trim();
        const studentId = req.query.id.trim().toUpperCase();

        const student = await Student.findOne({ 
            id: studentId,
            name: { $regex: new RegExp(`^${studentName}$`, 'i') } 
        });

        if (student) {
            res.json([student]); 
        } else {
            res.status(404).json({ message: "Student not found in database." });
        }
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: "Server error searching database." });
    }
});

// 2. UPGRADED UPLOAD ROUTE
app.post('/api/upload-result', async (req, res) => {
    try {
        const newStudent = new Student({
            name: req.body.name.toUpperCase(),
            id: req.body.id.toUpperCase(),
            studentClass: req.body.studentClass,
            term: req.body.term,
            photoData: req.body.photoData,
            subjects: req.body.subjects,
            affective: req.body.affective,
            remarks: req.body.remarks
        });
        
        await newStudent.save();
        res.json({ message: "Upload successful!" });
    } catch (error) {
        console.error("Upload Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Error: A student with this ID already exists." });
        }
        res.status(500).json({ message: "Server error during upload." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
