const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const clientesRouter = require('./routes/clientes');
const tarifasRouter = require('./routes/tarifas');
const alumnosRouter = require('./routes/alumnos');
const docentesRouter = require('./routes/docentes');
const fichasRouter = require('./routes/fichasTecnicas');
const presupuestosRouter = require('./routes/presupuestos');
const propuestasRouter = require('./routes/propuestasComerciales');
const guiasAlumnoRouter = require('./routes/guiasAlumno');
const guiasDocenteRouter = require('./routes/guiasDocente');
const seguimientoRouter = require('./routes/seguimiento');
const informesRouter = require('./routes/informesFinal');
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/tarifas', tarifasRouter);
app.use('/api/alumnos', alumnosRouter);
app.use('/api/docentes', docentesRouter);
app.use('/api/fichas', fichasRouter);
app.use('/api/presupuestos', presupuestosRouter);
app.use('/api/propuestas', propuestasRouter);
app.use('/api/guias-alumno', guiasAlumnoRouter);
app.use('/api/guias-docente', guiasDocenteRouter);
app.use('/api/seguimiento', seguimientoRouter);
app.use('/api/informes', informesRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;
