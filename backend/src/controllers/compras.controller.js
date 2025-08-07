const db = require('../config/db');

// Crear compra con detalles (transaction) + registro de movimiento de stock
exports.create = async (req, res) => {
  const { proveedor_id, sucursal_id, total, estado = 'pendiente', detalles } = req.body;
  const usuario_id = req.user.id;

  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: 'Detalles debe ser un arreglo con al menos un producto' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const compraResult = await client.query(
      `INSERT INTO compras (proveedor_id, sucursal_id, total, estado, usuario_id, fecha)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [proveedor_id, sucursal_id, total, estado, usuario_id]
    );

    const compra = compraResult.rows[0];

    for (const item of detalles) {
      const { producto_id, cantidad, precio_unitario, descuento = 0, impuesto = 0 } = item;

      await client.query(
        `INSERT INTO detalle_compras (compra_id, producto_id, cantidad, precio_unitario, descuento, impuesto)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [compra.id, producto_id, cantidad, precio_unitario, descuento, impuesto]
      );

      // Actualizar stock (sumar)
      await client.query(
        `UPDATE stock SET stock = stock + $1
         WHERE producto_id = $2 AND sucursal_id = $3`,
        [cantidad, producto_id, sucursal_id]
      );

      // Registrar movimiento de stock (entrada por compra)
      await client.query(
        `INSERT INTO movimientos_stock (producto_id, sucursal_id, cantidad, tipo, origen, descripcion, fecha, usuario_id)
         VALUES ($1, $2, $3, 'entrada', 'compra', $4, NOW(), $5)`,
        [producto_id, sucursal_id, cantidad, `Compra ID ${compra.id}`, usuario_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(compra);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando compra:', error);
    res.status(500).json({ error: 'Error al crear compra' });
  } finally {
    client.release();
  }
};

// Listar compras (se puede mejorar con filtros y paginación luego)
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, p.nombre AS proveedor_nombre, s.nombre AS sucursal_nombre, u.nombre AS usuario_nombre
       FROM compras c
       JOIN proveedores p ON c.proveedor_id = p.id
       JOIN sucursales s ON c.sucursal_id = s.id
       JOIN usuarios u ON c.usuario_id = u.id
       ORDER BY c.fecha DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo compras:', error);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
};

// Obtener compra por ID con detalles
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const compraResult = await db.query(
      `SELECT c.*, p.nombre AS proveedor_nombre, s.nombre AS sucursal_nombre, u.nombre AS usuario_nombre
       FROM compras c
       JOIN proveedores p ON c.proveedor_id = p.id
       JOIN sucursales s ON c.sucursal_id = s.id
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (compraResult.rows.length === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }
    const compra = compraResult.rows[0];

    const detallesResult = await db.query(
      `SELECT dc.*, pr.nombre AS producto_nombre
       FROM detalle_compras dc
       JOIN productos pr ON dc.producto_id = pr.id
       WHERE dc.compra_id = $1`,
      [id]
    );

    compra.detalles = detallesResult.rows;

    res.json(compra);
  } catch (error) {
    console.error('Error obteniendo compra:', error);
    res.status(500).json({ error: 'Error al obtener compra' });
  }
};

// Actualizar estado de compra (ej: "pendiente", "pagado", "anulado")
exports.updateEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['pendiente', 'pagado', 'anulado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const result = await db.query(
      `UPDATE compras SET estado = $1 WHERE id = $2 RETURNING *`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando estado de compra:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};
