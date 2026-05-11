const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generarCodigo = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.fichaTecnica.count({ where: { codigo: { startsWith: `FT-${year}` } } });
  return `FT-${year}-${String(count + 1).padStart(4, '0')}`;
};

const getAll = async (req, res, next) => {
  try {
    const { search, estado, clienteId } = req.query;
    const where = {};
    if (search) where.OR = [
      { titulo: { contains: search, mode: 'insensitive' } },
      { codigo: { contains: search, mode: 'insensitive' } }
    ];
    if (estado) where.estado = estado;
    if (clienteId) where.clienteId = Number(clienteId);
    const fichas = await prisma.fichaTecnica.findMany({
      where,
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { creadoEn: 'desc' }
    });
    res.json(fichas);
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const ficha = await prisma.fichaTecnica.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        cliente: true,
        alumnos: { include: { alumno: true } },
        docentes: { include: { docente: { include: { tarifa: true } } } },
        presupuestos: true,
        propuestas: true,
        guiaAlumno: true,
        guiaDocente: true,
        sesiones: { include: { docente: true }, orderBy: { numero: 'asc' } },
        informeFinal: true
      }
    });
    if (!ficha) return res.status(404).json({ error: 'Ficha técnica no encontrada' });
    res.json(ficha);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { alumnoIds, docenteIds, ...data } = req.body;
    const codigo = await generarCodigo();
    const ficha = await prisma.fichaTecnica.create({
      data: {
        ...data,
        codigo,
        clienteId: Number(data.clienteId),
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
        alumnos: alumnoIds ? { create: alumnoIds.map(id => ({ alumnoId: id })) } : undefined,
        docentes: docenteIds ? { create: docenteIds.map(id => ({ docenteId: id })) } : undefined
      },
      include: { cliente: true }
    });
    res.status(201).json(ficha);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const { alumnoIds, docenteIds, ...data } = req.body;
    const ficha = await prisma.fichaTecnica.update({
      where: { id: Number(req.params.id) },
      data: {
        ...data,
        clienteId: data.clienteId ? Number(data.clienteId) : undefined,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined
      },
      include: { cliente: true }
    });
    res.json(ficha);
  } catch (e) { next(e); }
};

const addAlumno = async (req, res, next) => {
  try {
    const { alumnoId, estado } = req.body;
    const rel = await prisma.alumnoFicha.upsert({
      where: { alumnoId_fichaId: { alumnoId: Number(alumnoId), fichaId: Number(req.params.id) } },
      update: { estado },
      create: { alumnoId: Number(alumnoId), fichaId: Number(req.params.id), estado }
    });
    res.json(rel);
  } catch (e) { next(e); }
};

const removeAlumno = async (req, res, next) => {
  try {
    await prisma.alumnoFicha.delete({
      where: { alumnoId_fichaId: { alumnoId: Number(req.params.alumnoId), fichaId: Number(req.params.id) } }
    });
    res.json({ message: 'Alumno eliminado de la ficha' });
  } catch (e) { next(e); }
};

const addDocente = async (req, res, next) => {
  try {
    const { docenteId, rol } = req.body;
    const rel = await prisma.docenteFicha.upsert({
      where: { docenteId_fichaId: { docenteId: Number(docenteId), fichaId: Number(req.params.id) } },
      update: { rol },
      create: { docenteId: Number(docenteId), fichaId: Number(req.params.id), rol }
    });
    res.json(rel);
  } catch (e) { next(e); }
};

const removeDocente = async (req, res, next) => {
  try {
    await prisma.docenteFicha.delete({
      where: { docenteId_fichaId: { docenteId: Number(req.params.docenteId), fichaId: Number(req.params.id) } }
    });
    res.json({ message: 'Docente eliminado de la ficha' });
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, addAlumno, removeAlumno, addDocente, removeDocente };
