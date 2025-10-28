/* ===== Users.js ===== */

class UserData {
    constructor(db) {
        this.DB = db;
    }

    // Get single user (id, name, email, created_at) or null if not found
    async GetOneUser(id) {
        if (!id) throw new Error('Missing user id');
        const [rows] = await this.DB.execute(
            `SELECT id, name, email, created_at FROM users WHERE id = ?`,
            [id]
        );
        return rows && rows.length ? rows[0] : null;
    }

    // Read users joined with planttype (returns rows where a user has at least one planttype)
    async Read() {
        const sql = `
      SELECT
        u.id          AS user_id,
        u.name        AS user_name,
        pt.ID         AS plant_id,
        pt.name       AS plant_name,
        pt.user_id    AS plant_user_id
      FROM users AS u
      JOIN planttype AS pt ON u.id = pt.user_id
    `;
        const [rows] = await this.DB.execute(sql);
        return rows;
    }

    // List all users (safe select of key columns)
    async List() {
        const [rows] = await this.DB.execute(
            `SELECT id, name, email, created_at FROM users ORDER BY id ASC`
        );
        return rows;
    }

    // Update user (only name and email). Throws if user not found.
    async Update(id, data) {
        if (!id) throw new Error('Missing user id');
        const name = data && data.name ? String(data.name).trim() : null;
        const email = data && data.email ? String(data.email).trim().toLowerCase() : null;

        if (!name && !email) throw new Error('Nothing to update');

        const [rows] = await this.DB.execute(`SELECT id FROM users WHERE id = ? LIMIT 1`, [id]);
        if (!rows || rows.length === 0) throw new Error('User not found');

        const updates = [];
        const params = [];
        if (name) {
            updates.push('name = ?');
            params.push(name);
        }
        if (email) {
            updates.push('email = ?');
            params.push(email);
        }
        params.push(id);

        await this.DB.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
        return true;
    }

    // Delete user by id. Throws if user not found.
    async Delete(id) {
        if (!id) throw new Error('Missing user id');
        const [rows] = await this.DB.execute(`SELECT id FROM users WHERE id = ? LIMIT 1`, [id]);
        if (!rows || rows.length === 0) throw new Error('User not found');

        await this.DB.execute(`DELETE FROM users WHERE id = ?`, [id]);
        return true;
    }
}

module.exports = UserData;
