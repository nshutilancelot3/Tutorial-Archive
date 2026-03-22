require('dotenv').config();

const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ─── SERVE FRONTEND ─────────────────────────────────────── */
app.use(express.static(path.join(__dirname)));

/* ─── CATCH-ALL — serve index.html ──────────────────────── */
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ─── START ──────────────────────────────────────────────── */
app.listen(PORT, function () {
  console.log('Server running at http://localhost:' + PORT);
});
