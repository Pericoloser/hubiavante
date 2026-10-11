const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fichasTecnicas');
const auth = require('../middleware/auth');
const managementAccess = require('../middleware/managementAccess');

router.use(auth, managementAccess);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.post('/:id/alumnos', ctrl.addAlumno);
router.delete('/:id/alumnos/:alumnoId', ctrl.removeAlumno);
router.post('/:id/docentes', ctrl.addDocente);
router.delete('/:id/docentes/:docenteId', ctrl.removeDocente);

module.exports = router;
