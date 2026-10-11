const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSesionesByFicha = async (req, res, next) => {
  try {
    const sesiones = await prisma.sesion.findMany({
      where: { fichaId: Number(req.params.fichaId) },
      include: {
        docente: { select: { id: true, nombre: true, apellidos: true } },
        asistencias: { include: { alumno: { select: { id: true, nombre: true, apellidos: true } } } }
      },
      orderBy: { numero: 'asc' }
    });
    res.json(sesiones);
  } catch (e) { next(e); }
};

const createSesion = async (req, res, next) => {
  try {
    const fichaId = Number(req.params.fichaId);
    const lastSesion = await prisma.sesion.findFirst({ where: { fichaId }, orderBy: { numero: 'desc' } });
    const numero = (lastSesion?.numero || 0) + 1;
    const { alumnoIds, ...data } = req.body;
    const sesion = await prisma.sesion.create({
      data: {
        ...data,
        fichaId,
        numero,
        fecha: new Date(data.fecha),
        docenteId: data.docenteId ? Number(data.docenteId) : null,
        asistencias: alumnoIds ? {
          create: alumnoIds.map(id => ({ alumnoId: Number(id), asistio: false }))
        } : undefined
      },
      include: { docente: true, asistencias: { include: { alumno: true } } }
    });
    res.status(201).json(sesion);
  } catch (e) { next(e); }
};

const updateSesion = async (req, res, next) => {
  try {
    const { asistencias, ...data } = req.body;
    const sesion = await prisma.sesion.update({
      where: { id: Number(req.params.sesionId) },
      data: {
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
        docenteId: data.docenteId ? Number(data.docenteId) : undefined
      }
    });
    if (asistencias) {
      for (const a of asistencias) {
        await prisma.asistencia.upsert({
          where: { sesionId_alumnoId: { sesionId: sesion.id, alumnoId: Number(a.alumnoId) } },
          update: { asistio: a.asistio, justificada: a.justificada, observacion: a.observacion },
          create: { sesionId: sesion.id, alumnoId: Number(a.alumnoId), asistio: a.asistio, justificada: a.justificada, observacion: a.observacion }
        });
      }
    }
    const updatedSesion = await prisma.sesion.findUnique({
      where: { id: sesion.id },
      include: { docente: true, asistencias: { include: { alumno: true } } }
    });
    res.json(updatedSesion);
  } catch (e) { next(e); }
};

const getResumenAsistencia = async (req, res, next) => {
  try {
    const fichaId = Number(req.params.fichaId);
    const sesiones = await prisma.sesion.findMany({ where: { fichaId }, select: { id: true } });
    const sesionIds = sesiones.map(s => s.id);
    const asistencias = await prisma.asistencia.groupBy({
      by: ['alumnoId'],
      where: { sesionId: { in: sesionIds } },
      _count: { asistio: true },
      _sum: { asistio: true }
    });
    res.json({ totalSesiones: sesiones.length, asistenciasPorAlumno: asistencias });
  } catch (e) { next(e); }
};

module.exports = { getSesionesByFicha, createSesion, updateSesion, getResumenAsistencia };
