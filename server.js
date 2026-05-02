const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// This fixes the "Network Error" so InfinityFree can talk to Render
app.use(cors());
app.use(express.json());

// This is the exact route your frontend is looking for!
app.get('/api/check-result', (req, res) => {
    const studentName = req.query.name;
    const studentId = req.query.id;

    // Fake database for testing
    if (studentId === "PHS-3999") {
        res.json([{
            name: "GOODNEWS OVIE ONOVROKE",
            id: "PHS-3999",
            math: 85,
            english: 90,
            status: "Passed"
        }]);
    } else {
        res.status(404).json({ message: "Student not found" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
