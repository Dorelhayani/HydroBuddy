/* ===== deviceOrUserAuth.js ===== */

const bcrypt = require('bcryptjs');
const { info, warn } = require('../utils/logger');

module.exports = function deviceOrUserAuthFactory({ db, auth }) {
    return async function deviceOrUserAuth(req, res, next) {
        try {
            const devId  = req.get('X-Device-Id');
            const devKey = req.get('X-Device-Key');

            if (devId && devKey) {
                info('AUTH', 'device auth attempt', { devId }, req.reqId);
                try {
                    const [rows] = await db.execute(
                        'SELECT id, user_id, device_uid, device_key, name FROM devices WHERE device_uid = ? LIMIT 1',
                        [devId]
                    );
                    if (rows && rows.length) {
                        const dev = rows[0];
                        const ok = await bcrypt.compare(devKey, dev.device_key);

                        if (!ok) { warn('AUTH','bad device key',{ devId }, req.reqId);  }
                        else { info('AUTH','fall back to user cookie', {}, req.reqId); }

                        info('AUTH','device auth OK',{ device_id: dev.id, user_id: dev.user_id }, req.reqId);


                        req.device   = { id: dev.id, uid: dev.device_uid, user_id: dev.user_id, name: dev.name };
                        req.authType = 'device';
                        return next();
                    }

                    if (process.env.DEVICE_UID && process.env.DEVICE_KEY &&
                        devId === process.env.DEVICE_UID && devKey === process.env.DEVICE_KEY) {
                        req.device   = { id: 0, uid: devId, user_id: 0, name: 'ENV Device' };
                        req.authType = 'device';
                        return next();
                    }

                    return res.status(401).json({ error: 'Device not registered' });
                } catch (e) {
                    console.error('Device verification error:', e);
                    return res.status(500).json({ error: 'Device verification error' });
                }
            }

            req.authType = 'user';
            return auth.isLogged(req, res, next);
        } catch (err) {
            console.error('deviceOrUserAuth error:', err);
            return res.status(500).json({ error: 'Auth dispatch error' });
        }
    };
};