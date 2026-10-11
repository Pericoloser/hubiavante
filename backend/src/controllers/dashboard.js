const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStats = async (req, res, next) => {
  try {
    const [
      totalClientes,
      totalAlumnos,
      totalDocentes,
      totalFichas,
      fichasPorEstado,
      presupuestosPorEstado,
      ultimasFichas
    ] = await Promise.all([
      prisma.cliente.count({ where: { activo: true } }),
      prisma.alumno.count({ where: { activo: true } }),
      prisma.docente.count({ where: { activo: true } }),
      prisma.fichaTecnica.count(),
      prisma.fichaTecnica.groupBy({ by: ['estado'], _count: true }),
      prisma.presupuesto.groupBy({ by: ['estado'], _count: true }),
      prisma.fichaTecnica.findMany({
        take: 5,
        orderBy: { creadoEn: 'desc' },
        select: { id: true, codigo: true, titulo: true, estado: true, creadoEn: true, cliente: { select: { nombre: true } } }
      })
    ]);

    res.json({
      totales: { clientes: totalClientes, alumnos: totalAlumnos, docentes: totalDocentes, fichas: totalFichas },
      fichasPorEstado,
      presupuestosPorEstado,
      ultimasFichas
    });
  } catch (e) { next(e); }
};

module.exports = { getStats };
