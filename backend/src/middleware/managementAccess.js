// HUBIAVANTE es una aplicación interna de una única organización.
// Los docentes no acceden a gestión hasta disponer de permisos por curso.
function managementAccess(req, res, next) {
  if (!['admin', 'gestor'].includes(req.user?.rol)) {
    return res.status(403).json({ error: 'Se requiere perfil de administración o gestión' });
  }
  if (req.method === 'DELETE' && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo administración puede eliminar o desactivar registros' });
  }
  next();
}
module.exports = managementAccess;
