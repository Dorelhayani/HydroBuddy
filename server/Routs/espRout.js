// EspRout.js

const express = require('express');
const router = express.Router();
const EspData = require('../models/EspMode');
const db = require('../models/database');
const path = require('path');
const fs = require('fs').promises;

const jsonPath = path.join(process.cwd(), 'Inside_Information.json');
const Esp = new EspData(db);

function handleError(res, err) {
    const status = typeof err.code === 'number' ? err.code : 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
}

router.get('/', (req, res) => {
    res.send('ESP root route reached.');
});

// Read JSON file (raw)
router.get('/sendJSON', async (req, res) => {
    try {
        const raw = await fs.readFile(jsonPath, 'utf8');
        const json = JSON.parse(raw);
        return res.status(200).json(json);
    } catch (err) {
        return handleError(res, err);
    }
});

// ESP state (get / set)
router.patch('/state', async (req, res) => {
    try {
        const result = await Esp.EspState(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return handleError(res, err);
    }
});

// Data mode (query param or default)
router.get('/dataMode', async (req, res) => {
    try {
        const result = await Esp.DataMode(req.query);
        return res.status(200).json(result);
    } catch (err) {
        return handleError(res, err);
    }
});

// Temperature mode (set config)
router.patch('/temp', async (req, res) => {
    try {
        const result = await Esp.TemperatureMode(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return handleError(res, err);
    }
});

// Update temperature reading
router.patch('/temp-config', async (req, res) => {
    try {
        const result = await Esp.UpdateTemp(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return handleError(res, err);
    }
});

// Update light reading
router.patch('/light-config', async (req, res) => {
    try {
        const result = await Esp.UpdateLight(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return handleError(res, err);
    }
});

// Moisture mode (set config)
router.patch('/moisture', async (req, res) => {
    try {
        const result = await Esp.MoistureMode(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return handleError(res, err);
    }
});

// Update moisture reading
router.patch('/moist-config', async (req, res) => {
    try {
        const result = await Esp.UpdateMoisture(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return handleError(res, err);
    }
});

// Saturday mode
router.patch('/saturday', async (req, res) => {
    try {
        const result = await Esp.SaturdayMode(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return handleError(res, err);
    }
});

// Manual mode (get/set)
router.patch('/manual', async (req, res) => {
    try {
        const result = await Esp.ManualMode(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return handleError(res, err);
    }
});

module.exports = router;
