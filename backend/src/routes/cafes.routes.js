const router = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const ctrl = require('../controllers/cafes.controller');
const reviewCtrl = require('../controllers/reviews.controller');

router.get('/', ctrl.list);
router.get('/:id', ctrl.detail);
router.get('/:id/menu', ctrl.menu);
router.get('/:id/reviews', reviewCtrl.listForCafe);
router.post('/:id/reviews', authRequired, reviewCtrl.create);
router.get('/:id/reports', authRequired, ctrl.reports);
router.put('/:id', authRequired, ctrl.update);

module.exports = router;