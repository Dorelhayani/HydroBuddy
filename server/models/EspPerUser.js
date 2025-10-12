// EspPerUser.js

const db = require('../models/database');
const EspData = require('../models/EspMode');
const DeviceModel = require('./DeviceMode');
const Devices = new DeviceModel(db, { useBindings: false });
const DeviceStore = require('./EspStateStore.db.device');
const deviceStore = new DeviceStore(db);

function EspPerUser() {
    return async (req, res, next) => {
        try {
            let userId = req.user_id || req?.user?.id || null;
            let deviceId = null;

            if (req.get('X-Device-Id') && req.get('X-Device-Key')) {
                const ident = await Devices.deviceIdentityFromHeaders(req);
                if (ident) {
                    deviceId = ident.device_id || null;
                    if (!userId && ident.user_id) userId = String(ident.user_id);
                }
            }

            if (!deviceId && userId) {
                const dev = await Devices.getDeviceByUserId(userId);
                if (dev) deviceId = dev.id;
            }

            if (!userId)  return res.status(401).json({ error: 'Unauthorized' });
            if (!deviceId) return res.status(400).json({ error: 'Missing deviceId' });

            req.user_id   = String(userId);
            req.device_id = deviceId;
            req.esp = new EspData(db, { userId: String(userId), deviceId }, deviceStore);
            next();
        } catch (e) { next(e); }
    };
}

module.exports = { EspPerUser };
