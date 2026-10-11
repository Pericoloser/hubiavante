const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getByFicha = async (req, res, next) => {
  try {
    const informe = await prisma.informeFinal.findUnique({
      where: { fichaId: Number(req.params.fichaId) },
      include: { ficha: { include: { cliente: true, sesiones: true, alumnos: true } } }
    });
    if (!informe) return res.status(404).json({ error: 'Informe final no encontrado' });
    res.json(informe);
  } catch (e) { next(e); }
};

const upsert = async (req, res, next) => {
  try {
    const fichaId = Number(req.params.fichaId);
    const informe = await prisma.informeFinal.upsert({
      where: { fichaId },
      update: req.body,
      create: { ...req.body, fichaId }
    });
    res.json(informe);
  } catch (e) { next(e); }
};

const getAll = async (req, res, next) => {
  try {
    const { estado } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    const informes = await prisma.informeFinal.findMany({
      where,
      include: {
        ficha: { include: { cliente: { select: { id: true, nombre: true } } } }
      },
      orderBy: { creadoEn: 'desc' }
    });
    res.json(informes);
  } catch (e) { next(e); }
};

module.exports = { getByFicha, upsert, getAll };
