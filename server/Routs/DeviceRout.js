// DeviceRout.js

const express = require('express');
const router = express.Router();

const db = require('../models/database');
const AuthModel = require('../models/Auth');
const auth = new AuthModel(db);

const DeviceModel = require('../models/DeviceMode');
const Devices = new DeviceModel(db, { useBindings: false }); // חשוב!

function handleError(res, err) {
    const status = typeof err.code === 'number' ? err.code : 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
}

router.post('/', auth.isLogged.bind(auth), async (req, res) => {
    try {
        // מקבל גם device_key וגם device_key_plain
        const { device_uid, device_key, device_key_plain, name, user_id } = req.body;
        const result = await Devices.createDevice({
            device_uid,
            device_key_plain,
            device_key,
            name,
            user_id,
        });
        return res.status(201).json({ message: 'Device created', ...result });
    } catch (e) { return handleError(res, e); }
});

router.put('/:deviceUid/assign', auth.isLogged.bind(auth), async (req, res) => {
    try {
        const deviceUid = req.params.deviceUid;
        const { user_id } = req.body;
        const result = await Devices.assignDeviceToUser(deviceUid, user_id);
        return res.status(200).json({ message: 'Device assigned', deviceUid, ...result });
    } catch (e) { return handleError(res, e); }
});

router.get('/:deviceUid', auth.isLogged.bind(auth), async (req, res) => {
    try {
        const row = await Devices.getDeviceByUid(req.params.deviceUid);
        if (!row) return res.status(404).json({ error: 'Device not found' });
        return res.json(row);
    } catch (e) { return handleError(res, e); }
});

module.exports = router;
