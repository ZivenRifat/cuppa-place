const router = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const ctrl = require('../controllers/reviews.controller');

router.get('/cafe/:id', ctrl.listForCafe);
router.post('/cafe/:id', authRequired, ctrl.create);

// User reviews (for profile page)
router.get('/users/me/reviews', authRequired, ctrl.listByUser);

// Live comment routes (without rating)
router.get('/cafe/:id/live-comments', ctrl.listLiveComments);
router.post('/cafe/:id/live-comment', authRequired, ctrl.createLiveComment);

module.exports = router;
