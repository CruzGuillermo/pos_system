const db = require('../config/db');

// Listar todos los proveedores de la sucursal actual
exports.getAll = async (req, res) => {
  const { sucursal_id } = req.user; // viene del token
  try {
    const result = await db.query(
      'SELECT * FROM proveedores WHERE sucursal_id = $1 ORDER BY nombre',
      [sucursal_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo proveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

// Obtener proveedor por ID (solo si pertenece a la sucursal actual)
exports.getById = async (req, res) => {
  const { id } = req.params;
  const { sucursal_id } = req.user;
  try {
    const result = await db.query(
      'SELECT * FROM proveedores WHERE id = $1 AND sucursal_id = $2',
      [id, sucursal_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo proveedor:', error);
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

// Crear proveedor
exports.create = async (req, res) => {
  const { nombre, telefono, email, direccion, notas } = req.body;
  const { sucursal_id } = req.user;
  try {
    const result = await db.query(
      `INSERT INTO proveedores (nombre, telefono, email, direccion, notas, sucursal_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, telefono, email, direccion, notas || '', sucursal_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando proveedor:', error);
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
};

// Actualizar proveedor
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, email, direccion, notas } = req.body;
  const { sucursal_id } = req.user;
  try {
    const result = await db.query(
      `UPDATE proveedores
       SET nombre = $1, telefono = $2, email = $3, direccion = $4, notas = $5
       WHERE id = $6 AND sucursal_id = $7
       RETURNING *`,
      [nombre, telefono, email, direccion, notas || '', id, sucursal_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado o no autorizado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando proveedor:', error);
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
};

// Eliminar proveedor
exports.delete = async (req, res) => {
  const { id } = req.params;
  const { sucursal_id } = req.user;
  try {
    const result = await db.query(
      'DELETE FROM proveedores WHERE id = $1 AND sucursal_id = $2 RETURNING *',
      [id, sucursal_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado o no autorizado' });
    }
    res.json({ message: 'Proveedor eliminado' });
  } catch (error) {
    console.error('Error eliminando proveedor:', error);
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
};
