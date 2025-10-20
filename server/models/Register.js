// Register.js

const bcrypt = require('bcryptjs');
const validator = require('validator');
const zxcvbn = require('zxcvbn');


class Register_Account {
    constructor(db, options = {}) {
        this.DB = db;
        this.saltRounds = options.saltRounds || (process.env.SALT_ROUNDS ? Number(process.env.SALT_ROUNDS) : 10);

    }

    static validateEmail(email) { return typeof email === 'string' && validator.isEmail(email.trim()); }

    async Register(name, email, password) {
        const displayName = (name || '').trim();
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!Register_Account.validateEmail(normalizedEmail)) {
            const err = new Error('Invalid email');
            err.code = 'NonValidEmail';
            throw err;
        }

        const [existing] = await this.DB.execute(`SELECT id FROM users WHERE email = ? LIMIT 1`, [normalizedEmail]);
        if (existing && existing.length > 0) {
            const err = new Error('Email already registered');
            err.code = 'EMAIL_EXISTS';
            throw err;
        }

        const strength = zxcvbn(password || '', [displayName, normalizedEmail]);
        const MIN_ACCEPTABLE_SCORE = 3;
        if (strength.score < MIN_ACCEPTABLE_SCORE) {
            const err = new Error('Password too weak');
            err.code = 'WEAK_PASSWORD';
            err.feedback = strength.feedback;
            err.score = strength.score;
            throw err;
        }

        const hashed = await bcrypt.hash(password, this.saltRounds);
        const createdAt = new Date().toISOString().split('T')[0];
        const [result] = await this.DB.execute(
            `INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)`,
            [displayName, normalizedEmail, hashed, createdAt]
        );

        return result.insertId;
    }
}

module.exports = Register_Account;
