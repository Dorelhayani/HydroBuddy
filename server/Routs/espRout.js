const express = require("express");
const router = express.Router();
const EspData = require("../models/EspMode");
const db = require("../models/database");
const path = require("path");
const fs = require("fs");
const jsonPath = path.join(process.cwd(), "Inside_Information.json");
const Esp = new EspData(db);

router.get("/", (req, res) => {
    console.log("Received query:", req.query);
    res.send("ESP root route reached.");
});

// Read JSON File
// ---------------------------------------------------------------------------------------------------------------------
router.get("/sendJSON", async (req, res) => {
    try {
        // const raw = await fs.readFile(JSON_PATH, "utf8");
        const raw = fs.readFileSync(jsonPath, "utf8");
        const json = JSON.parse(raw);
        res.status(200).json(json);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ---------------------------------------------------------------------------------------------------------------------


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


// Update Light sensor's reading to JSON
// ---------------------------------------------------------------------------------------------------------------------
router.patch("/light-config", async (req, res) => {
    try{
        const result = await Esp.UpadteLight(req.body);
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


// Update Moisture sensor's reading to JSON
// ---------------------------------------------------------------------------------------------------------------------
router.patch("/moist-config", async (req, res) => {
    try{
        const result = await Esp.UpadteMoisture(req.body);
        return res.status(200).json(result);
    } catch (err) {
        res.status(err.code || 500).json({ error: err.message });
        const statusCode = err.code && [400, 404].includes(err.code) ? err.code : 500;
        return res.status(statusCode).json({ error: err.message });
    }
})
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







