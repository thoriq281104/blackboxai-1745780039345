const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory data store for tools and borrow status
let tools = [
  { id: 1, name: 'Lathe Machine', status: 'available' },
  { id: 2, name: 'Multimeter', status: 'available' },
  { id: 3, name: 'Oscilloscope', status: 'available' }
];

let borrowLogs = [];

// Get all tools
app.get('/tools', (req, res) => {
  res.json(tools);
});

// Borrow a tool
app.post('/borrow', (req, res) => {
  const { toolId, user } = req.body;
  const tool = tools.find(t => t.id === toolId);
  if (!tool) {
    return res.status(404).json({ message: 'Tool not found' });
  }
  if (tool.status === 'borrowed') {
    return res.status(400).json({ message: 'Tool already borrowed' });
  }
  tool.status = 'borrowed';
  borrowLogs.push({ toolId, user, action: 'borrowed', timestamp: new Date() });
  // Simulate notification
  console.log(`Notification: ${user} borrowed ${tool.name}`);
  res.json({ message: `You have borrowed ${tool.name}` });
});

// Return a tool
app.post('/return', (req, res) => {
  const { toolId, user } = req.body;
  const tool = tools.find(t => t.id === toolId);
  if (!tool) {
    return res.status(404).json({ message: 'Tool not found' });
  }
  if (tool.status === 'available') {
    return res.status(400).json({ message: 'Tool is not borrowed' });
  }
  tool.status = 'available';
  borrowLogs.push({ toolId, user, action: 'returned', timestamp: new Date() });
  // Simulate notification
  console.log(`Notification: ${user} returned ${tool.name}`);
  res.json({ message: `You have returned ${tool.name}` });
});

// Get borrow logs
app.get('/logs', (req, res) => {
  res.json(borrowLogs);
});

app.listen(port, () => {
  console.log(`Smart Tool Tracking backend listening at http://localhost:${port}`);
});
