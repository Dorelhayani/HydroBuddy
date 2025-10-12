// EspRout.js

const express = require('express');
const router = express.Router();

const db = require('../models/database');
// const { EspPerUser } = require('../models/EspPerUser');

const EspData = require('../models/EspMode');
const { EspPerUser } = require('../models/DeviceHandler');

const { EspPerUser: EspPerUserFactory } = require('../models/DeviceHandler');
const espPerUser = EspPerUserFactory(db, EspData);

// error handling
function handleError(res, err) {
    const status = typeof err.code === 'number' ? err.code : 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
}

// בריאות
router.get('/', (req, res) => res.send('ESP root route reached.'));

// JSON מלא
router.get('/sendJSON', espPerUser, async (req, res) => {
    try {
        const data = await req.esp._readJson();
        return res.status(200).json(data);
    } catch (err) { return handleError(res, err); }
});

// DataMode
router.get('/dataMode', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.DataMode(req.query); // { state: 'TEMP_MODE' } אופציונלי
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// עדכון state כללי (גם ESP עם headers, גם UI עם קוקי)
router.patch('/state', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.EspState(req.body); // { state }
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// קונפיג טמפ׳
router.patch('/temp', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.TemperatureMode(req.body);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// קונפיג לחות אדמה
router.patch('/moisture', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.MoistureMode(req.body);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// קונפיג שבת
router.patch('/saturday', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.SaturdayMode(req.body);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// מצב ידני (בוליאני enabled)
router.patch('/manual', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.ManualMode(req.body);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// עדכוני סנסורים (payload יכול להיות {temp} / {light} / {moisture} או אובייקט מצב)
router.patch('/temp-config', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.UpdateTemp(req.body);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

router.patch('/light-config', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.UpdateLight(req.body);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

router.patch('/moist-config', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.UpdateMoisture(req.body);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

module.exports = router;


// =====================================================================================================================
// sendJSON => return to the user full JSON (TEMP_MODE, SOIL_MOISTURE_MODE, SATURDAY_MODE, MANUAL_MODE, state)
// dataMode => return the system state , { CurrentStatus }, state=KEY
// state => system mode change

// temp =>
// temp (temp-config = sensor reading)
// tempLVL (setting the temperature level for the pump to be activated)
// minTime (setting the temperature level for the pump to be activated)
// maxTime (setting the temperature level for the pump to be activated)
// light ( light-config = sensor reading)
// lightThresHold (setting light threshold)
// minLight (setting the minimum light value for the pump to be activated)
// maxLight (setting the maximum light value for the pump to be activated)

// moisture =>
// minMoisture (setting the minimum moisture value for the pump to be activated)
// maxMoisture (setting the minimum moisture value for the pump to be activated)
// moistureLVL (setting the moisture level for the pump to be activated)
// moisture (moist-config = sensor reading)

// saturday =>
// dateAct (setting the date for the pump activation)
// timeAct (setting the time for the pump activation)
// duration (setting the duration for the pump activation)

// manual =>
// enabled (boolean state => {true = pump on}, {false = pump off})
// =====================================================================================================================
