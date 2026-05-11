const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generarNumero = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.presupuesto.count({ where: { numero: { startsWith: `PRES-${year}` } } });
  return `PRES-${year}-${String(count + 1).padStart(4, '0')}`;
};

const calcularTotales = (lineas, descuento = 0, iva = 21) => {
  const subtotal = lineas.reduce((acc, l) => acc + l.total, 0);
  const descuentoImporte = subtotal * (descuento / 100);
  const base = subtotal - descuentoImporte;
  const ivaImporte = base * (iva / 100);
  const total = base + ivaImporte;
  return { subtotal, total };
};

const getAll = async (req, res, next) => {
  try {
    const { estado, clienteId, fichaId } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (clienteId) where.clienteId = Number(clienteId);
    if (fichaId) where.fichaId = Number(fichaId);
    const presupuestos = await prisma.presupuesto.findMany({
      where,
      include: {
        cliente: { select: { id: true, nombre: true } },
        ficha: { select: { id: true, codigo: true, titulo: true } }
      },
      orderBy: { creadoEn: 'desc' }
    });
    res.json(presupuestos);
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        cliente: true,
        ficha: true,
        lineas: { include: { tarifa: true }, orderBy: { orden: 'asc' } }
      }
    });
    if (!presupuesto) return res.status(404).json({ error: 'Presupuesto no encontrado' });
    res.json(presupuesto);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { lineas = [], ...data } = req.body;
    const numero = await generarNumero();
    const lineasData = lineas.map((l, idx) => ({
      descripcion: l.descripcion,
      cantidad: Number(l.cantidad),
      precioUnitario: Number(l.precioUnitario),
      descuento: Number(l.descuento || 0),
      total: Number(l.cantidad) * Number(l.precioUnitario) * (1 - (l.descuento || 0) / 100),
      tarifaId: l.tarifaId ? Number(l.tarifaId) : null,
      orden: idx
    }));
    const { subtotal, total } = calcularTotales(lineasData, data.descuento, data.iva);
    const presupuesto = await prisma.presupuesto.create({
      data: {
        ...data,
        numero,
        clienteId: Number(data.clienteId),
        fichaId: data.fichaId ? Number(data.fichaId) : null,
        subtotal,
        total,
        iva: Number(data.iva || 21),
        descuento: Number(data.descuento || 0),
        lineas: { create: lineasData }
      },
      include: { cliente: true, lineas: true }
    });
    res.status(201).json(presupuesto);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const { lineas, ...data } = req.body;
    const updateData = {
      ...data,
      clienteId: data.clienteId ? Number(data.clienteId) : undefined,
      fichaId: data.fichaId ? Number(data.fichaId) : undefined
    };
    if (lineas) {
      await prisma.lineaPresupuesto.deleteMany({ where: { presupuestoId: Number(req.params.id) } });
      const lineasData = lineas.map((l, idx) => ({
        descripcion: l.descripcion,
        cantidad: Number(l.cantidad),
        precioUnitario: Number(l.precioUnitario),
        descuento: Number(l.descuento || 0),
        total: Number(l.cantidad) * Number(l.precioUnitario) * (1 - (l.descuento || 0) / 100),
        tarifaId: l.tarifaId ? Number(l.tarifaId) : null,
        orden: idx,
        presupuestoId: Number(req.params.id)
      }));
      await prisma.lineaPresupuesto.createMany({ data: lineasData });
      const { subtotal, total } = calcularTotales(lineasData, data.descuento, data.iva);
      updateData.subtotal = subtotal;
      updateData.total = total;
    }
    const presupuesto = await prisma.presupuesto.update({
      where: { id: Number(req.params.id) },
      data: updateData,
      include: { cliente: true, lineas: true }
    });
    res.json(presupuesto);
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update };
