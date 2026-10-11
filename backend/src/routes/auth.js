const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth');
const auth = require('../middleware/auth');

router.post('/login', ctrl.login);
router.get('/me', auth, ctrl.me);

module.exports = router;
