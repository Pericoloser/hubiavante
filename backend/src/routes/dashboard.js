const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard');
const auth = require('../middleware/auth');
const managementAccess = require('../middleware/managementAccess');

router.use(auth, managementAccess);
router.get('/stats', ctrl.getStats);

module.exports = router;
