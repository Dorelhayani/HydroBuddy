/* ===== webSocketUtils.js ===== */

const WebSocket = require('ws');
let wss;
let getStateFn = null;

function initWebSocket(server, getState) {
    getStateFn = getState;
    wss = new WebSocket.Server({ server, path: '/ws/sensors' });

    wss.on('connection', async (ws) => {
        console.log('Client connected via WebSocket at /ws/sensors');

        try {
            const current = await getStateFn?.();
            if (current) {
                ws.send(JSON.stringify({ type: 'SENSORS_UPDATE', payload: current }));
            }
        } catch (e) { console.error('Failed to send initial WS state:', e); }

        ws.on('close', () => console.log('Client disconnected from /ws/sensors'));
    });
}

function broadcastSensorUpdate(nextState) {
    if (!wss) return console.error("WebSocket Server not initialized!");
    const msg = JSON.stringify({ type: 'SENSORS_UPDATE', payload: nextState });
    wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
}

module.exports = { initWebSocket, broadcastSensorUpdate };
