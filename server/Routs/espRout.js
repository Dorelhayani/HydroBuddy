const express = require("express");
const router = express.Router();
const EspData = require("../models/EspMode");
const db = require("../models/database");
const fs = require("fs");
const Esp = new EspData(db);

router.get("/", (req, res) => {
    console.log("Received query:", req.query);
    res.send("ESP root route reached.");
});

// ESP State
// ---------------------------------------------------------------------------------------------------------------------
router.patch("/state", async (req, res) => {
    try {
        const result = await Esp.EspState(req.body);
        return res.status(200).json(result);
    } catch (err) {
        const statusCode = err.code && [400, 404].includes(err.code) ? err.code : 500;
        return res.status(statusCode).json({ error: err.message });
    }
});
// ---------------------------------------------------------------------------------------------------------------------


// Data Mode
// ---------------------------------------------------------------------------------------------------------------------
router.get("/dataMode", async (req, res) => {
    try {
        const result = await Esp.DataMode(req.query);
        return res.status(200).json(result);
    } catch (err) {
        const statusCode = err.code && [400, 404].includes(err.code) ? err.code : 500;
        return res.status(statusCode).json({ error: err.message });
    }
});

// ---------------------------------------------------------------------------------------------------------------------


// Temperature Mode
// ---------------------------------------------------------------------------------------------------------------------
router.patch("/temp", async (req, res) => {
    try {
        const result = await Esp.TemperatureMode(req.body);
        return res.status(200).json(result);
    } catch (err) {
        const statusCode = err.code && [400, 404].includes(err.code) ? err.code : 500;
        return res.status(statusCode).json({ error: err.message });
    }
});
// ---------------------------------------------------------------------------------------------------------------------


// Update Temperature sensor's reading to JSON
// ---------------------------------------------------------------------------------------------------------------------
router.patch("/temp-config", async (req, res) => {
try{
    const result = await Esp.UpadteTemp(req.body);
    return res.status(200).json(result);
} catch (err) {
    res.status(err.code || 500).json({ error: err.message });
    const statusCode = err.code && [400, 404].includes(err.code) ? err.code : 500;
    return res.status(statusCode).json({ error: err.message });
}
})
// ---------------------------------------------------------------------------------------------------------------------


// Moisture Mode
// ---------------------------------------------------------------------------------------------------------------------
router.patch("/moisture", async (req, res) => {
    try {
        const result = await Esp.MoistureMode(req.body);
        return res.status(200).json(result);
    } catch (err) {
        const statusCode = err.code && [400, 404].includes(err.code) ? err.code : 500;
        return res.status(statusCode).json({ error: err.message });
    }
});
// ---------------------------------------------------------------------------------------------------------------------


// Saturday Mode
// ---------------------------------------------------------------------------------------------------------------------
router.patch("/Saturday", async (req, res) => {
    try {
        const result = await Esp.SaturdayMode(req.body);
        return res.status(200).json(result);
    } catch (err) {
        const statusCode = err.code && [400, 404].includes(err.code) ? err.code : 500;
        return res.status(statusCode).json({ error: err.message });
    }
});
// ---------------------------------------------------------------------------------------------------------------------


// Manual Mode
// ---------------------------------------------------------------------------------------------------------------------
router.patch("/manual", async (req, res) => {
    try {
        const result = await Esp.ManualMode(req.body);
        return res.status(200).json(result);
    } catch (err) {
        const statusCode = err.code && [400, 404].includes(err.code) ? err.code : 500;
        return res.status(statusCode).json({ error: err.message });
    }
});
// ---------------------------------------------------------------------------------------------------------------------
module.exports = router;







