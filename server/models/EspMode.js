// models/EspMode.js
const { info, warn, error: logError } = require('../utils/logger');

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

        // מסמך לא קיים → ניצור ברירת מחדל
        warn('ESP', '_readJson(): no doc, creating default', { ids: this.ids });

        const init = {
            state: 61,
            TEMP_MODE: { temp: 0, tempLVL: 0, minTime: 0, maxTime: 0, light: 0, lightThresHold: 0, minLight: 0, maxLight: 0 },
            SOIL_MOISTURE_MODE: { minMoisture: 0, maxMoisture: 0, moistureLVL: 0, moisture: 0 },
            SATURDAY_MODE: { dateAct: "", timeAct: "", duration: 0 },
            MANUAL_MODE: { enabled: false }
        };
        await this.store.write(this.ids, init);
        return init;
    }

    // --- כתיבה (עם מיזוג נתונים) ---
    async _writeJson(obj) {
        const existing = await this.store.read(this.ids);
        const merged = existing ? this._deepMerge(existing, obj) : obj;

        // לא להדפיס את כל הדוק – רק מטא (מונע ספאם)
        info('DB', 'upsert device state', {
            deviceId: this.ids.deviceId,
            hasExisting: !!existing,
            keys: Object.keys(merged),
            size: JSON.stringify(merged).length
        });

        await this.store.write(this.ids, merged);
        return merged;
    }

    // --- פונקציית עזר למיזוג עמוק ---
    _deepMerge(target, source) {
        if (typeof target !== 'object' || target === null) return source;
        const output = { ...target };
        for (const key of Object.keys(source)) {
            if (typeof source[key] === 'object' && source[key] !== null) {
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
            // חשוב: גם לזרוק (עם קוד) וגם ללוגג
            warn('VALIDATION', `Invalid numeric value for ${name}`, { value });
            const err = new Error(`Invalid numeric value for ${name}`);
            err.code = 400;
            throw err;
        }
        return n;
    }

    // --- שליטה כללית ---
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
        const tempLVL        = this._ensureFiniteNumber(payload?.tempLVL, 'tempLVL');
        const minTime        = this._ensureFiniteNumber(payload?.minTime, 'minTime');
        const maxTime        = this._ensureFiniteNumber(payload?.maxTime, 'maxTime');
        const lightThresHold = this._ensureFiniteNumber(payload?.lightThresHold, 'lightThresHold');
        const minLight       = this._ensureFiniteNumber(payload?.minLight, 'minLight');
        const maxLight       = this._ensureFiniteNumber(payload?.maxLight, 'maxLight');

        if (![minTime, maxTime, lightThresHold, minLight, maxLight].every(Number.isInteger)) {
            warn('VALIDATION', 'Temperature mode numeric values must be integers', {
                minTime, maxTime, lightThresHold, minLight, maxLight
            });
            const err = new Error('Temperature mode numeric values must be integers');
            err.code = 400;
            throw err;
        }

        const data = await this._readJson();
        data.TEMP_MODE = {
            ...(data.TEMP_MODE || {}),
            tempLVL, minTime, maxTime, lightThresHold, minLight, maxLight
        };
        await this._writeJson({ TEMP_MODE: data.TEMP_MODE });
        info('ESP', 'TEMP_MODE config updated', { deviceId: this.ids.deviceId });
        return { TEMP_MODE: data.TEMP_MODE };
    }

    async MoistureMode(payload) {
        const moistureLVL = this._ensureFiniteNumber(payload?.moistureLVL, 'moistureLVL');
        const minMoisture = this._ensureFiniteNumber(payload?.minMoisture, 'minMoisture');
        const maxMoisture = this._ensureFiniteNumber(payload?.maxMoisture, 'maxMoisture');

        if (![moistureLVL, minMoisture, maxMoisture].every(Number.isInteger)) {
            warn('VALIDATION', 'Moisture mode numeric values must be integers', {
                moistureLVL, minMoisture, maxMoisture
            });
            const err = new Error('Moisture mode numeric values must be integers');
            err.code = 400;
            throw err;
        }

        const data = await this._readJson();
        data.SOIL_MOISTURE_MODE = {
            ...(data.SOIL_MOISTURE_MODE || {}),
            moistureLVL, minMoisture, maxMoisture
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
            warn('VALIDATION', 'Invalid Saturday config', { dateAct: payload?.dateAct, timeAct: payload?.timeAct, duration });
            const err = new Error('Please insert a valid date/time/duration');
            err.code = 400;
            throw err;
        }

        const data = await this._readJson();
        data.SATURDAY_MODE = {
            ...(data.SATURDAY_MODE || {}),
            dateAct: payload.dateAct, timeAct: payload.timeAct, duration
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
    async UpdateTemp(payload) {
        const t = this._ensureFiniteNumber(payload?.temp ?? payload?.TEMP_MODE?.temp, 'temp');
        const data = await this._readJson();
        const before = data?.TEMP_MODE?.temp ?? null;
        data.TEMP_MODE = { ...(data.TEMP_MODE || {}), temp: t };
        await this._writeJson(data); // כותב דוק מלא
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
