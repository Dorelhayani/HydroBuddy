/* ===== AuthRout.js ===== */

const express = require('express');
const router = express.Router();
const AuthModel = require('../models/Auth');
const db = require('../models/database');

const path = require('path');
const fs = require('fs');
const multer = require('multer');

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'ImLogged';

const authController = new AuthModel(db, {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpireSec: process.env.JWT_EXPIRE_SEC ? Number(process.env.JWT_EXPIRE_SEC) : undefined,
    saltRounds: process.env.SALT_ROUNDS ? Number(process.env.SALT_ROUNDS) : undefined,
    singleSession: process.env.SINGLE_SESSION === 'true' || false,
    cookieName: process.env.AUTH_COOKIE_NAME || COOKIE_NAME,
});

const AVATAR_DIR = path.join(process.cwd(), 'uploads', 'avatars');
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, AVATAR_DIR),
    filename: (req, file, cb) => {
        const ext =
            file.mimetype === 'image/png' ? '.png' :
                file.mimetype === 'image/webp' ? '.webp' :
                    '.jpg';
        cb(null, `${req.user_id}${ext}`);
    }
});


const fileFilter = (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'avatar'), ok);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Redirect root to frontend
router.get('/', (req, res) => res.redirect(process.env.FRONTEND_ORIGIN || 'http://localhost:3000/'));

router.get('/me', authController.isLogged.bind(authController), (req, res) => {
    const origin = process.env.API_PUBLIC_ORIGIN || `${req.secure ? 'https' : 'http'}://${req.get('host')}`;

    const user = { ...req.user };
    if (user?.avatar_url && !String(user.avatar_url).startsWith('http')) {
        user.avatar_url = `${origin}${user.avatar_url}`;
    }
    return res.status(200).json(user);
}
);

router.post(
    '/avatar', authController.isLogged.bind(authController), upload.single('avatar'),
    async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

            const avatarUrl = `/uploads/avatars/${req.file.filename}`; // מה שהפרונט ישים ב-src
            await authController.saveAvatarUrl(req.user_id, avatarUrl);

            const origin = process.env.API_PUBLIC_ORIGIN || `${req.secure ? 'https' : 'http'}://${req.get('host')}`;
            const absolute = `${origin}${avatarUrl}`;

            res.status(200).json({ message: 'Avatar updated', avatarUrl: absolute });

        } catch (error) {
            console.error('Avatar upload error:', error);
            return res.status(500).json({ error: 'Upload failed' });
        }
    }
);

// Login
router.post('/login', async (req, res) => {
    try {
        const identifier = req.body.identifier ?? req.body.name ?? req.body.email;
        const password = req.body.password;
        console.log(identifier);
        console.log(password);
        if (!identifier || !password) return res.status(400).json({ error: 'Missing credentials' });


        const { id, name, token } = await authController.authenticate(identifier, password);

        const cookieOptions = AuthModel.cookieOptions(req.secure);
        res.cookie(authController.cookieName, token, cookieOptions);

        return res.status(200).json({ message: 'Logged in', id, name });
    } catch (error) {
        if (error && error.code === 'INVALID_CREDENTIALS') return res.status(401).json({ error: 'Invalid name/email or password' });
        if (error && error.code === 'MISSING_CREDENTIALS') return res.status(400).json({ error: 'Missing credentials' });
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// password change
router.patch(
    '/change_password/:id',
    authController.isLogged.bind(authController),
    async (req, res) => {
        try {
            const paramId = String(req.params.id || '').trim();
            const authId  = String(req.user_id || '').trim();
            if (!authId) return res.status(401).json({ error: 'Not authenticated' });
            if (!paramId) return res.status(400).json({ error: 'Missing user id param' });
            if (paramId !== authId) return res.status(403).json({ error: 'Forbidden: can only update your own password' });

            const { currentPassword, newPassword, newPasswordConfirm } = req.body || {};
            if (!currentPassword || !newPassword || !newPasswordConfirm)
                return res.status(400).json({ error: 'Missing fields' });
            if (newPassword !== newPasswordConfirm)
                return res.status(400).json({ error: 'Passwords do not match' });

            await authController.changePassword(paramId, currentPassword, newPassword);

            // אם מפעילים singleSession – נאלץ התחברות מחדש
            if (authController.singleSession) {
                res.clearCookie(authController.cookieName, AuthModel.cookieOptions(req.secure));
                return res.status(200).json({ message: 'Password updated. Please log in again.' });
            }

            return res.status(200).json({ message: 'Password updated' });
        } catch (error) {
            if (error && (error.code === 'INVALID_CREDENTIALS' || error.code === 'PASSWORD_SAME'))
                return res.status(400).json({ error: error.message });
            if (error && error.code === 'WEAK_PASSWORD')
                return res.status(400).json({ error: 'Password too weak', score: error.score, feedback: error.feedback });
            if (error && error.code === 'MISSING_FIELDS' || error?.code === 'NOT_FOUND')
                return res.status(400).json({ error: error.message });

            console.error('Change password error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Logout
router.post('/logout', async (req, res) => {
    try {
        await authController.logout(req, res);
    } catch (err) {
        console.error('Logout route error:', err);
        res.status(500).json({ error: 'Logout failed' });
    }
});

module.exports = router;
