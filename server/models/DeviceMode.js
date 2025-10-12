const bcrypt = require('bcryptjs');

class DeviceModel {
    constructor(db, options = {}) {
        this.DB = db;
        this.useBindings = options.useBindings !== false;
    }

    async createDevice({ device_uid, device_key_plain, device_key, name, user_id = null }) {
        if (!device_uid || !(device_key_plain || device_key)) {
            const err = new Error('Missing device_uid or device_key');
            err.code = 400; throw err;
        }
        const plain = device_key_plain || device_key;
        const hash = await bcrypt.hash(String(plain), 10);

        try {
            if (this.useBindings) {
                const [res] = await this.DB.execute(
                    `INSERT INTO devices (device_uid, device_key, name, created_at)
                     VALUES (?, ?, ?, NOW())`,
                    [device_uid, hash, name || null]
                );
                return { id: res.insertId, device_uid };
            } else {
                if (!user_id) { const e = new Error('user_id is required when useBindings=false'); e.code = 400; throw e; }
                const [res] = await this.DB.execute(
                    `INSERT INTO devices (device_uid, device_key, name, user_id, created_at)
                     VALUES (?, ?, ?, ?, NOW())`,
                    [device_uid, hash, name || null, user_id]
                );
                return { id: res.insertId, device_uid, user_id };
            }
        } catch (e) {
            if (e && e.code === 'ER_DUP_ENTRY') { const er = new Error('Device UID already exists'); er.code = 409; throw er; }
            throw e;
        }
    }

    async getDeviceByUid(device_uid) {
        const [rows] = await this.DB.execute(
            this.useBindings
                ? `SELECT id, device_uid, device_key, name FROM devices WHERE device_uid = ? LIMIT 1`
                : `SELECT id, device_uid, device_key, name, user_id FROM devices WHERE device_uid = ? LIMIT 1`,
            [device_uid]
        );
        return rows?.[0] || null;
    }

    // *** חדש: שליפה לפי user_id (למודל 1:1) ***
    async getDeviceByUserId(user_id) {
        const [rows] = await this.DB.execute(
            `SELECT id, device_uid, device_key, name, user_id
         FROM devices
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1`,
            [user_id]
        );
        return rows?.[0] || null;
    }

    async deviceIdentityFromHeaders(req) {
        const deviceUid = req.get('X-Device-Id');
        const deviceKey = req.get('X-Device-Key');
        if (!deviceUid || !deviceKey) return null;

        const row = await this.getDeviceByUid(deviceUid);
        if (!row) return null;

        const ok = await bcrypt.compare(String(deviceKey), row.device_key);
        if (!ok) return null;

        return { user_id: row.user_id || null, device_id: row.id };
    }

    async assignDeviceToUser(device_uid, user_id) {
        if (!this.useBindings) {
            const [res] = await this.DB.execute(
                `UPDATE devices SET user_id = ? WHERE device_uid = ?`,
                [user_id, device_uid]
            );
            if (!res.affectedRows) { const e = new Error('Device not found'); e.code = 404; throw e; }
            return { updated: true, user_id };
        }
    }
}

module.exports = DeviceModel;
