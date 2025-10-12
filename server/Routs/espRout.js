// Routs/espRout.js
const express = require('express');
const router = express.Router();

const db = require('../models/database');
const EspData = require('../models/EspMode');
const { EspPerUser } = require('../models/DeviceHandler');

// יצירה חד-פעמית של המידלוור עם db + EspData
const espPerUser = EspPerUser(db, EspData);

// שיטת עזרה לשגיאות
function handleError(res, err) {
    const status = typeof err.code === 'number' ? err.code : 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
}

// Root
router.get('/', (req, res) => res.send('ESP root route reached.'));

// JSON מלא (לקריאת UI / מכשיר)
router.get('/sendJSON', espPerUser, async (req, res) => {
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

// קונפיג טמפ׳/אור
router.patch('/temp', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.TemperatureMode(req.body);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// קונפיג לחות
router.patch('/moisture', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.MoistureMode(req.body);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// שבת
router.patch('/saturday', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.SaturdayMode(req.body);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// מצב ידני
router.patch('/manual', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.ManualMode(req.body);
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

// עדכוני קריאות סנסורים (מה־ESP או ידני)
router.patch('/temp-config', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.UpdateTemp(req.body); // { temp } או { TEMP_MODE:{temp} }
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

router.patch('/light-config', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.UpdateLight(req.body); // { light } או { TEMP_MODE:{light} }
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

router.patch('/moist-config', espPerUser, async (req, res) => {
    try {
        const result = await req.esp.UpdateMoisture(req.body); // { moisture } או { SOIL_MOISTURE_MODE:{moisture} }
        return res.status(200).json(result);
    } catch (err) { return handleError(res, err); }
});

module.exports = router;
