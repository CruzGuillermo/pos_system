// src/controllers/gastos.controller.js
const db = require('../config/db');

// Crear gasto y movimiento asociado
exports.create = async (req, res) => {
  const { categoria, descripcion, monto } = req.body;
  const { id: usuario_id, sucursal_id } = req.user;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Verificar caja abierta del usuario
    const cajaResult = await client.query(`
      SELECT * FROM cajas
      WHERE usuario_id = $1 AND sucursal_id = $2 AND estado = 'abierta'
      ORDER BY fecha_apertura DESC LIMIT 1
    `, [usuario_id, sucursal_id]);

    if (cajaResult.rows.length === 0) {
      throw new Error('No hay una caja abierta para este usuario en esta sucursal.');
    }

    const caja = cajaResult.rows[0];

    // Insertar gasto
    const gastoResult = await client.query(`
      INSERT INTO gastos (categoria, descripcion, monto, fecha, usuario_id, sucursal_id, caja_id)
      VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6)
      RETURNING *
    `, [categoria, descripcion, monto, usuario_id, sucursal_id, caja.id]);

    const gasto = gastoResult.rows[0];

    // Insertar movimiento de caja (egreso)
    await client.query(`
      INSERT INTO movimientos_caja (tipo, monto, descripcion, fecha, usuario_id, caja_id)
      VALUES ('egreso', $1, $2, NOW(), $3, $4)
    `, [monto, `Gasto: ${categoria} - ${descripcion}`, usuario_id, caja.id]);

    await client.query('COMMIT');
    res.status(201).json({ mensaje: 'Gasto registrado con éxito', gasto });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar gasto:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// Obtener gastos por sucursal
exports.getBySucursal = async (req, res) => {
  const { sucursal_id } = req.params;
  try {
    const result = await db.query(`
      SELECT g.*, u.nombre AS usuario
      FROM gastos g
      JOIN usuarios u ON g.usuario_id = u.id
      WHERE g.sucursal_id = $1
      ORDER BY g.fecha DESC
    `, [sucursal_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
};

// Editar gasto si la caja está abierta
exports.update = async (req, res) => {
  const { id } = req.params;
  const { categoria, descripcion, monto } = req.body;
  const { id: usuario_id } = req.user;

  try {
    const cajaCheck = await db.query(`
      SELECT c.estado FROM gastos g
      JOIN cajas c ON g.caja_id = c.id
      WHERE g.id = $1 AND c.usuario_id = $2
    `, [id, usuario_id]);

    if (cajaCheck.rows.length === 0 || cajaCheck.rows[0].estado !== 'abierta') {
      return res.status(400).json({ error: 'No se puede editar este gasto: la caja está cerrada o no pertenece al usuario.' });
    }

    const result = await db.query(`
      UPDATE gastos
      SET categoria = $1, descripcion = $2, monto = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [categoria, descripcion, monto, id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al editar gasto:', error);
    res.status(500).json({ error: 'Error al editar gasto' });
  }
};

// Eliminar gasto si la caja está abierta
exports.remove = async (req, res) => {
  const { id } = req.params;
  const { id: usuario_id } = req.user;

  try {
    const cajaCheck = await db.query(`
      SELECT c.estado FROM gastos g
      JOIN cajas c ON g.caja_id = c.id
      WHERE g.id = $1 AND c.usuario_id = $2
    `, [id, usuario_id]);

    if (cajaCheck.rows.length === 0 || cajaCheck.rows[0].estado !== 'abierta') {
      return res.status(400).json({ error: 'No se puede eliminar este gasto: la caja está cerrada o no pertenece al usuario.' });
    }

    await db.query('DELETE FROM gastos WHERE id = $1', [id]);
    res.json({ mensaje: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
};
