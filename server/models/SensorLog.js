/* ===== SensorLog.js ===== */

const { info, warn } = require('../utils/logger');

const MODE_BY_STATE = {
    60: 'IDLE',
    61: 'TEMP',
    62: 'MOISTURE',
    63: 'SATURDAY',
    64: 'MANUAL',
};

class SensorLog {
    constructor(db) {
        this.DB = db;
        this.currentCycles = new Map();
    }

    ModeFromState(doc) {
        const code = Number(doc?.state);
        if (!Number.isFinite(code)) return 'UNKNOWN';
        return MODE_BY_STATE[code] || 'UNKNOWN';
    }

    beginPumpCycle({ deviceId, userId, pumpMode }) {
        if (!deviceId || !userId) return null;

        const startedAt = new Date();
        const cycleId = Math.floor(startedAt.getTime() / 1000);
        this.currentCycles.set(deviceId, { userId, pumpMode, startedAt, cycleId });

        info('SENSOR_LOG', 'beginPumpCycle', { deviceId, userId, pumpMode, cycleId, startedAt });
        return cycleId;
    }

    async endPumpCycle({ deviceId, temp, light, moisture }) {
        const ctx = this.currentCycles.get(deviceId);
        if (!ctx) {
            warn('SENSOR_LOG', 'endPumpCycle called with no active cycle', { deviceId });
            return null;
        }

        const endedAt = new Date();
        const durationMs = endedAt - ctx.startedAt;
        const durationSec = durationMs > 0 ? Math.round(durationMs / 1000) : 0;

        this.currentCycles.delete(deviceId);

        info('SENSOR_LOG', 'endPumpCycle', { deviceId, userId: ctx.userId, pumpMode: ctx.pumpMode, cycleId: ctx.cycleId,
            durationSec, temp, light, moisture });

        return this.storeESPData({userId: ctx.userId, deviceId, temp, light, moisture, pumpOn: 0,
            pumpMode: ctx.pumpMode, pumpCycleId: ctx.cycleId, pumpDurationSec: durationSec, note: 'pump cycle end' });
    }

    async storeESPData({ userId, deviceId, temp, light, moisture, pumpOn, pumpMode, pumpCycleId, pumpDurationSec, note})
    {
        if (!userId) throw new Error('Missing user id');

        info('SENSOR_LOG', 'storeESPData called', {userId, deviceId, temp, light, moisture, pumpOn, pumpMode,
            pumpCycleId, pumpDurationSec, note,});

        const [rows] = await this.DB.execute(
            `SELECT p.ID as plantId
             FROM plant p
                      JOIN planttype pt ON pt.ID = p.PlantTypeID
             WHERE pt.user_id = ?
             ORDER BY p.ID DESC
             LIMIT 1`,
            [userId]
        );

        if (!rows || rows.length === 0) { throw new Error('No plant found for user'); }

        const plantId = rows[0].plantId;
        const pumpOnVal = pumpOn === undefined ? null : pumpOn;
        const pumpModeVal = pumpMode === undefined ? null : pumpMode;
        const pumpCycleIdVal = pumpCycleId === undefined ? null : pumpCycleId;
        const pumpDurationSecVal = pumpDurationSec === undefined ? null : pumpDurationSec;
        const noteVal = note === undefined ? null : note;

        await this.DB.execute(
            `INSERT INTO datasensors ( PlantID, temp, light, moisture, Date, pump_on, pump_mode, pump_cycle_id,
                pump_duration_sec, pump_note ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
            [plantId, temp, light, moisture, pumpOnVal, pumpModeVal, pumpCycleIdVal, pumpDurationSecVal, noteVal] );
        return { message: 'Sensor data stored', plantId };
    }
}

module.exports = SensorLog;
