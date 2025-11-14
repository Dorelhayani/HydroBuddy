/* ===== Esp.js ===== */

const { info, warn, error: logError } = require('../utils/logger');
const {toInt01} = require("../utils/BoolParserToInt");

class EspData {
    constructor(db, ids, store) {
        this.DB = db;
        this.ids = ids;       // { userId, deviceId }
        this.store = store;   // DeviceStore (DB-based)
    }

    // --- קריאה ---
    async _readJson() {
        const data = await this.store.read(this.ids);
        if (data) return data;
        warn('ESP', '_readJson(): no doc, creating default', { ids: this.ids });
        const init = {
            state: 61,
            TEMP_MODE: { temp: 0, light: 0, tempTarget: 0, hysteresis: 0, runMin: 0, cooldown: 0, daylightOnly: false, lightGate: 0 },
            SOIL_MOISTURE_MODE: { moisture: 0, light: 0, moistureTarget: 0, hysteresis: 0, runMin: 0, cooldown: 0, daylightOnly: false, lightGate: 0 },
            SATURDAY_MODE: { dateAct: "", timeAct: "", duration: 0 },
            MANUAL_MODE: { enabled: false },
            pump: { on: false, updatedAt: null },
        };
        await this.store.write(this.ids, init);
        return init;
    }

    async _writeJson(obj) {
        const existing = await this.store.read(this.ids);
        const merged = existing ? this._deepMerge(existing, obj) : obj;

        info('DB', 'upsert device state', {
            deviceId: this.ids.deviceId,
            hasExisting: !!existing,
            keys: Object.keys(merged),
            size: JSON.stringify(merged).length
        });

        await this.store.write(this.ids, merged);

        try { await this._persistStateToDb(merged); }
        catch (e) { logError('ESP', '_writeJson: persist to DB failed', { err: e.message }); }
        return merged;
    }

    // --- פונקציית עזר למיזוג עמוק ---
    _deepMerge(target, source) {
        if (typeof target !== 'object' || target === null) return source;
        const output = { ...target };
        for (const key of Object.keys(source)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                output[key] = this._deepMerge(target[key] || {}, source[key]);
            } else {
                output[key] = source[key];
            }
        }
        return output;
    }

    // --- עוזרים ---
    _ensureFiniteNumber(value, name) {
        const n = Number(value);
        if (!Number.isFinite(n)) {
            warn('VALIDATION', `Invalid numeric value for ${name}`, { value });
            const err = new Error(`Invalid numeric value for ${name}`);
            err.code = 400;
            throw err;
        }
        return n;
    }

    async _persistStateToDb(merged) {
        const idValue = Number(this.ids?.deviceId);
        if (!Number.isFinite(idValue)) {
            warn('ESP', '_persistStateToDb: missing deviceId', { ids: this.ids });
            return;
        }

        const docStr = JSON.stringify(merged || {});
        const pumpOn = !!(merged?.pump?.on);

        info('ESP', '_persistStateToDb: about to write', { deviceId: idValue, pumpOn, docLen: docStr.length });

        try {
            const [upd] = await this.DB.execute(
                `UPDATE esp_device_state SET doc = ?, pump_status = ?, pump_status_updatedAt = NOW()
                WHERE device_id = ?`, [docStr, pumpOn ? 1 : 0, idValue] );
            info('ESP', '_persistStateToDb: update result', { deviceId: idValue, affectedRows: upd.affectedRows });

            if (!upd.affectedRows) {
                const [ins] = await this.DB.execute(
                    `INSERT INTO esp_device_state (device_id, doc, pump_status, pump_status_updatedAt, updated_at)
                    VALUES (?, ?, ?, NOW(), NOW())`, [idValue, docStr, pumpOn ? 1 : 0] );
                info('ESP', '_persistStateToDb: insert result', {
                    deviceId: idValue, insertId: ins.insertId, affectedRows: ins.affectedRows
                });
            }

            const [chk] = await this.DB.execute(
                `SELECT pump_status, pump_status_updatedAt, updated_at
                 FROM esp_device_state WHERE device_id=? LIMIT 1`, [idValue]
            );
            info('ESP','_persistStateToDb: read-back', {
                deviceId: idValue,
                pump_status: chk?.[0]?.pump_status,
                pump_status_updatedAt: chk?.[0]?.pump_status_updatedAt,
                updated_at: chk?.[0]?.updated_at
            });

        } catch (e) { logError('ESP', '_persistStateToDb: SQL failed', { err: e.message, deviceId: idValue }); }
    }

    // --- שליטה כללית ---
    async getState() {
        const data = await this._readJson();
        if (!data.pump) data.pump = { on: false, updatedAt: null }

        const idValue = Number(this.ids?.deviceId);
        if (Number.isFinite(idValue)) {
            try {
                const [rows] = await this.DB.execute(`SELECT pump_status, pump_status_updatedAt FROM esp_device_state
                WHERE device_id = ? LIMIT 1`, [idValue]);
                if (rows?.length) {
                    data.pump = {
                        on: rows[0].pump_status === 1,
                        updatedAt: rows[0].pump_status_updatedAt || data.pump.updatedAt || null,
                    };
                }
            } catch (err) { logError('ESP', 'getState: DB merge failed', { err: err.message, deviceId: idValue }); }
        }
        return data;
    }

    async EspState(payload) {
        const data = await this._readJson();
        if (payload && typeof payload.state !== 'undefined') {
            data.state = payload.state;
            await this._writeJson(data);
            info('ESP', 'state updated', { CurrentStatus: data.state, deviceId: this.ids.deviceId });
            return { message: 'State updated', CurrentStatus: data.state };
        }
        return { CurrentStatus: data.state };
    }

    async DataMode(payload) {
        const data = await this._readJson();
        if (payload && payload.state) {
            const key = payload.state;
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                return { [key]: data[key] };
            }
            warn('ESP', 'state key not found', { key });
            const err = new Error(`State '${key}' not found`);
            err.code = 404;
            throw err;
        }
        return { CurrentStatus: data.state };
    }

    // --- מצבי הפעלה ---
    async TemperatureMode(payload) {
        const data = await this._readJson();
        const prev = data.TEMP_MODE || {};

        const tempTarget = payload?.tempTarget ?? prev.tempTarget   ?? 26.0;
        const hysteresis = payload?.hysteresis ?? prev.hysteresis   ?? 1.0;
        const runMin = payload?.runMin ?? prev.runMin       ?? 3;
        const cooldown = payload?.cooldown ?? prev.cooldown     ?? 15;
        const daylightOnly = payload?.daylightOnly ?? prev.daylightOnly ?? false;
        const lightGate = payload?.lightGate ?? prev.lightGate    ?? 30;

        if (!Number.isFinite(Number(tempTarget))) { const e = new Error('Invalid tempTarget'); e.code=400; throw e; }
        if (!Number.isFinite(Number(hysteresis))) { const e = new Error('Invalid hysteresis'); e.code=400; throw e; }

        const runMinInt = Number.parseInt(runMin, 10);
        const cooldownInt = Number.parseInt(cooldown, 10);
        const lightGateInt = Number.parseInt(lightGate, 10);

        if (!Number.isInteger(runMinInt) || runMinInt < 0)
        { const e=new Error('Invalid runMin');   e.code=400; throw e; }

        if (!Number.isInteger(cooldownInt) || cooldownInt < 0)
        { const e=new Error('Invalid cooldown'); e.code=400; throw e; }

        if (!Number.isInteger(lightGateInt)|| lightGateInt<0 || lightGateInt>100)
        { const e=new Error('Invalid lightGate'); e.code=400; throw e; }

        const daylightBool =
            (daylightOnly === true || daylightOnly === 'true' || daylightOnly === 1 || daylightOnly === '1') ? true
                : (daylightOnly === false || daylightOnly === 'false' || daylightOnly === 0 || daylightOnly === '0')
                    ? false : (()=>{ const e=new Error('Invalid daylightOnly'); e.code=400; throw e; })();

        data.TEMP_MODE = {
            temp:  Number(prev.temp ?? 0),
            light: Number(prev.light ?? 0),
            tempTarget: Number(tempTarget),
            hysteresis: Number(hysteresis),
            runMin: runMinInt,
            cooldown: cooldownInt,
            daylightOnly: daylightBool,
            lightGate: lightGateInt
        };
        await this._writeJson({ TEMP_MODE: data.TEMP_MODE });
        info('ESP', 'TEMP_MODE config updated', { deviceId: this.ids.deviceId });
        return { TEMP_MODE: data.TEMP_MODE };
    }

    async MoistureMode(payload) {
        const data = await this._readJson();
        const prev = data.SOIL_MOISTURE_MODE || {};

        const moistureTarget = payload?.moistureTarget ?? prev.moistureTarget ?? 26.0;
        const hysteresis = payload?.hysteresis ?? prev.hysteresis ?? 1.0;
        const runMin = payload?.runMin ?? prev.runMin ?? 3;
        const cooldown = payload?.cooldown ?? prev.cooldown ?? 15;
        const daylightOnly = payload?.daylightOnly ?? prev.daylightOnly ?? false;
        const lightGate = payload?.lightGate ?? prev.lightGate ?? 30;

        if (!Number.isFinite(Number(moistureTarget))) { const e = new Error('Invalid moistureTarget'); e.code=400; throw e; }
        if (!Number.isFinite(Number(hysteresis))) { const e = new Error('Invalid hysteresis'); e.code=400; throw e; }

        const runMinInt = Number.parseInt(runMin, 10);
        const cooldownInt = Number.parseInt(cooldown, 10);
        const lightGateInt = Number.parseInt(lightGate, 10);

        if (!Number.isInteger(runMinInt) || runMinInt < 0)
        { const e=new Error('Invalid runMin'); e.code=400; throw e; }

        if (!Number.isInteger(cooldownInt) || cooldownInt < 0)
        { const e=new Error('Invalid cooldown'); e.code=400; throw e; }

        if (!Number.isInteger(lightGateInt)|| lightGateInt<0 || lightGateInt>100)
        { const e=new Error('Invalid lightGate'); e.code=400; throw e; }

        const daylightBool =
            (daylightOnly === true || daylightOnly === 'true' || daylightOnly === 1 || daylightOnly === '1') ? true
                : (daylightOnly === false || daylightOnly === 'false' || daylightOnly === 0 || daylightOnly === '0')
                    ? false : (()=>{ const e=new Error('Invalid daylightOnly'); e.code=400; throw e; })();

        data.SOIL_MOISTURE_MODE = {
            moisture: Number(prev.moisture ?? 0),
            light: Number(prev.light ?? 0),
            moistureTarget: Number(moistureTarget),
            hysteresis: Number(hysteresis),
            runMin: runMinInt,
            cooldown: cooldownInt,
            daylightOnly: daylightBool,
            lightGate: lightGateInt
        };
        await this._writeJson({ SOIL_MOISTURE_MODE: data.SOIL_MOISTURE_MODE });
        info('ESP', 'SOIL_MOISTURE_MODE config updated', { deviceId: this.ids.deviceId });
        return { SOIL_MOISTURE_MODE: data.SOIL_MOISTURE_MODE };
    }

    async SaturdayMode(payload) {
        const duration = this._ensureFiniteNumber(payload?.duration, 'duration');
        const d = this._parseDate(payload?.dateAct);
        const t = this._parseTime(payload?.timeAct);
        const validDate = d && d.day >= 1 && d.day <= 31 && d.month >= 1 && d.month <= 12 && d.year >= 2020;
        const validTime = t && t.hour >= 0 && t.hour <= 23 && t.minute >= 0 && t.minute <= 59;
        if (!validDate || !validTime || duration <= 0) {
            warn('VALIDATION', 'Invalid Saturday config',
                { dateAct: payload?.dateAct, timeAct: payload?.timeAct, duration: payload?.duration });
            const err = new Error('Please insert a valid date/time/duration');
            err.code = 400;
            throw err;
        }

        const data = await this._readJson();
        data.SATURDAY_MODE = {
            ...(data.SATURDAY_MODE || {}),
            dateAct: payload.dateAct, timeAct: payload.timeAct, duration: duration
        };
        await this._writeJson({ SATURDAY_MODE: data.SATURDAY_MODE });
        info('ESP', 'SATURDAY_MODE config updated', { deviceId: this.ids.deviceId });
        return { SATURDAY_MODE: data.SATURDAY_MODE };
    }

    async ManualMode(payload) {
        const data = await this._readJson();
        if (typeof payload === 'undefined' || typeof payload.enabled === 'undefined') {
            return { MANUAL_MODE: !!(data.MANUAL_MODE && data.MANUAL_MODE.enabled) };
        }
        const enabled = payload.enabled === true || payload.enabled === 'true';
        data.MANUAL_MODE = { ...(data.MANUAL_MODE || {}), enabled };
        await this._writeJson({ MANUAL_MODE: data.MANUAL_MODE });
        info('ESP', 'MANUAL_MODE updated', { enabled, deviceId: this.ids.deviceId });
        return { MANUAL_MODE: data.MANUAL_MODE };
    }

    // --- קריאות חיישנים ---
    async setPumpStatus(payload) {
        const raw = payload?.status ?? payload?.on ?? payload?.pump?.on ?? payload?.flag;
        const st  = toInt01(raw);
        const on  = st === 1;

        const patch  = { pump: { on, updatedAt: new Date().toISOString() } };
        const merged = await this._writeJson(patch);

        info('ESP','pump status updated (int)', { incoming: payload, st, on, deviceId: this.ids.deviceId });
        return { pump: merged.pump };
    }

    async UpdateTemp(payload) {
        const t = this._ensureFiniteNumber(payload?.temp ?? payload?.TEMP_MODE?.temp, 'temp');
        const data = await this._readJson();
        const before = data?.TEMP_MODE?.temp ?? null;
        data.TEMP_MODE = { ...(data.TEMP_MODE || {}), temp: t };
        await this._writeJson(data);
        info('SENSOR', 'temp updated', { from: before, to: t, deviceId: this.ids.deviceId });
        return { message: 'Temp sensor updated', temp: t, TEMP_MODE: data.TEMP_MODE };
    }

    async UpdateLight(payload) {
        const l = this._ensureFiniteNumber(payload?.light ?? payload?.TEMP_MODE?.light, 'light');
        const data = await this._readJson();
        const before = data?.TEMP_MODE?.light ?? null;
        data.TEMP_MODE = { ...(data.TEMP_MODE || {}), light: l };
        await this._writeJson(data);
        info('SENSOR', 'light updated', { from: before, to: l, deviceId: this.ids.deviceId });
        return { message: 'Light sensor updated', light: l, TEMP_MODE: data.TEMP_MODE };
    }

    async UpdateMoisture(payload) {
        const m = this._ensureFiniteNumber(payload?.moisture ?? payload?.SOIL_MOISTURE_MODE?.moisture, 'moisture');
        const data = await this._readJson();
        const before = data?.SOIL_MOISTURE_MODE?.moisture ?? null;
        data.SOIL_MOISTURE_MODE = { ...(data.SOIL_MOISTURE_MODE || {}), moisture: m };
        await this._writeJson(data);
        info('SENSOR', 'moisture updated', { from: before, to: m, deviceId: this.ids.deviceId });
        return { message: 'Moisture sensor updated', moisture: m, SOIL_MOISTURE_MODE: data.SOIL_MOISTURE_MODE };
    }

    // --- עוזרים לזמן ותאריך ---
    _parseDate(dateStr) {
        const parts = (dateStr || '').split('/').map(p => parseInt(p, 10));
        if (parts.length !== 3) return null;
        const [day, month, year] = parts;
        if (![day, month, year].every(Number.isInteger)) return null;
        return { day, month, year };
    }

    _parseTime(timeStr) {
        const parts = (timeStr || '').split(':').map(p => parseInt(p, 10));
        if (parts.length !== 2) return null;
        const [hour, minute] = parts;
        if (![hour, minute].every(Number.isInteger)) return null;
        return { hour, minute };
    }
}

module.exports = EspData;
