const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const mitraRoutes = require('./routes/mitra.routes');
const cafeRoutes = require('./routes/cafes.routes');
const menuRoutes = require('./routes/menus.routes');
const userRoutes = require('./routes/users.routes');
const reviewRoutes = require('./routes/reviews.routes');
const uploadRoutes = require('./routes/uploads.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve('uploads'), { maxAge: '7d' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/mitra', mitraRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/uploads', uploadRoutes);
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error('[error]', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
});

module.exports = app;
