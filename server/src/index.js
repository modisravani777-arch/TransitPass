require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

if (!process.env.JWT_SECRET) { console.error('Missing JWT_SECRET in server/.env'); process.exit(1); }

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', require('./routes'));
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(require('./middleware/error'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TransitPass API running on http://localhost:${PORT}`));
