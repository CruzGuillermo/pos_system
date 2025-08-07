const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM unidades ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener unidades' });
  }
};

exports.create = async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO unidades (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear unidad', detalle: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const result = await db.query(
      'UPDATE unidades SET nombre = $1 WHERE id = $2 RETURNING *',
      [nombre, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar unidad' });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM unidades WHERE id = $1', [id]);
    res.json({ mensaje: 'Unidad eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar unidad' });
  }
};
