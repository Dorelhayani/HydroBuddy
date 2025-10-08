// PlantRout.js

const express = require('express');
const router = express.Router();
const PlantData = require('../models/PlantMode');
const db = require('../models/database');

const Plants = new PlantData(db);

function handleError(res, err) {
    const msg = err && err.message ? err.message : 'Internal server error';
    if (err && err.code && typeof err.code === 'number') return res.status(err.code).json({ error: msg });
    if (/not found/i.test(msg)) return res.status(404).json({ error: msg });
    if (/missing/i.test(msg) || /invalid/i.test(msg)) return res.status(400).json({ error: msg });
    return res.status(500).json({ error: msg });
}

// List all plants (admin/public)
router.get('/list', async (req, res) => {
    try {
        const data = await Plants.Read();
        return res.status(200).json(data);
    } catch (err) {
        return handleError(res, err);
    }
});

// plantList -> return array of plants directly
router.get("/plantList", async (req, res) => {
    try {
        const user_id = req.user_id;
        if (!user_id) return res.status(401).json({ error: 'Not authenticated' });

        const plants = await Plants.ReadUserPlant(user_id);
        return res.status(200).json(plants); // <-- RETURNS ARRAY DIRECTLY
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Store Sensors Value To Datasensors
router.post('/StoreToDatasensors', async (req, res) => {
    try {
        const user_id = req.user_id;
        if (!user_id) return res.status(401).json({ error: 'Not authenticated' });

        const { temp, light, moisture, isPumpON } = req.body;
        const t = Number(temp);
        const l = Number(light);
        const m = Number(moisture);
        const running = Number(isPumpON);

        if (![t, l, m].every(Number.isFinite)) return res.status(400).json({ error: 'Invalid sensor values' });

        const result = await Plants.storeESPData(user_id, t, l, m, running ? 1 : 0);
        return res.status(200).json(result);
    } catch (err) {
        return handleError(res, err);
    }
});

// Add plant (create planttype if needed + plant)
router.post('/add', async (req, res) => {
    try {
        const user_id = req.user_id;
        if (!user_id) return res.status(401).json({ error: 'Not authenticated' });

        const { name } = req.body;
        if (!name || String(name).trim() === '') return res.status(400).json({ error: 'Missing plant name' });

        // optional verify user exists
        const [urows] = await db.execute('SELECT id FROM users WHERE id = ? LIMIT 1', [user_id]);
        if (!urows || urows.length === 0) return res.status(404).json({ error: 'User not found' });

        const plantId = await Plants.Create(name, user_id);
        return res.status(201).json({ plantId });
    } catch (err) {
        return handleError(res, err);
    }
});


// Update plant type name (owned by user)
router.patch('/update/:id', async (req, res) => {
    try {
        const user_id = req.user_id;
        if (!user_id) return res.status(401).json({ error: 'Not authenticated' });

        const plantTypeId = Number(req.body.plantTypeId);
        const name = req.body.name;
        if (!plantTypeId || !name || String(name).trim() === '') return res.status(400).json({ error: 'Missing parameters' });

        await Plants.Update(plantTypeId, name, user_id);
        return res.status(200).json({ message: 'Plant type updated' });
    } catch (err) {
        return handleError(res, err);
    }
});

// Delete plant type (owned by user)
router.delete('/delete/:id', async (req, res) => {
    try {
        const user_id = req.user_id;
        if (!user_id) return res.status(401).json({ error: 'Not authenticated' });

        const plantTypeId = Number(req.body.plantTypeId);
        if (!plantTypeId) return res.status(400).json({ error: 'Missing plantTypeId' });

        await Plants.Delete(plantTypeId, user_id);
        return res.status(200).json({ message: 'Plant type deleted' });
    } catch (err) {
        return handleError(res, err);
    }
});

module.exports = router;
