const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/seguimiento');
const auth = require('../middleware/auth');
const managementAccess = require('../middleware/managementAccess');

router.use(auth, managementAccess);
router.get('/ficha/:fichaId', ctrl.getSesionesByFicha);
router.post('/ficha/:fichaId', ctrl.createSesion);
router.put('/ficha/:fichaId/sesion/:sesionId', ctrl.updateSesion);
router.get('/ficha/:fichaId/asistencia', ctrl.getResumenAsistencia);

module.exports = router;
