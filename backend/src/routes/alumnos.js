const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alumnos');
const auth = require('../middleware/auth');
const managementAccess = require('../middleware/managementAccess');

router.use(auth, managementAccess);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
