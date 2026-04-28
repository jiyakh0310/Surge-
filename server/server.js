// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Route imports
const eventsRouter = require('./routes/events');
const clubsRouter = require('./routes/clubs');
const venuesRouter = require('./routes/venues');
const participantsRouter = require('./routes/participants');
const dashboardRouter = require('./routes/dashboard');
const reportsRouter = require('./routes/reports');
const authRouter = require('./routes/auth');
const sponsorsRouter = require('./routes/sponsors');
const budgetRouter = require('./routes/budget');
const goodiesRouter = require('./routes/goodies');
const expensesRouter = require('./routes/expenses');

app.use('/api/events', eventsRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/venues', venuesRouter);
app.use('/api/participants', participantsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/auth', authRouter);
app.use('/api/sponsors', sponsorsRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/goodies', goodiesRouter);
app.use('/api/expenses', expensesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
