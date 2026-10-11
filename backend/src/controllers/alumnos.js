const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res, next) => {
  try {
    const { search, categoria } = req.query;
    const where = { activo: true };
    if (search) where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { apellidos: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
    if (categoria) where.categoriaProfesional = categoria;
    const alumnos = await prisma.alumno.findMany({ where, orderBy: [{ apellidos: 'asc' }, { nombre: 'asc' }] });
    res.json(alumnos);
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const alumno = await prisma.alumno.findUnique({
      where: { id: Number(req.params.id) },
      include: { fichas: { include: { ficha: { select: { id: true, codigo: true, titulo: true, estado: true } } } } }
    });
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });
    res.json(alumno);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const alumno = await prisma.alumno.create({ data: req.body });
    res.status(201).json(alumno);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const alumno = await prisma.alumno.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(alumno);
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await prisma.alumno.update({ where: { id: Number(req.params.id) }, data: { activo: false } });
    res.json({ message: 'Alumno desactivado' });
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove };
