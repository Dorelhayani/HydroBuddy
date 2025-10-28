/* ===== logger.js ===== */

const { randomUUID } = require('crypto');

const MAX_ITEMS = 300;               // כמה שורות נשמור בזיכרון
const logBuffer = [];                // טבעת לוגים פשוטה בזיכרון

const LEVELS = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 };
const COLOR = {
    DEBUG: (s)=>`\x1b[90m${s}\x1b[0m`,
    INFO:  (s)=>`\x1b[36m${s}\x1b[0m`,
    WARN:  (s)=>`\x1b[33m${s}\x1b[0m`,
    ERROR: (s)=>`\x1b[31m${s}\x1b[0m`,
};

const NOW = () => new Date().toISOString().replace('T',' ').replace('Z','');

function push(evt) {
    logBuffer.push(evt);
    if (logBuffer.length > MAX_ITEMS) logBuffer.shift();
}

function fmt(evt) {
    const pfx = `[${evt.ts}] [${evt.level}] [${evt.cat}]`;
    const id  = evt.reqId ? ` [req:${evt.reqId}]` : '';
    const msg = evt.msg;
    const data = evt.data ? ` ${JSON.stringify(evt.data)}` : '';
    return `${pfx}${id} ${msg}${data}`;
}

function write(evt) {
    const line = fmt(evt);
    const color = COLOR[evt.level] || ((s)=>s);
    const out = (evt.level === 'ERROR' || evt.level === 'WARN') ? console.error : console.log;
    out(color(line));
}

function event(level, cat, msg, data = {}, reqId = null) {
    const evt = { ts: NOW(), level, cat, msg, data, reqId };
    push(evt); write(evt);
}

function info(cat, msg, data, reqId)  { event('INFO',  cat, msg, data, reqId); }
function warn(cat, msg, data, reqId)  { event('WARN',  cat, msg, data, reqId); }
function error(cat, msg, data, reqId) { event('ERROR', cat, msg, data, reqId); }
function debug(cat, msg, data, reqId) { event('DEBUG', cat, msg, data, reqId); }

function getRecent(limit = 200, filter = {}) {
    const { level, cat } = filter;
    return logBuffer
        .filter(e => (!level || e.level === level) && (!cat || e.cat === cat))
        .slice(-limit);
}

// --- Middleware לתיוג בקשות בלוג מזהה קצר ---
function requestTag() {
    return (req, res, next) => {
        const rid = randomUUID().split('-')[0];
        req.reqId = rid;
        const started = Date.now();
        res.on('finish', () => {
            info('HTTP', `${req.method} ${req.originalUrl}`, {
                code: res.statusCode,
                ms: Date.now() - started,
                by: req.get('X-Device-Id') ? 'device' : (req.user?.id ? 'user' : 'anon')
            }, rid);
        });
        next();
    };
}

module.exports = { info, warn, error, debug, getRecent, requestTag };
