const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/guiasAlumno');
const auth = require('../middleware/auth');
const managementAccess = require('../middleware/managementAccess');

router.use(auth, managementAccess);
router.get('/ficha/:fichaId', ctrl.getByFicha);
router.put('/ficha/:fichaId', ctrl.upsert);

module.exports = router;
