const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getByFicha = async (req, res, next) => {
  try {
    const guia = await prisma.guiaAlumno.findUnique({ where: { fichaId: Number(req.params.fichaId) } });
    if (!guia) return res.status(404).json({ error: 'Guía del alumno no encontrada' });
    res.json(guia);
  } catch (e) { next(e); }
};

const upsert = async (req, res, next) => {
  try {
    const fichaId = Number(req.params.fichaId);
    const guia = await prisma.guiaAlumno.upsert({
      where: { fichaId },
      update: req.body,
      create: { ...req.body, fichaId }
    });
    res.json(guia);
  } catch (e) { next(e); }
};

module.exports = { getByFicha, upsert };
