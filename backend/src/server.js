const express = require('express');
const cors = require('cors');
require('./db/database'); // initialise DB + seed

const memberRoutes = require('./routes/members');
const eventRoutes  = require('./routes/events');
const statsRoutes  = require('./routes/stats');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/members', memberRoutes);
app.use('/api/events',  eventRoutes);
app.use('/api/stats',   statsRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Family Scheduler API running on port ${PORT}`));

module.exports = app;
