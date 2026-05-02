const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// 1. CONNECT TO MONGODB ATLAS
const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to Permanent MongoDB Database!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 2. DEFINE WHAT A "STUDENT" LOOKS LIKE IN THE DATABASE
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    id: { type: String, required: true, unique: true }, // 'unique' means no two students can have the same ID!
    // We will add grades here later when you expand the form!
});

// Create the model (like a filing cabinet for students)
const Student = mongoose.model('Student', studentSchema);


// 3. THE SEARCH PORTAL (For Students)
app.get('/api/check-result', async (req, res) => {
    try {
        const studentName = req.query.name.trim();
        const studentId = req.query.id.trim().toUpperCase();

        // Search the actual MongoDB database! (Case-insensitive search for name)
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
        console.error(error);
        res.status(500).json({ message: "Server error searching database." });
    }
});

// 4. THE UPLOAD PORTAL (For Staff)
app.post('/api/upload-result', async (req, res) => {
    try {
        // Create a new student record
        const newStudent = new Student({
            name: req.body.name.toUpperCase(),
            id: req.body.id.toUpperCase()
        });
        
        // Save it permanently to MongoDB!
        await newStudent.save();
        
        res.json({ message: "Upload successful!" });
    } catch (error) {
        console.error(error);
        // If the ID already exists, send a specific error
        if (error.code === 11000) {
            return res.status(400).json({ message: "Error: A student with this ID already exists." });
        }
        res.status(500).json({ message: "Server error during upload." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
