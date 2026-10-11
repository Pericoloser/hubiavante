const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generarNumero = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.propuestaComercial.count({ where: { numero: { startsWith: `PC-${year}` } } });
  return `PC-${year}-${String(count + 1).padStart(4, '0')}`;
};

const getAll = async (req, res, next) => {
  try {
    const { estado, clienteId, fichaId } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (clienteId) where.clienteId = Number(clienteId);
    if (fichaId) where.fichaId = Number(fichaId);
    const propuestas = await prisma.propuestaComercial.findMany({
      where,
      include: {
        cliente: { select: { id: true, nombre: true } },
        ficha: { select: { id: true, codigo: true, titulo: true } }
      },
      orderBy: { creadoEn: 'desc' }
    });
    res.json(propuestas);
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const propuesta = await prisma.propuestaComercial.findUnique({
      where: { id: Number(req.params.id) },
      include: { cliente: true, ficha: true }
    });
    if (!propuesta) return res.status(404).json({ error: 'Propuesta no encontrada' });
    res.json(propuesta);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const numero = await generarNumero();
    const propuesta = await prisma.propuestaComercial.create({
      data: {
        ...req.body,
        numero,
        clienteId: Number(req.body.clienteId),
        fichaId: req.body.fichaId ? Number(req.body.fichaId) : null
      },
      include: { cliente: true }
    });
    res.status(201).json(propuesta);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const propuesta = await prisma.propuestaComercial.update({
      where: { id: Number(req.params.id) },
      data: {
        ...req.body,
        clienteId: req.body.clienteId ? Number(req.body.clienteId) : undefined,
        fichaId: req.body.fichaId ? Number(req.body.fichaId) : undefined
      },
      include: { cliente: true }
    });
    res.json(propuesta);
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update };
