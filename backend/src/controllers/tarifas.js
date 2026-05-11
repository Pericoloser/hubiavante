const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res, next) => {
  try {
    const { categoria, tipo } = req.query;
    const where = { activo: true };
    if (categoria) where.categoria = categoria;
    if (tipo) where.tipo = tipo;
    const tarifas = await prisma.tarifa.findMany({ where, orderBy: { nombre: 'asc' } });
    res.json(tarifas);
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const tarifa = await prisma.tarifa.findUnique({ where: { id: Number(req.params.id) } });
    if (!tarifa) return res.status(404).json({ error: 'Tarifa no encontrada' });
    res.json(tarifa);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const tarifa = await prisma.tarifa.create({ data: req.body });
    res.status(201).json(tarifa);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const tarifa = await prisma.tarifa.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(tarifa);
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await prisma.tarifa.update({ where: { id: Number(req.params.id) }, data: { activo: false } });
    res.json({ message: 'Tarifa desactivada' });
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove };
