const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res, next) => {
  try {
    const { search, categoria } = req.query;
    const where = { activo: true };
    if (search) where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { apellidos: { contains: search, mode: 'insensitive' } },
      { especialidad: { contains: search, mode: 'insensitive' } }
    ];
    if (categoria) where.categoria = categoria;
    const docentes = await prisma.docente.findMany({
      where,
      include: { tarifa: true },
      orderBy: [{ apellidos: 'asc' }, { nombre: 'asc' }]
    });
    res.json(docentes);
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const docente = await prisma.docente.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        tarifa: true,
        fichas: { include: { ficha: { select: { id: true, codigo: true, titulo: true, estado: true } } } }
      }
    });
    if (!docente) return res.status(404).json({ error: 'Docente no encontrado' });
    res.json(docente);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { tarifaId, ...rest } = req.body;
    const docente = await prisma.docente.create({
      data: { ...rest, ...(tarifaId && { tarifa: { connect: { id: tarifaId } } }) },
      include: { tarifa: true }
    });
    res.status(201).json(docente);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const { tarifaId, ...rest } = req.body;
    const data = { ...rest };
    if (tarifaId) data.tarifa = { connect: { id: tarifaId } };
    const docente = await prisma.docente.update({
      where: { id: Number(req.params.id) },
      data,
      include: { tarifa: true }
    });
    res.json(docente);
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await prisma.docente.update({ where: { id: Number(req.params.id) }, data: { activo: false } });
    res.json({ message: 'Docente desactivado' });
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove };
