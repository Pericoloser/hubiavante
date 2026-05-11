const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/informesFinal');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getAll);
router.get('/ficha/:fichaId', ctrl.getByFicha);
router.put('/ficha/:fichaId', ctrl.upsert);

module.exports = router;
