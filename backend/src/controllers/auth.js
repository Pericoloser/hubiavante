const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const { getJwtSecret } = require('../config');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password || password.length > 1024) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }
    const usuario = await prisma.usuario.findUnique({ where: { email: email.trim() } });
    if (!usuario || !usuario.activo) return res.status(401).json({ error: 'Credenciales inválidas' });
    const valid = await bcrypt.compare(password, usuario.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ id: usuario.id, email: usuario.email, rol: usuario.rol }, getJwtSecret(), { expiresIn: '8h', algorithm: 'HS256', issuer: 'hubiavante', audience: 'hubiavante-web' });
    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
  } catch (e) { next(e); }
};

const me = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { id: true, nombre: true, email: true, rol: true }
    });
    res.json(usuario);
  } catch (e) { next(e); }
};

module.exports = { login, me };
