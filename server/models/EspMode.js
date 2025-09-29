const fs = require('fs').promises;
const path = require('path');

class EspData {
    constructor(db) {
        this.DB = db;
        this.jsonPath = path.join(__dirname, '..', 'Inside_Information.json');
    }

    // --- helpers ---
    async _readJson() {
        const raw = await fs.readFile(this.jsonPath, 'utf8');
        return JSON.parse(raw);
    }

    async _writeJson(obj) {
        await fs.writeFile(this.jsonPath, JSON.stringify(obj, null, 2), 'utf8');
    }

    _ensureFiniteNumber(value, name) {
        const n = Number(value);
        if (!Number.isFinite(n)) {
            const err = new Error(`Invalid numeric value for ${name}`);
            err.code = 400;
            throw err;
        }
        return n;
    }

    // --- ESP state (get / set) ---
    async EspState(payload) {
        const data = await this._readJson();

        if (payload && typeof payload.state !== 'undefined') {
            data.state = payload.state;
            await this._writeJson(data);
            return { message: 'State updated', CurrentStatus: data.state };
        }

        return { CurrentStatus: data.state };
    }

    // --- Data mode: return specific key or current state ---
    async DataMode(payload) {
        const data = await this._readJson();
        if (payload && payload.state) {
            const key = payload.state;
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                return { [key]: data[key] };
            }
            const err = new Error(`State '${key}' not found`);
            err.code = 404;
            throw err;
        }
        return { CurrentStatus: data.state };
    }

    // --- Temperature mode: set full mode config ---
    async TemperatureMode(payload) {
        const tempLVL = this._ensureFiniteNumber(payload?.tempLVL, 'tempLVL');
        const minTime = this._ensureFiniteNumber(payload?.minTime, 'minTime');
        const maxTime = this._ensureFiniteNumber(payload?.maxTime, 'maxTime');
        const lightThresHold = this._ensureFiniteNumber(payload?.lightThresHold, 'lightThresHold');
        const minLight = this._ensureFiniteNumber(payload?.minLight, 'minLight');
        const maxLight = this._ensureFiniteNumber(payload?.maxLight, 'maxLight');

        if (![minTime, maxTime, lightThresHold, minLight, maxLight].every(Number.isInteger)) {
            const err = new Error('Temperature mode numeric values must be integers');
            err.code = 400;
            throw err;
        }

        const data = await this._readJson();
        data.TEMP_MODE = {
            ...(data.TEMP_MODE || {}),
            tempLVL,
            minTime,
            maxTime,
            lightThresHold,
            minLight,
            maxLight,
        };

        await this._writeJson(data);
        return { TEMP_MODE: data.TEMP_MODE };
    }

    // --- Update temperature reading ---
    async UpdateTemp(payload) {
        const t = this._ensureFiniteNumber(payload?.temp ?? payload?.TEMP_MODE?.temp, 'temp');
        const data = await this._readJson();
        data.TEMP_MODE = { ...(data.TEMP_MODE || {}), temp: t };
        await this._writeJson(data);
        return { message: 'Temp sensor updated', temp: t, TEMP_MODE: data.TEMP_MODE };
    }

    // --- Update light reading ---
    async UpdateLight(payload) {
        const l = this._ensureFiniteNumber(payload?.light ?? payload?.TEMP_MODE?.light, 'light');
        const data = await this._readJson();
        data.TEMP_MODE = { ...(data.TEMP_MODE || {}), light: l };
        await this._writeJson(data);
        return { message: 'Light sensor updated', light: l, TEMP_MODE: data.TEMP_MODE };
    }

    // --- Moisture mode: set full mode config ---
    async MoistureMode(payload) {
        const moistureLVL = this._ensureFiniteNumber(payload?.moistureLVL, 'moistureLVL');
        const minMoisture = this._ensureFiniteNumber(payload?.minMoisture, 'minMoisture');
        const maxMoisture = this._ensureFiniteNumber(payload?.maxMoisture, 'maxMoisture');

        if (![moistureLVL, minMoisture, maxMoisture].every(Number.isInteger)) {
            const err = new Error('Moisture mode numeric values must be integers');
            err.code = 400;
            throw err;
        }

        const data = await this._readJson();
        data.SOIL_MOISTURE_MODE = { minMoisture, maxMoisture, moistureLVL };
        await this._writeJson(data);
        return { message: 'Moisture mode updated', SOIL_MOISTURE_MODE: data.SOIL_MOISTURE_MODE };
    }

    // --- Update moisture reading ---
    async UpdateMoisture(payload) {
        const m = this._ensureFiniteNumber(payload?.moisture ?? payload?.SOIL_MOISTURE_MODE?.moisture, 'moisture');
        const data = await this._readJson();
        data.SOIL_MOISTURE_MODE = { ...(data.SOIL_MOISTURE_MODE || {}), moisture: m };
        await this._writeJson(data);
        return { message: 'Moisture sensor updated', moisture: m, SOIL_MOISTURE_MODE: data.SOIL_MOISTURE_MODE };
    }

    // --- Saturday mode: validate date/time strings and set ---
    _parseDate(dateStr) {
        const parts = (dateStr || '').split('/').map((p) => parseInt(p, 10));
        if (parts.length !== 3) return null;
        const [day, month, year] = parts;
        if (![day, month, year].every(Number.isInteger)) return null;
        return { day, month, year };
    }

    _parseTime(timeStr) {
        const parts = (timeStr || '').split(':').map((p) => parseInt(p, 10));
        if (parts.length !== 2) return null;
        const [hour, minute] = parts;
        if (![hour, minute].every(Number.isInteger)) return null;
        return { hour, minute };
    }

    async SaturdayMode(payload) {
        const duration = this._ensureFiniteNumber(payload?.duration, 'duration');
        const dateAct = payload?.dateAct;
        const timeAct = payload?.timeAct;

        const d = this._parseDate(dateAct);
        const t = this._parseTime(timeAct);

        const validDate = d && d.day >= 1 && d.day <= 31 && d.month >= 1 && d.month <= 12 && d.year >= 2020;
        const validTime = t && t.hour >= 0 && t.hour <= 23 && t.minute >= 0 && t.minute <= 59;
        if (!validDate || !validTime || duration <= 0) {
            const err = new Error('Please insert a valid date/time/duration');
            err.code = 400;
            throw err;
        }

        const data = await this._readJson();
        data.SATURDAY_MODE = { dateAct, timeAct, duration };
        await this._writeJson(data);
        return { message: 'Saturday mode updated', SATURDAY_MODE: data.SATURDAY_MODE };
    }

    // --- Manual mode: get or set enabled flag ---
    async ManualMode(payload) {
        const data = await this._readJson();

        // get
        if (typeof payload === 'undefined' || typeof payload.enabled === 'undefined') {
            return { MANUAL_MODE: !!(data.MANUAL_MODE && data.MANUAL_MODE.enabled) };
        }

        // set (accept boolean or "true"/"false")
        const enabled = payload.enabled === true || payload.enabled === 'true';
        data.MANUAL_MODE = { ...(data.MANUAL_MODE || {}), enabled };
        await this._writeJson(data);
        return { message: 'Manual mode updated', MANUAL_MODE: data.MANUAL_MODE };
    }
}

module.exports = EspData;
