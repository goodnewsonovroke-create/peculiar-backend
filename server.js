const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json()); // This allows the server to read uploaded data!

// This is your live working memory!
let liveDatabase = [
    { name: "GOODNEWS OVIE ONOVROKE", id: "PHS-3999" }
];

// 1. THE SEARCH PORTAL (For Students)
app.get('/api/check-result', (req, res) => {
    const studentName = req.query.name.trim().toLowerCase();
    const studentId = req.query.id.trim().toUpperCase();

    // Search the memory for a match
    const student = liveDatabase.find(s => 
        s.id.toUpperCase() === studentId && 
        s.name.toLowerCase() === studentName
    );

    if (student) {
        res.json([student]); 
    } else {
        res.status(404).json({ message: "Student not found in database." });
    }
});

// 2. THE UPLOAD PORTAL (For Staff)
app.post('/api/upload-result', (req, res) => {
    const newStudent = {
        name: req.body.name,
        id: req.body.id
    };
    
    // Add the new student to our memory!
    liveDatabase.push(newStudent); 
    
    res.json({ message: "Upload successful!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
