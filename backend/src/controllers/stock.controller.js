const db = require('../config/db');

// Listar stock de la sucursal del usuario
exports.getBySucursal = async (req, res) => {
  const sucursal_id = req.user.sucursal_id;
  try {
    const result = await db.query(
      `SELECT s.id, s.producto_id, p.nombre AS producto, s.stock
       FROM stock s
       JOIN productos p ON s.producto_id = p.id
       WHERE s.sucursal_id = $1`,
      [sucursal_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener stock:', err);
    res.status(500).json({ error: 'Error al obtener stock' });
  }
};

exports.create = async (req, res) => {
  const { producto_id, stock } = req.body;
  const sucursal_id = req.user.sucursal_id;

  try {
    // Verificamos si ya existe
    const existe = await db.query(
      'SELECT id FROM stock WHERE producto_id = $1 AND sucursal_id = $2',
      [producto_id, sucursal_id]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe stock para ese producto en esta sucursal' });
    }

    // Insertamos si no existe
    const result = await db.query(
      'INSERT INTO stock (producto_id, sucursal_id, stock) VALUES ($1, $2, $3) RETURNING *',
      [producto_id, sucursal_id, stock]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear stock:', err);
    res.status(500).json({ error: err.message });
  }
};


exports.update = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  const sucursal_id = req.user.sucursal_id;

  try {
    const result = await db.query(
      `UPDATE stock SET stock = $1 
       WHERE id = $2 AND sucursal_id = $3
       RETURNING *`,
      [stock, id, sucursal_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Stock no encontrado o no autorizado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar stock:', err);
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const sucursal_id = req.user.sucursal_id;

  try {
    const result = await db.query(
      'DELETE FROM stock WHERE id = $1 AND sucursal_id = $2',
      [id, sucursal_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Stock no encontrado o no autorizado' });
    }
    res.json({ message: 'Stock eliminado' });
  } catch (err) {
    console.error('Error al eliminar stock:', err);
    res.status(500).json({ error: 'Error al eliminar stock' });
  }
};

exports.getStockPuntual = async (req, res) => {
  const { producto_id } = req.params;
  const sucursal_id = req.user.sucursal_id;

  try {
    const result = await db.query(
      `SELECT stock FROM stock WHERE producto_id = $1 AND sucursal_id = $2`,
      [producto_id, sucursal_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'No hay stock para este producto en esta sucursal' });
    }

    res.json({ producto_id, sucursal_id, stock: result.rows[0].stock });
  } catch (err) {
    console.error('Error al consultar stock puntual:', err);
    res.status(500).json({ error: 'Error al consultar stock' });
  }
};

exports.getStockBajo = async (req, res) => {
  const sucursal_id = req.user.sucursal_id;
  try {
    const result = await db.query(
      `SELECT s.producto_id, p.nombre, s.stock
       FROM stock s
       JOIN productos p ON s.producto_id = p.id
       WHERE s.sucursal_id = $1 AND s.stock < 5`,
      [sucursal_id]
    );
    if (result.rows.length === 0) {
      return res.json({ mensaje: 'No hay productos con stock bajo' });
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener stock bajo:', err);
    res.status(500).json({ error: 'Error al obtener stock bajo' });
  }
};

exports.ajustarStockManual = async (req, res) => {
  const { producto_id, cantidad, tipo, descripcion = '' } = req.body;
  const usuario_id = req.user.id;
  const sucursal_id = req.user.sucursal_id;

  if (!['entrada', 'salida'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo debe ser "entrada" o "salida"' });
  }
  if (!producto_id || !cantidad || cantidad <= 0) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const stockRes = await client.query(
      'SELECT stock FROM stock WHERE producto_id = $1 AND sucursal_id = $2 FOR UPDATE',
      [producto_id, sucursal_id]
    );

    if (stockRes.rows.length === 0) {
      return res.status(404).json({ error: 'Stock no encontrado para ese producto y sucursal' });
    }

    let stockActual = stockRes.rows[0].stock;

    if (tipo === 'salida' && stockActual < cantidad) {
      return res.status(400).json({ error: 'Stock insuficiente para salida' });
    }

    stockActual = tipo === 'entrada' ? stockActual + cantidad : stockActual - cantidad;

    await client.query(
      'UPDATE stock SET stock = $1 WHERE producto_id = $2 AND sucursal_id = $3',
      [stockActual, producto_id, sucursal_id]
    );

    await client.query(
      `INSERT INTO movimientos_stock (producto_id, sucursal_id, usuario_id, tipo, cantidad, descripcion, fecha)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [producto_id, sucursal_id, usuario_id, tipo, cantidad, descripcion]
    );

    await client.query('COMMIT');
    res.json({ message: 'Ajuste de stock registrado', stock_actual: stockActual });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error ajustando stock manual:', err);
    res.status(500).json({ error: 'Error al ajustar stock' });
  } finally {
    client.release();
  }
};
