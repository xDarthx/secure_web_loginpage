const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const axios = require('axios');

const app = express();

// --- Middleware ---
app.use(cors());

app.use(express.json());

// --- Database Connection ---
const db = mysql.createConnection({
    host: "localhost",
    user: "root",      
    password: "",       
    database: "crud"
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// --- API Routes ---

/**
 * [POST] /register
 * Creates a new user
 */
app.post('/register', (req, res) => {
    const { fullName, email, password } = req.body;
    const checkUserSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkUserSql, [email], (err, data) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (data.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ error: "Password hashing error" });
            const insertUserSql = "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)";
            const values = [
                fullName,
                email,
                hash 
            ];

            db.query(insertUserSql, values, (err, result) => {
                if (err) return res.status(500).json({ error: "Database error on insert" });
                return res.status(201).json({ message: "User created successfully" });
            });
        });
    });
});


/**
 * [POST] /login
 * Logs in a user
 */
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    
    db.query(sql, [email], (err, data) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (data.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = data[0];

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).json({ error: "Password compare error" });

            if (isMatch) {
                return res.status(200).json({ 
                    message: "Login successful",
                    fullName: user.full_name,
                    email: user.email 
                });
            } else {
                return res.status(401).json({ error: "Invalid email or password" });
            }
        });
    });
});

/**
 * [GET] /mfa/qr/:email
 */

app.get('/mfa/qr/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const response = await axios.get(`https://wa-ocu-mfa-fre6d6guhve2afcw.centralus-01.azurewebsites.net/mfa/setup/qr/${email}`);

        res.status(200).send(response.data);
    } catch (err) {
        console.error('MFA QR Error:', error.message);
        res.status(500).json({ error: "Failed to fetch QR code from external server"});
    }
});


/**
 * [POST] /mfa/verify
 */

app.post('/mfa/verify', async (req, res) => {
    const {id, code} = req.body;
    try {
        const response = await axios.post('https://wa-ocu-mfa-fre6d6guhve2afcw.centralus-01.azurewebsites.net/mfa/verify/auth', {
            id,
            code
        });

        res.status(200).send(response.data);
    } catch (error) {
        console.error('MFA Verify Error:', error.message);
        res.status(500).json({ error: "Failed to verify code"});
    }
});

/**
 * [POST] /reset-password
 */

app.post('/reset-password', (req, res) => {
    const { email, newPassword } = req.body;

    const checkUserSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkUserSql, [email], (err, data) => {
        if(err) return res.status(500).json({ error: "Database error "});
        if(data.length === 0) return res.status(404).json({ error: "User not found"});

        bcrypt.hash(newPassword, 10, (err, hash) => {
            if(err) return res.status(500).json({ error: "Error hashing password"});

            const updateSql = "UPDATE users SET password_hash = ? WHERE email = ?";
            db.query(updateSql, [hash, email], (err, result) => {
                if (err) return res.status(500).json({ error: "Database error "});
                return res.status(200).json({ message: "Password updated successfully"});
            });
        });
    });
});

// --- Start the Server ---
const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});