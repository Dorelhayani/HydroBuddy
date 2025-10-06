const express = require('express');
const router = express.Router();
const UserData = require('../models/UserMode');
const db = require('../models/database');
const User = new UserData(db);

function handleError(res, err) {
    const msg = err && err.message ? err.message : 'Internal server error';
    if (err && err.code && typeof err.code === 'number') return res.status(err.code).json({ error: msg });
    if (/not found/i.test(msg)) return res.status(404).json({ error: msg });
    if (/missing/i.test(msg) || /invalid/i.test(msg)) return res.status(400).json({ error: msg });
    return res.status(500).json({ error: msg });
}

// Get current authenticated user's info
router.get('/user_info', async (req, res) => {
    try {
        const userId = req.user_id;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });

        const user = await User.GetOneUser(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json(user);
    } catch (err) {
        return handleError(res, err);
    }
});

// users_list -> return array directly
router.get('/users_list', async (req, res) => {
    try {
        const rows = await User.List();
        return res.status(200).json(rows); // <-- RETURNS ARRAY DIRECTLY
    } catch (err) {
        return handleError(res, err);
    }
});


// Read: users joined with planttype (users that have plant types)
router.get('/list', async (req, res) => {
    try {
        const rows = await User.Read();
        return res.status(200).json({ rows });
    } catch (err) {
        return handleError(res, err);
    }
});

// List all users (lightweight)
router.get('/users_list', async (req, res) => {
    try {
        const rows = await User.List();
        return res.status(200).json({ users: rows });
    } catch (err) {
        return handleError(res, err);
    }
});

router.patch('/update/:id', async (req, res) => {
    try {
        const paramId = String(req.params.id || '').trim();
        const authId = String(req.user_id || '').trim();
        if (!authId) return res.status(401).json({ error: 'Not authenticated' });
        if (!paramId) return res.status(400).json({ error: 'Missing user id param' });
        if (paramId !== authId) return res.status(403).json({ error: 'Forbidden: can only update your own profile' });

        const { name, email } = req.body;
        await User.Update(paramId, { name, email });
        return res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        return handleError(res, err);
    }
});


router.delete('/delete/:id', async (req, res) => {
    try {
        const paramId = String(req.params.id || '').trim();
        const authId = String(req.user_id || '').trim();
        if (!authId) return res.status(401).json({ error: 'Not authenticated' });
        if (!paramId) return res.status(400).json({ error: 'Missing user id param' });
        if (paramId !== authId) return res.status(403).json({ error: 'Forbidden: can only delete your own account' });

        await User.Delete(paramId);
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        return handleError(res, err);
    }
});

module.exports = router;
