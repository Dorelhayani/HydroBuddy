// Auth.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const zxcvbn = require('zxcvbn');

class Auth {
    constructor(db, options = {}) {
        this.DB = db;
        this.jwtSecret = options.jwtSecret || process.env.JWT_SECRET || 'myPrivateKey';
        this.jwtExpireSec = options.jwtExpireSec || (process.env.JWT_EXPIRE_SEC ? Number(process.env.JWT_EXPIRE_SEC) : 31 * 24 * 60 * 60);
        this.saltRounds = options.saltRounds || (process.env.SALT_ROUNDS ? Number(process.env.SALT_ROUNDS) : 10);
        this.singleSession = Boolean(options.singleSession || process.env.SINGLE_SESSION === 'true');
        this.cookieName = options.cookieName || process.env.AUTH_COOKIE_NAME || 'ImLogged';
    }

    static validateEmail(email) {
        return typeof email === 'string' && validator.isEmail(email.trim());
    }

    // Change password
    async changePassword(userId, currentPassword, newPassword) {
        const id = String(userId || '').trim();
        if (!id || !currentPassword || !newPassword) {
            const err = new Error('Missing fields');
            err.code = 'MISSING_FIELDS';
            throw err;
        }

        // הבא את המשתמש (כולל hash קיים)
        const [rows] = await this.DB.execute(
            `SELECT id, name, email, password FROM users WHERE id = ? LIMIT 1`,
            [id]
        );
        if (!rows || rows.length === 0) {
            const err = new Error('User not found');
            err.code = 'NOT_FOUND';
            throw err;
        }

        const user = rows[0];

        // ודא שהסיסמה הנוכחית נכונה
        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) {
            const err = new Error('Current password is incorrect');
            err.code = 'INVALID_CREDENTIALS';
            throw err;
        }

        // אל תאפשר אותה סיסמה
        if (currentPassword === newPassword) {
            const err = new Error('New password must be different');
            err.code = 'PASSWORD_SAME';
            throw err;
        }

        // בדיקת חוזק
        const strength = zxcvbn(newPassword || '', [user.name, user.email]);
        const MIN_ACCEPTABLE_SCORE = 3;
        if (strength.score < MIN_ACCEPTABLE_SCORE) {
            const err = new Error('Password too weak');
            err.code = 'WEAK_PASSWORD';
            err.feedback = strength.feedback;
            err.score = strength.score;
            throw err;
        }

        // hash + עדכון
        const hashed = await bcrypt.hash(newPassword, this.saltRounds);
        await this.DB.execute(`UPDATE users SET password = ? WHERE id = ?`, [hashed, id]);

        // אופציונלי: ביטול כל הסשנים (מומלץ כשsingleSession פעיל)
        if (this.singleSession) {
            await this.DB.execute(`UPDATE users SET current_token = NULL WHERE id = ?`, [id]);
        }

        return { id };
    }

    // authenticate by email or name -> returns { id, name, email, token }
    async authenticate(identifier, password) {
        if (!identifier || !password) {
            const err = new Error('Missing credentials');
            err.code = 'MISSING_CREDENTIALS';
            throw err;
        }

        const maybeEmail = String(identifier).trim();
        const isEmail = Auth.validateEmail(maybeEmail);
        const sql = isEmail
            ? `SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1`
            : `SELECT id, name, email, password FROM users WHERE name = ? LIMIT 1`;
        const params = isEmail ? [maybeEmail.toLowerCase()] : [identifier];

        const [rows] = await this.DB.execute(sql, params);
        if (!rows || rows.length === 0) {
            const err = new Error('Invalid credentials');
            err.code = 'INVALID_CREDENTIALS';
            throw err;
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            const err = new Error('Invalid credentials');
            err.code = 'INVALID_CREDENTIALS';
            throw err;
        }

        const payload = { data: `${user.id},${user.name}` };
        const token = jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpireSec });

        if (this.singleSession) {
            try {
                await this.DB.execute(`UPDATE users SET current_token = ? WHERE id = ?`, [token, user.id]);
            } catch (e) {
                console.error('Failed updating current_token:', e);
            }
        }

        return { id: user.id, name: user.name, email: user.email, token };
    }

    // middleware
    async isLogged(req, res, next) {
        try {
            const cookies = req.cookies || {};
            const token = cookies[this.cookieName];
            if (!token) return res.status(401).json({ error: 'Not authenticated' });

            let decoded;
            try {
                decoded = jwt.verify(token, this.jwtSecret);
            } catch (e) {
                return res.status(401).json({ error: 'Invalid token' });
            }

            const data = decoded && decoded.data ? decoded.data : '';
            const parts = String(data).split(',');
            req.user_id = parts[0];
            req.name = parts[1];
            try {
                const [rows] = await this.DB.execute(
                    `SELECT id, name, email, created_at, avatar_url  FROM users WHERE id = ?`,
                    [req.user_id]
                );
                    if (!rows || rows.length === 0) return rows && rows.length ? rows[0] : 401;

                const userRow = { ...rows[0] };
                delete userRow.password;
                delete userRow.current_token;
                req.user = userRow;
            } catch (e) { return res.status(500).json({ error: 'Error fetching user row' }); }

            if (this.singleSession) {
                try {
                    const [rows2] = await this.DB.execute(`SELECT current_token FROM users WHERE id = ?`, [req.user_id]);
                    if (!rows2 || rows2.length === 0) return res.status(401).json({ error: 'Invalid session' });
                    const dbToken = rows2[0].current_token;
                    if (!dbToken || dbToken !== token) return res.status(401).json({ error: 'Session invalidated' });
                } catch (e) { return res.status(500).json({ error: 'Error verifying single-session token' }); }
            }

            return next();
        } catch (error) { return res.status(500).json({ error: 'Auth middleware error' }); }
    }


    // logout: clear cookie and current_token if enabled
    async logout(req, res) {
        try {
            const token = (req.cookies && req.cookies[this.cookieName]) || null;
            res.clearCookie(this.cookieName, Auth.cookieOptions());

            if (this.singleSession && token) {
                try {
                    const decoded = jwt.verify(token, this.jwtSecret);
                    const data = decoded && decoded.data ? decoded.data : '';
                    const id = String(data).split(',')[0];
                    if (id) await this.DB.execute(`UPDATE users SET current_token = NULL WHERE id = ?`, [id]);
                } catch (e) {}
            }

            return res.json({ message: 'Logged out' });
        } catch (error) { return res.status(500).json({ error: 'Logout failed' }); }
    }


    // save avatar
    async saveAvatarUrl(userId, avatarUrl) {
        const id = String(userId || '').trim();
        if (!id || !avatarUrl) {
            const err = new Error('Missing avatar params');
            err.code = 'MISSING_AVATAR_PARAMS';
            throw err;
        }

        const [rows] = await this.DB.execute('SELECT avatar_url FROM users WHERE id = ? LIMIT 1', [id]);
        const oldUrl = rows?.[0]?.avatar_url;

        await this.DB.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, id]);

        try {
            if (oldUrl && oldUrl.startsWith('/uploads/avatars/') && oldUrl !== avatarUrl) {
                const abs = path.join(process.cwd(), oldUrl.replace(/^\//, ''));
                fs.unlink(abs, () => {
                });
            }
        } catch {}

        return { id, avatarUrl };
    }


    // cookieOptions: set cookie time
    static cookieOptions(reqIsSecure = false) {
        const isProd = process.env.NODE_ENV === 'production';
        return {
            httpOnly: true,
            path: '/',
            maxAge: (Number(process.env.JWT_EXPIRE_SEC) || 31 * 24 * 60 * 60) * 1000,
            sameSite: 'lax',
            secure: isProd || reqIsSecure,
        };
    }
}

module.exports = Auth;
