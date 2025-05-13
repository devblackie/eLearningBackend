const WebSocket = require('ws');
const Collaboration = require('../models/Collaboration');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const { contentId, userId, action, data } = JSON.parse(message);

        if (action === 'edit') {
          // Broadcast edit to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ contentId, userId, action, data }));
            }
          });

          // Save edit to MongoDB
          await Collaboration.updateOne(
            { contentId },
            { $push: { editHistory: { userId, change: data, timestamp: new Date() } } },
            { upsert: true }
          );
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });
  });

  console.log('WebSocket server running');
};

module.exports = setupWebSocket;