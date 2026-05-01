const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '50mb' }));

// 🛡️ SECURITY: This tells Render to only accept traffic from your actual live domain
app.use(cors({
    origin: [
        'http://peculiarschool.name.ng', 
        'https://peculiarschool.name.ng', 
        'http://www.peculiarschool.name.ng',
        'http://localhost:3000' // Keeps localhost working when you test on your PC
    ],
    methods: ['GET', 'POST']
}));

app.use(express.static(__dirname)); 

// 🌐 LIVE DATABASE: Connected to Aiven.io Cloud
const db = mysql.createPool({
    host: 'mysql-1cd8eef8-peculiar-portal-01.aivencloud.com', 
    user: 'avnadmin', 
    password: process.env.DB_PASSWORD, // THIS IS THE MAGIC LINE
    database: 'defaultdb',
    port: 12174,
    ssl: { 
        rejectUnauthorized: false 
    } 
});

// 1. BULK UPLOAD ENDPOINT
app.post('/api/upload-bulk', async (req, res) => {
    try {
        const d = req.body;
        const values = d.results.map(r => [
            d.name, d.id, d.class, r.subject, r.ca, r.exam, 
            (parseInt(r.ca || 0) + parseInt(r.exam || 0)), 
            'P', d.passport, 'Paid', d.drawing, d.sports, d.communication, 
            d.leadership, d.self_control, d.neatness, d.punctuality, 
            d.attitude, d.t_comment, d.p_comment
        ]);

        const sql = `INSERT INTO results (
            student_name, student_id, student_class, subject, ca_score, exam_score, total, 
            grade, passport, fees_status, drawing, sports, communication, leadership, 
            self_control, neatness, punctuality, attitude, teacher_comment, principal_comment
        ) VALUES ?`;
        
        await db.query(sql, [values]);
        res.status(200).json({ success: true, message: "Upload Complete" });
    } catch (err) { 
        console.error("❌ Upload Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// 2. CHECK RESULT ENDPOINT
// This is what Render uses to answer the frontend's question
app.get('/api/check-result', (req, res) => {
    const studentName = req.query.name;
    const studentId = req.query.id;

    // Database search logic goes here...
});
        
        if (rows.length > 0) res.json(rows);
        else res.status(404).json({ error: "Student not found" });
    } catch (err) { 
        console.error("❌ Search Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// 3. ANALYTICS ENDPOINT
app.get('/api/analytics-data', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT student_name, student_id, student_class, subject, total, grade FROM results");
        res.json(rows);
    } catch (err) { 
        console.error("❌ Analytics Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// The port environment variable is required by Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 LIVE ENGINE ACTIVE ON PORT ${PORT}`);
});