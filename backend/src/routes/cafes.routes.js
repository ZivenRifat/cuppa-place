const router = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const ctrl = require('../controllers/cafes.controller');

router.get('/', ctrl.list);
router.get('/:id', ctrl.detail);
router.get('/:id/menu', ctrl.menu);
router.put('/:id', authRequired, ctrl.update);

module.exports = router;