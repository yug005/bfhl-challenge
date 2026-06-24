require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bfhlRoutes = require('./routes/bfhl.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Routes ──
app.use('/bfhl', bfhlRoutes);

// ── Global Error Handler ──
app.use(errorHandler);

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`BFHL server running on port ${PORT}`);
});

module.exports = app;
