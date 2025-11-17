/* ===== espRout.js ===== */

const express = require('express');
const router = express.Router();

const db = require('../models/database');
const EspData = require('../models/Esp');
const { EspPerUser } = require('../models/DeviceHandler');
const { broadcastSensorUpdate } = require('../utils/webSocketUtils');
const SensorLog = require('../models/SensorLog');

const espPerUser = EspPerUser(db, EspData);
const sensorLog = new SensorLog(db);

// שיטת עזרה לשגיאות
function handleError(res, err) {
    const status = typeof err.code === 'number' ? err.code : 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
}

// --- Analytics: today summary for current user ---
router.get('/analytics/today', async (req, res) => {
    try {
        const userId = req.user_id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const [sensorRows] = await db.execute(
            `SELECT
                 AVG(ds.temp)      AS avgTemp,
                 AVG(ds.moisture)  AS avgMoisture,
                 AVG(ds.light)     AS avgLight
             FROM datasensors ds
                      JOIN plant p       ON ds.PlantID = p.ID
                      JOIN planttype pt  ON p.PlantTypeID = pt.ID
             WHERE pt.user_id = ?
               AND ds.Date = CURDATE()
               AND ds.pump_cycle_id IS NULL`,
            [userId]
        );

        const sensorsRow = sensorRows && sensorRows[0] ? sensorRows[0] : {};
        const sensors = {
            avgTemp:      sensorsRow.avgTemp      != null ? Number(sensorsRow.avgTemp)      : null,
            avgMoisture:  sensorsRow.avgMoisture  != null ? Number(sensorsRow.avgMoisture)  : null,
            avgLight:     sensorsRow.avgLight     != null ? Number(sensorsRow.avgLight)     : null,
        };

        const [pumpRows] = await db.execute(
            `SELECT
                 COALESCE(SUM(ds.pump_duration_sec), 0)        AS totalOnSec,
                 COUNT(DISTINCT ds.pump_cycle_id)              AS cycles
             FROM datasensors ds
                      JOIN plant p       ON ds.PlantID = p.ID
                      JOIN planttype pt  ON p.PlantTypeID = pt.ID
             WHERE pt.user_id = ?
               AND ds.Date = CURDATE()
               AND ds.pump_cycle_id IS NOT NULL`,
            [userId]
        );

        const pumpRow = pumpRows && pumpRows[0] ? pumpRows[0] : {};
        const pumpTotalOnSec = pumpRow.totalOnSec != null ? Number(pumpRow.totalOnSec) : 0;
        const pumpCycles     = pumpRow.cycles     != null ? Number(pumpRow.cycles)     : 0;

        const [modeRows] = await db.execute(
            `SELECT
                 ds.pump_mode                      AS mode,
                 COALESCE(SUM(ds.pump_duration_sec), 0) AS totalOnSec
             FROM datasensors ds
                      JOIN plant p       ON ds.PlantID = p.ID
                      JOIN planttype pt  ON p.PlantTypeID = pt.ID
             WHERE pt.user_id = ?
               AND ds.Date = CURDATE()
               AND ds.pump_cycle_id IS NOT NULL
               AND ds.pump_mode IS NOT NULL
             GROUP BY ds.pump_mode`,
            [userId]
        );

        const byMode = (modeRows || []).map(r => ({
            mode: r.mode,
            totalOnSec: Number(r.totalOnSec || 0),
        }));

        return res.status(200).json({
            date: new Date().toISOString().slice(0, 10),
            pump: {
                totalOnSec: pumpTotalOnSec,
                cycles: pumpCycles,
                byMode,
            },
            sensors,
        });
    } catch (err) {
        return handleError(res, err);
    }
});


router.post('/StoreToDatasensors', espPerUser, async (req, res) => {
    try {
        const userId = req.user_id || req.device?.user_id;
        if (!userId) { return res.status(401).json({ error: 'Not authenticated' }); }

        const deviceId = req.device?.id ?? null;

        const { temp, light, moisture } = req.body;
        const t = Number(temp);
        const l = Number(light);
        const m = Number(moisture);

        if (![t, l, m].every(Number.isFinite)) { return res.status(400).json({ error: 'Invalid sensor values' }); }

        const state = await req.esp.getState().catch(() => null);
        const pumpOn = state?.pump ? (state.pump.on ? 1 : 0) : null;
        const pumpMode = state ? sensorLog.ModeFromState(state) : null;

        const pumpCycleId = null;
        const pumpDurationSec = null;
        const note = null;

        const result = await sensorLog.storeESPData({userId, deviceId, temp: t, light: l, moisture: m, pumpOn, pumpMode,
            pumpCycleId, pumpDurationSec, note});

        return res.status(200).json(result);
    } catch (err) {
        return handleError(res, err);
    }
});

// Root
router.get('/', (req, res) => res.send('ESP root route reached.'));

router.get('/state', espPerUser, async (req, res) => {
    try {
        const data = await req.esp.getState();
        return res.status(200).json(data);
    } catch (err) { return handleError(res, err); }
});

// JSON מלא (לקריאת UI / מכשיר)
router.get('/getJSON', espPerUser, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store'); // למנוע 304
        const data = await req.esp._readJson();
        return res.status(200).json(data);
    } catch (err) { return handleError(res, err); }
});

// DataMode – ללא פרמטר → CurrentStatus, עם ?state=TEMP_MODE/...
router.get('/dataMode', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.DataMode(req.query);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// שינוי מצב כללי
router.patch('/state', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.EspState(req.body); // { state }
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

router.patch('/pump', espPerUser, async (req, res) => {
    try {
        const userId = req.user_id || req.device?.user_id || null;
        const deviceId = req.device?.id ?? null;

        const prevState = await req.esp.getState();
        const prevOn = !!prevState?.pump?.on;

        const result = await req.esp.setPumpStatus(req.body);
        const newState = await req.esp.getState();
        const nowOn = !!newState?.pump?.on;
        broadcastSensorUpdate(newState);

        if (userId && deviceId) {
            const pumpMode = sensorLog.ModeFromState(newState);

            if (!prevOn && nowOn) { sensorLog.beginPumpCycle({ deviceId, userId, pumpMode }); }

            if (prevOn && !nowOn) {
                const temp = Number(newState?.TEMP_MODE?.temp ?? NaN);
                const light = Number(newState?.TEMP_MODE?.light ?? NaN);
                const moisture = Number(newState?.SOIL_MOISTURE_MODE?.moisture ?? NaN);

                if ([temp, light, moisture].every(Number.isFinite)) {
                    await sensorLog.endPumpCycle({ deviceId, temp, light, moisture });
                }
            }
        }

        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// קונפיג טמפ׳/אור
router.patch('/temp', espPerUser, async (req, res) => {
    const result = await req.esp.TemperatureMode(req.body);
    const currentState = await req.esp.getState();
    broadcastSensorUpdate(currentState);
    return res.status(200).json(result);
});

router.patch('/moisture', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.MoistureMode(req.body);
        const currentState = await req.esp.getState();
        broadcastSensorUpdate(currentState);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// שבת
router.patch('/saturday', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.SaturdayMode(req.body);
        const currentState = await req.esp.getState();
        broadcastSensorUpdate(currentState);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// מצב ידני
router.patch('/manual', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.ManualMode(req.body);
        const currentState = await req.esp.getState();
        broadcastSensorUpdate(currentState);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});


router.patch('/pump-stts', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.PumpState(req.body);
        const currentState = await req.esp.getState();
        broadcastSensorUpdate(currentState);

        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

router.patch('/temp-config', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.UpdateTemp(req.body);
        const currentState = await req.esp.getState();
        broadcastSensorUpdate(currentState);

        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

router.patch('/light-config', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.UpdateLight(req.body);
        const currentState = await req.esp.getState();
        broadcastSensorUpdate(currentState);

        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

router.patch('/moist-config', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.UpdateMoisture(req.body);
        const currentState = await req.esp.getState();
        broadcastSensorUpdate(currentState);

        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

module.exports = router;
