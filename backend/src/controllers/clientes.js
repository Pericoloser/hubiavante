const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res, next) => {
  try {
    const { search, tipo, activo } = req.query;
    const where = {};
    if (search) where.OR = [{ nombre: { contains: search, mode: 'insensitive' } }, { cif: { contains: search, mode: 'insensitive' } }];
    if (tipo) where.tipo = tipo;
    if (activo !== undefined) where.activo = activo === 'true';
    const clientes = await prisma.cliente.findMany({ where, orderBy: { nombre: 'asc' } });
    res.json(clientes);
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(req.params.id) },
      include: { fichasTecnicas: { select: { id: true, codigo: true, titulo: true, estado: true } } }
    });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const cliente = await prisma.cliente.create({ data: req.body });
    res.status(201).json(cliente);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const cliente = await prisma.cliente.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(cliente);
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await prisma.cliente.update({ where: { id: Number(req.params.id) }, data: { activo: false } });
    res.json({ message: 'Cliente desactivado' });
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove };
