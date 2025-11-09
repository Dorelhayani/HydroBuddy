/* ===== DeviceHandler.js ===== */

const bcrypt = require('bcryptjs');
const { info, warn } = require('../utils/logger');

class DeviceStore {
    constructor(db) {
        this.DB = db;
    }

    async read({ deviceId }) {
        if (!deviceId) return null;
        const [rows] = await this.DB.execute(
            `SELECT doc FROM esp_device_state WHERE device_id = ? ORDER BY updated_at DESC LIMIT 1`, [deviceId] );
        if (!rows.length) return null;

        let doc = rows[0].doc;

        try {
            if (typeof doc === 'string') return JSON.parse(doc);
            if (Buffer.isBuffer(doc))   return JSON.parse(doc.toString('utf8'));
            if (doc && typeof doc === 'object') return doc;
            return null;
        } catch {
            return null;
        }
    }

    async write({ deviceId }, obj) {
        if (!deviceId) throw new Error('Missing deviceId');
        const json = JSON.stringify(obj ?? {});
        await this.DB.execute(
            `INSERT INTO esp_device_state (device_id, doc) VALUES (?, CAST(? AS JSON)) ON DUPLICATE KEY UPDATE
       doc = VALUES(doc), updated_at = CURRENT_TIMESTAMP`, [deviceId, json] );
        return true;
    }
}

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
            const [res] = await this.DB.execute(
                `INSERT INTO devices (device_uid, device_key, name, user_id, created_at)
         VALUES (?, ?, ?, ?, NOW())`, [device_uid, hash, name || null, user_id] );
            return { id: res.insertId, device_uid, user_id };
        } catch (e) {
            if (e && e.code === 'ER_DUP_ENTRY') {
                const er = new Error('Device UID already exists');
                er.code = 409;
                throw er;
            }
            throw e;
        }
    }

    async getDeviceByUid(device_uid) {
        const [rows] = await this.DB.execute(
            `SELECT id, device_uid, device_key, name, user_id FROM devices WHERE device_uid = ? LIMIT 1`,
            [device_uid]
        );
        return rows?.[0] || null;
    }

    async getDeviceByUserId(user_id) {
        const [rows] = await this.DB.execute(
            `SELECT id, device_uid, device_key, name, user_id FROM devices WHERE user_id = ? ORDER BY id DESC
       LIMIT 1`, [user_id] );
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
        const [res] = await this.DB.execute(
            `UPDATE devices SET user_id = ? WHERE device_uid = ?`, [user_id, device_uid] );
        if (!res.affectedRows) {
            const e = new Error('Device not found');
            e.code = 404;
            throw e;
        }
        return { updated: true, user_id };
    }
}

function EspPerUser(db, EspData) {
    const Devices = new DeviceModel(db);
    const store = new DeviceStore(db);

    return async (req, res, next) => {
        try {
            let userId = req.user_id || req?.user?.id || null;
            let deviceId = null;

            if (req.get('X-Device-Id') && req.get('X-Device-Key')) {
                const ident = await Devices.deviceIdentityFromHeaders(req);
                if (ident) {
                    deviceId = ident.device_id || null;
                    if (!userId && ident.user_id) userId = String(ident.user_id);
                }
            }

            if (!deviceId && userId) {
                const dev = await Devices.getDeviceByUserId(userId);
                if (dev) deviceId = dev.id;
            }

            if (!userId) { warn('ESP','no userId'); return res.status(401).json({ error:'Unauthorized' }); }
            if (!deviceId) {
                warn('ESP','no deviceId for user',{ userId });
                return res.status(400).json({ error:'Missing deviceId' });
            }

            req.user_id   = String(userId);
            req.device_id = deviceId;

            info('ESP','attached esp context',{ userId, deviceId }, req.reqId);

            req.esp = new EspData(db, { userId: req.user_id, deviceId: req.device_id }, store);
            next();
        } catch (e) { next(e); }
    };

}

module.exports = { DeviceModel, DeviceStore, EspPerUser };
