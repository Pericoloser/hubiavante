const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { getJwtSecret } = require('../config');
const prisma = new PrismaClient();

function createAuthMiddleware(client = prisma) {
  return async (req, res, next) => {
    const match = /^Bearer ([^ ]+)$/i.exec(req.headers.authorization || '');
    if (!match) return res.status(401).json({ error: 'Token requerido' });
    let payload;
    try {
      payload = jwt.verify(match[1], getJwtSecret(), {
        algorithms: ['HS256'], issuer: 'hubiavante', audience: 'hubiavante-web'
      });
      if (!Number.isInteger(payload.id) || payload.id < 1) throw new Error('Identidad inválida');
    } catch {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    try {
      const usuario = await client.usuario.findUnique({
        where: { id: payload.id },
        select: { id: true, email: true, rol: true, activo: true }
      });
      if (!usuario || !usuario.activo) return res.status(401).json({ error: 'Usuario inactivo o inexistente' });
      req.user = usuario;
      next();
    } catch (error) { next(error); }
  };
}
module.exports = createAuthMiddleware();
module.exports.createAuthMiddleware = createAuthMiddleware;
