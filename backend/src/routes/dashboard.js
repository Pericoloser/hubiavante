const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/stats', ctrl.getStats);

module.exports = router;
