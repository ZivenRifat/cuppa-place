// src/routes/mitra.routes.js
const express = require('express');
const router = express.Router();

const { registerMitra, getMitraDashboard } = require('../controllers/mitra.controller');
const { authRequired } = require('../middlewares/auth');
router.post('/register', registerMitra);
router.get('/dashboard', authRequired, getMitraDashboard);

module.exports = router;
