const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token malformado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Payload debe contener al menos: id, usuario, rol, sucursal_id
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tiene permiso para realizar esta acción' });
    }
    next();
  };
};

// Middleware requerido: validar que sucursal_id venga en params, query o body y que coincida con la del usuario (o sea admin)
exports.requireSucursalMatchOrAdmin = (req, res, next) => {
  const sucursalId = req.body.sucursal_id || req.params.sucursal_id || req.query.sucursal_id;

  if (!sucursalId) {
    return res.status(400).json({ error: 'Sucursal_id es requerido' });
  }

  if (req.user.rol !== 'administrador' && Number(sucursalId) !== req.user.sucursal_id) {
    return res.status(403).json({ error: 'No autorizado para esta sucursal' });
  }

  next();
};

// Middleware para forzar que todas las consultas usen la sucursal del usuario
exports.enforceSucursalUsuario = (req, res, next) => {
  req.query.sucursal_id = req.user.sucursal_id.toString();
  next();
};
