require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] connected');
    await sequelize.sync(); 
    console.log('[DB] synced');

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('[bootstrap error]', e);
    process.exit(1);
  }
})();
