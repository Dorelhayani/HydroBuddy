// RegisterRout.js

const express = require('express');
const router = express.Router();
const RegisterModel = require('../models/Register');
const db = require('../models/database');
const User = new RegisterModel(db);

router.post('/reg', async (req, res) => {
    try {
        const { name, email, password, passwordConfirm } = req.body;
        if (!password || !passwordConfirm || password !== passwordConfirm) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const id = await User.Register(name, email, password);
        return res.status(201).json({ message: 'User created', id });
    } catch (error) {
        if (error && error.code === 'EMAIL_EXISTS')
            return res.status(409).json({ error: 'Email already registered' });
        if (error && error.code === 'WEAK_PASSWORD')
            return res.status(400).json({ error: 'Password too weak', score: error.score, feedback: error.feedback });
        if (error && error.code === 'NonValidEmail')
            return res.status(400).json({ error: 'Please enter a valid email' });
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
