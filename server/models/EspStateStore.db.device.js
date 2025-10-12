// EspStateStore.db.device.js

class EspStateStoreDeviceDB {
    constructor(db) { this.DB = db; }

    async read({ deviceId }) {
        if (!deviceId) return null;
        const [rows] = await this.DB.execute(
            `SELECT doc FROM esp_device_state WHERE device_id = ? LIMIT 1`,
            [deviceId]
        );
        if (!rows.length) return null;
        try { return JSON.parse(rows[0].doc); } catch { return null; }
    }

    async write({ deviceId }, obj) {
        if (!deviceId) throw new Error('Missing deviceId');
        const json = JSON.stringify(obj);
        await this.DB.execute(
            `INSERT INTO esp_device_state (device_id, doc)
             VALUES (?, CAST(? AS JSON))
             ON DUPLICATE KEY UPDATE
                                  doc = VALUES(doc),
                                  updated_at = CURRENT_TIMESTAMP`,
            [deviceId, json]
        );
        return true;
    }
}

module.exports = EspStateStoreDeviceDB;
