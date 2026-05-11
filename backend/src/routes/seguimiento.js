const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/seguimiento');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/ficha/:fichaId', ctrl.getSesionesByFicha);
router.post('/ficha/:fichaId', ctrl.createSesion);
router.put('/ficha/:fichaId/sesion/:sesionId', ctrl.updateSesion);
router.get('/ficha/:fichaId/asistencia', ctrl.getResumenAsistencia);

module.exports = router;
