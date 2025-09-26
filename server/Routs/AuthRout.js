const express = require('express');
const router = express.Router();
const AuthData = require('../models/Auth');
const db = require('../models/database');
const authController = new AuthData(db);


router.post("/register", async (req, res) => {
    try {
        const { name, email, password, created_at, passwordConfirm } = req.body;

        if (!password || !passwordConfirm || password !== passwordConfirm) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const UserID = await authController.Register(name, email, password,created_at);

        return res.status(201).json({ message: 'User created', id: UserID });
    } catch (error) {
        if (error && (error.code === 'EMAIL_EXISTS' || error.message === 'EmailExists')) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        if (error && error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already registered (duplicate)' });
        }

        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
