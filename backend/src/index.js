require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { getPool } = require('./utils/db');

const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');
const mitraRoutes = require('./routes/mitra');
const cafesRoutes = require('./routes/cafes');
const menusRoutes = require('./routes/menus');
const uploadsRoutes = require('./routes/uploads');
const favoritesRoutes = require('./routes/favorites');

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: false,
}));
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/api', authRoutes);
app.use('/api', otpRoutes);
app.use('/api', mitraRoutes);
app.use('/api', cafesRoutes);
app.use('/api', menusRoutes);
app.use('/api', uploadsRoutes);
app.use('/api', favoritesRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

getPool().then(() => {
  app.listen(PORT, () => {
    console.log(`Cuppa backend running at http://localhost:${PORT}`);
  });
}).catch((e) => {
  console.error('DB connection failed:', e);
  process.exit(1);
});
