
class Auth {
    constructor(db) { this.DB = db; }

    async Register(name, email, password) {
        try {
            const date = new Date();
            const createdAt = date.toISOString().split('T')[0];

            const [rows] = await this.DB.execute(`SELECT email FROM users WHERE email = ? LIMIT 1`, [email]);
            if (rows.length > 0) {
                const err = new Error('EmailExists');
                err.code = 'User already exists with this email';
                throw err;
            }

            const validator = require('validator');
            if (!validator.isEmail(String(email).trim())) { throw new Error('Please enter a valid email'); }

            const z = zxcvbn(password || '', [name, email]);
            const MIN_ACCEPTABLE_SCORE = 3;
            if (z.score < MIN_ACCEPTABLE_SCORE) {
                const err = new Error('Weak password');
                err.code = 'WEAK_PASSWORD';
                err.feedback = z.feedback;
                err.score = z.score;
                throw err;
            }

            const SALT_ROUNDS = 10;
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            const Query = `INSERT INTO users(name, email, password, created_at) VALUES (?, ?, ?, ?)`;
            const params = [name, email, hashedPassword, createdAt];
            const [result] = await this.DB.execute(Query, params);
            return result.insertId;

        } catch (error) {
            throw error;
        }
    }
}

module.exports = Auth;
