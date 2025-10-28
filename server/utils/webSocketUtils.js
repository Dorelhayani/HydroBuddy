/* ===== webSocketUtils.js ===== */

const WebSocket = require('ws');
let wss;

function initWebSocket(server) {
    wss = new WebSocket.Server({
        server: server,
        path: '/ws/sensors' // הנתיב לחיבור הלקוח
    });

    wss.on('connection', (ws) => {
        console.log('Client connected via WebSocket at /ws/sensors');
        ws.on('close', () => console.log('Client disconnected from /ws/sensors'));
    });
}

/**
 * משדר עדכון נתונים לכל הלקוחות המחוברים.
 * @param {object} data - נתוני החיישנים החדשים לשליחה.
 */
function broadcastSensorUpdate(data) {
    if (!wss) {
        console.error("WebSocket Server not initialized!");
        return;
    }
    const payload = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

module.exports = {
    initWebSocket,
    broadcastSensorUpdate
};