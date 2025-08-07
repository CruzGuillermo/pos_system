const db = require('../config/db');
const { insertarPago, obtenerPagosPorVenta } = require("../models/pagos_venta.model");

exports.create = async (req, res) => {
  const { codigo, total, cliente_id = null, caja_id, detalles, pagos } = req.body;
  const usuario_id = req.user.id;
  const sucursal_id = req.user.sucursal_id;

  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: 'Detalles debe ser un arreglo con al menos un producto' });
  }

  if (!Array.isArray(pagos) || pagos.length === 0) {
    return res.status(400).json({ error: 'Debe incluir al menos una forma de pago' });
  }

  const totalPagado = pagos.reduce((acc, p) => acc + Number(p.monto), 0);
  if (Number(totalPagado.toFixed(2)) !== Number(total.toFixed(2))) {
    return res.status(400).json({ error: 'La suma de los pagos no coincide con el total de la venta' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Obtener configuración sistema (flags)
    const configRes = await client.query('SELECT permitir_venta_sin_stock, permitir_venta_sin_caja FROM configuracion_sistema WHERE id = 1');
    if (configRes.rowCount === 0) {
      throw new Error('Configuración del sistema no encontrada');
    }
    const { permitir_venta_sin_stock, permitir_venta_sin_caja } = configRes.rows[0];

    // Verificar caja abierta
    const cajaRes = await client.query(
      'SELECT * FROM cajas WHERE id = $1 AND fecha_cierre IS NULL',
      [caja_id]
    );
    if (cajaRes.rowCount === 0 && !permitir_venta_sin_caja) {
      throw new Error('La caja no existe o está cerrada');
    }

    // Insertar venta principal
    const ventaResult = await client.query(`
      INSERT INTO ventas (codigo, total, cliente_id, caja_id, sucursal_id, usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [codigo, total, cliente_id, caja_id, sucursal_id, usuario_id]
    );
    const venta = ventaResult.rows[0];

    // Insertar detalle productos y actualizar stock
    for (const item of detalles) {
      const { producto_id, cantidad, precio_unitario } = item;

      const stockRes = await client.query(`
        SELECT stock FROM stock WHERE producto_id = $1 AND sucursal_id = $2 FOR UPDATE`,
        [producto_id, sucursal_id]);

      if (stockRes.rows.length === 0) {
        throw new Error(`Producto ID ${producto_id} sin stock en sucursal`);
      }

      const stockActual = stockRes.rows[0].stock;
      if (stockActual < cantidad && !permitir_venta_sin_stock) {
        throw new Error(`Stock insuficiente para el producto ID ${producto_id}`);
      }

      await client.query(`
        INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4)`,
        [venta.id, producto_id, cantidad, precio_unitario]);

      // Solo descontar stock y registrar movimiento si hay suficiente stock
      if (stockActual >= cantidad) {
        await client.query(`
          UPDATE stock SET stock = stock - $1
          WHERE producto_id = $2 AND sucursal_id = $3`,
          [cantidad, producto_id, sucursal_id]);

        await client.query(`
          INSERT INTO movimientos_stock 
          (producto_id, sucursal_id, tipo, cantidad, origen, descripcion, fecha, usuario_id)
          VALUES ($1, $2, 'salida', $3, 'venta', $4, NOW(), $5)`,
          [producto_id, sucursal_id, cantidad, `Venta ID ${venta.id}`, usuario_id]);
      }
      // Si no hay stock suficiente pero se permite venta sin stock, no descontamos ni registramos movimientos de stock
    }

    // Insertar formas de pago
    for (const pago of pagos) {
      await client.query(
        `INSERT INTO pagos_venta (venta_id, tipo_pago, monto) VALUES ($1, $2, $3)`,
        [venta.id, pago.tipo_pago, pago.monto]
      );
    }

    // Registrar movimiento de caja (por el total)
    await client.query(`
      INSERT INTO movimientos_caja (caja_id, usuario_id, tipo, descripcion, monto, fecha)
      VALUES ($1, $2, 'ingreso', $3, $4, NOW())`,
      [caja_id, usuario_id, `Venta código ${codigo}`, total]);

    await client.query('COMMIT');

    // Obtener detalles completos de la venta
    const detallesResult = await client.query(`
      SELECT dv.producto_id, p.nombre AS nombre_producto, dv.cantidad, dv.precio_unitario
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = $1`,
      [venta.id]
    );

    // Obtener pagos
    const pagosVenta = await obtenerPagosPorVenta(venta.id);

    // Obtener configuración sucursal
    const configSucursalRes = await client.query(
      'SELECT * FROM configuracion_sucursal WHERE sucursal_id = $1',
      [sucursal_id]
    );

    // Obtener configuración impresión
    const configImpresionRes = await client.query(
      'SELECT * FROM configuracion_impresion WHERE sucursal_id = $1',
      [sucursal_id]
    );

    // Armar respuesta completa
    const ventaCompleta = {
      ...venta,
      detalle: detallesResult.rows,
      pagos: pagosVenta,
      configuracion_sucursal: configSucursalRes.rows[0] || null,
      configuracion_impresion: configImpresionRes.rows[0] || null,
    };

    res.status(201).json(ventaCompleta);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al registrar venta:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// (El resto de las funciones se mantiene igual)

exports.getAll = async (req, res) => {
  const sucursal_id = req.user.sucursal_id;
  try {
    const result = await db.query(`
      SELECT v.*, u.nombre AS usuario
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.sucursal_id = $1
      ORDER BY v.fecha DESC`,
      [sucursal_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener ventas:', err);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params;
  const sucursal_id = req.user.sucursal_id;

  try {
    const ventaResult = await db.query(`
      SELECT v.*, u.nombre AS usuario, c.nombre AS cliente_nombre
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.id = $1 AND v.sucursal_id = $2`,
      [id, sucursal_id]
    );

    if (ventaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const venta = ventaResult.rows[0];

    const detallesResult = await db.query(`
      SELECT dv.producto_id, p.nombre AS producto, dv.cantidad, dv.precio_unitario
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = $1`,
      [id]
    );

    const pagos = await obtenerPagosPorVenta(id);

    venta.detalle = detallesResult.rows.map((d) => ({
      nombre_producto: d.producto,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
    }));

    venta.pagos = pagos;

    res.json(venta);
  } catch (err) {
    console.error('Error al obtener venta:', err);
    res.status(500).json({ error: 'Error al obtener venta' });
  }
};

exports.getByCliente = async (req, res) => {
  const { cliente_id } = req.params;
  const sucursal_id = req.user.sucursal_id;
  try {
    const result = await db.query(`
      SELECT v.*, u.nombre AS usuario
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.cliente_id = $1 AND v.sucursal_id = $2
      ORDER BY v.fecha DESC`,
      [cliente_id, sucursal_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener ventas por cliente:', err);
    res.status(500).json({ error: 'Error al obtener ventas por cliente' });
  }
};

exports.getByClienteFechas = async (req, res) => {
  const { cliente_id } = req.params;
  const { desde, hasta } = req.query;
  const sucursal_id = req.user.sucursal_id;

  let query = `
    SELECT v.*, u.nombre AS usuario
    FROM ventas v
    JOIN usuarios u ON v.usuario_id = u.id
    WHERE v.cliente_id = $1 AND v.sucursal_id = $2`;
  const params = [cliente_id, sucursal_id];

  if (desde) {
    query += ` AND v.fecha >= $${params.length + 1}`;
    params.push(desde);
  }
  if (hasta) {
    query += ` AND v.fecha <= $${params.length + 1}`;
    params.push(hasta);
  }

  query += ` ORDER BY v.fecha DESC`;

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error filtrando ventas por cliente:', err);
    res.status(500).json({ error: 'Error filtrando ventas por cliente' });
  }
};

exports.anularVenta = async (req, res) => {
  const { id } = req.params;
  const sucursal_id = req.user.sucursal_id;

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const ventaRes = await client.query(
      'SELECT * FROM ventas WHERE id = $1 AND estado = $2 AND sucursal_id = $3',
      [id, 'activa', sucursal_id]
    );

    if (ventaRes.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada o ya anulada' });
    }

    await client.query(
      'UPDATE ventas SET estado = $1 WHERE id = $2',
      ['anulada', id]
    );

    const detallesRes = await client.query(
      'SELECT producto_id, cantidad FROM detalle_ventas WHERE venta_id = $1',
      [id]
    );

    for (const item of detallesRes.rows) {
      await client.query(
        'UPDATE stock SET stock = stock + $1 WHERE producto_id = $2 AND sucursal_id = $3',
        [item.cantidad, item.producto_id, sucursal_id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Venta anulada correctamente' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error anulando venta:', err);
    res.status(500).json({ error: 'Error anulando venta' });
  } finally {
    client.release();
  }
};
