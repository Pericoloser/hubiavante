const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Usuario admin
  const hash = await bcrypt.hash('iavante2024', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@iavante.es' },
    update: {},
    create: { nombre: 'Administrador', email: 'admin@iavante.es', password: hash, rol: 'admin' }
  });

  // Tarifas base
  const tarifas = [
    { nombre: 'Docencia hora', precio: 65, tipo: 'hora', categoria: 'docencia' },
    { nombre: 'Coordinación hora', precio: 80, tipo: 'hora', categoria: 'coordinacion' },
    { nombre: 'Simulación clínica hora', precio: 95, tipo: 'hora', categoria: 'simulacion' },
    { nombre: 'Material fungible sesión', precio: 120, tipo: 'sesion', categoria: 'material' },
    { nombre: 'Alquiler sala día', precio: 350, tipo: 'dia', categoria: 'instalaciones' },
    { nombre: 'Curso completo online', precio: 450, tipo: 'modulo', categoria: 'docencia' }
  ];
  for (const t of tarifas) {
    await prisma.tarifa.upsert({
      where: { id: tarifas.indexOf(t) + 1 },
      update: {},
      create: t
    });
  }

  // Cliente de ejemplo
  await prisma.cliente.upsert({
    where: { cif: 'Q1400256F' },
    update: {},
    create: {
      nombre: 'Hospital Universitario Virgen del Rocío',
      cif: 'Q1400256F',
      tipo: 'hospital',
      contacto: 'Dra. García Moreno',
      email: 'formacion@hospitalrocio.es',
      telefono: '955 01 20 00',
      ciudad: 'Sevilla',
      provincia: 'Sevilla'
    }
  });

  console.log('✅ Seed completado correctamente');
}

main().catch(console.error).finally(() => prisma.$disconnect());
