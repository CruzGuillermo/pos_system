const db = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar categorías', detalle: err.message });
  }
};

exports.crear = async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await db.query('INSERT INTO categorias (nombre) VALUES ($1) RETURNING *', [nombre]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría', detalle: err.message });
  }
};

exports.editar = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const result = await db.query('UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *', [nombre, id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al editar categoría', detalle: err.message });
  }
};

exports.eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM categorias WHERE id = $1', [id]);
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría', detalle: err.message });
  }
};
