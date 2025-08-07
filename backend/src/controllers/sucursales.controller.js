const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sucursales ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar sucursales:', err);
    res.status(500).json({ error: 'Error al listar sucursales' });
  }
};

exports.create = async (req, res) => {
  const { nombre, direccion, telefono } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre es requerido' });

  try {
    const result = await db.query(
      'INSERT INTO sucursales (nombre, direccion, telefono) VALUES ($1, $2, $3) RETURNING *',
      [nombre, direccion, telefono]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear sucursal:', err);
    res.status(500).json({ error: 'Error al crear sucursal' });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, telefono } = req.body;

  try {
    const result = await db.query(
      'UPDATE sucursales SET nombre=$1, direccion=$2, telefono=$3 WHERE id=$4 RETURNING *',
      [nombre, direccion, telefono, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar sucursal:', err);
    res.status(500).json({ error: 'Error al actualizar sucursal' });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    // Podés agregar validación para no borrar si hay datos dependientes

    const result = await db.query('DELETE FROM sucursales WHERE id=$1', [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    res.json({ message: 'Sucursal eliminada' });
  } catch (err) {
    console.error('Error al eliminar sucursal:', err);
    res.status(500).json({ error: 'Error al eliminar sucursal' });
  }
};
