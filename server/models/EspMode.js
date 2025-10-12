// EspMode.js

class EspData {
    constructor(db, ids, store) {
        this.DB = db;
        this.ids = ids;       // { userId, deviceId }
        this.store = store;   // EspStateStoreDeviceDB
    }

    // JSON file reading
    async _readJson() {
        let data = await this.store.read(this.ids);
        if (data) return data;
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

    // writing to JSON document
    async _writeJson(obj) { await this.store.write(this.ids, obj); }

    _ensureFiniteNumber(value, name) {
        const n = Number(value);
        if (!Number.isFinite(n)) {
            const err = new Error(`Invalid numeric value for ${name}`);
            err.code = 400;
            throw err;
        }
        return n;
    }

    // reading esp state &&  data mod (return {"state": })
    async EspState(payload) {
        const data = await this._readJson();
        if (payload && typeof payload.state !== 'undefined') {
            data.state = payload.state;
            await this._writeJson(data);
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
            const err = new Error(`State '${key}' not found`);
            err.code = 404;
            throw err;
        }
        return { CurrentStatus: data.state };
    }

    // mods handling - { temperature, moisture, saturday, manual }
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
        data.TEMP_MODE = { ...(data.TEMP_MODE || {}), tempLVL, minTime, maxTime, lightThresHold, minLight, maxLight };
        await this._writeJson(data);
        return { TEMP_MODE: data.TEMP_MODE };
    }

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

    async SaturdayMode(payload) {
        const duration = this._ensureFiniteNumber(payload?.duration, 'duration');
        const d = this._parseDate(payload?.dateAct);
        const t = this._parseTime(payload?.timeAct);
        const validDate = d && d.day >= 1 && d.day <= 31 && d.month >= 1 && d.month <= 12 && d.year >= 2020;
        const validTime = t && t.hour >= 0 && t.hour <= 23 && t.minute >= 0 && t.minute <= 59;
        if (!validDate || !validTime || duration <= 0) {
            const err = new Error('Please insert a valid date/time/duration');
            err.code = 400;
            throw err;
        }
        const data = await this._readJson();
        data.SATURDAY_MODE = { dateAct: payload.dateAct, timeAct: payload.timeAct, duration };
        await this._writeJson(data);
        return { message: 'Saturday mode updated', SATURDAY_MODE: data.SATURDAY_MODE };
    }

    async ManualMode(payload) {
        const data = await this._readJson();
        if (typeof payload === 'undefined' || typeof payload.enabled === 'undefined') {
            return { MANUAL_MODE: !!(data.MANUAL_MODE && data.MANUAL_MODE.enabled) };
        }
        const enabled = payload.enabled === true || payload.enabled === 'true';
        data.MANUAL_MODE = { ...(data.MANUAL_MODE || {}), enabled };
        await this._writeJson(data);
        return { message: 'Manual mode updated', MANUAL_MODE: data.MANUAL_MODE };
    }


    // Sensor's reading
    async UpdateTemp(payload) {
        const t = this._ensureFiniteNumber(payload?.temp ?? payload?.TEMP_MODE?.temp, 'temp');
        const data = await this._readJson();
        data.TEMP_MODE = { ...(data.TEMP_MODE || {}), temp: t };
        await this._writeJson(data);
        return { message: 'Temp sensor updated', temp: t, TEMP_MODE: data.TEMP_MODE };
    }

    async UpdateLight(payload) {
        const l = this._ensureFiniteNumber(payload?.light ?? payload?.TEMP_MODE?.light, 'light');
        const data = await this._readJson();
        data.TEMP_MODE = { ...(data.TEMP_MODE || {}), light: l };
        await this._writeJson(data);
        return { message: 'Light sensor updated', light: l, TEMP_MODE: data.TEMP_MODE };
    }

    async UpdateMoisture(payload) {
        const m = this._ensureFiniteNumber(payload?.moisture ?? payload?.SOIL_MOISTURE_MODE?.moisture, 'moisture');
        const data = await this._readJson();
        data.SOIL_MOISTURE_MODE = { ...(data.SOIL_MOISTURE_MODE || {}), moisture: m };
        await this._writeJson(data);
        return { message: 'Moisture sensor updated', moisture: m, SOIL_MOISTURE_MODE: data.SOIL_MOISTURE_MODE };
    }


    // parse date && time
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
}

module.exports = EspData;
