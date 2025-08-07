const db = require('../config/db');

exports.ventasPorFechas = async (req, res) => {
  const { desde, hasta, usuario_id, cliente_id, producto_id, categoria_id } = req.query;
  const sucursal_id = req.user.sucursal_id;

  let query = `
    SELECT v.id, v.fecha, v.total, v.metodo_pago, v.cliente_id, v.usuario_id, v.sucursal_id,
           u.nombre AS usuario, s.nombre AS sucursal, c.nombre AS cliente
    FROM ventas v
    LEFT JOIN usuarios u ON v.usuario_id = u.id
    LEFT JOIN sucursales s ON v.sucursal_id = s.id
    LEFT JOIN clientes c ON v.cliente_id = c.id
    WHERE v.fecha BETWEEN $1 AND $2 AND v.sucursal_id = $3
  `;

  const params = [desde, hasta, sucursal_id];
  let paramIndex = 4;

  if (usuario_id) {
    query += ` AND v.usuario_id = $${paramIndex++}`;
    params.push(usuario_id);
  }
  if (cliente_id) {
    query += ` AND v.cliente_id = $${paramIndex++}`;
    params.push(cliente_id);
  }

  if (producto_id || categoria_id) {
    query += `
      AND EXISTS (
        SELECT 1 FROM detalle_ventas dv
        JOIN productos p ON dv.producto_id = p.id
        WHERE dv.venta_id = v.id
    `;
    if (producto_id) {
      query += ` AND dv.producto_id = $${paramIndex++}`;
      params.push(producto_id);
    }
    if (categoria_id) {
      query += ` AND p.categoria_id = $${paramIndex++}`;
      params.push(categoria_id);
    }
    query += `)`;
  }

  query += ` ORDER BY v.fecha DESC`;

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en reporte ventas:', err);
    res.status(500).json({ error: 'Error al obtener reporte de ventas' });
  }
};


exports.ventasPorProductoCategoria = async (req, res) => {
  const sucursal_id = req.user.sucursal_id;

  try {
    const query = `
      SELECT 
        p.id AS producto_id,
        p.nombre AS producto,
        c.nombre AS categoria,
        SUM(dv.cantidad) AS cantidad_vendida,
        SUM(dv.cantidad * dv.precio_unitario) AS total_vendido
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      LEFT JOIN categorias c ON p.categoria_id = c.id
      JOIN ventas v ON dv.venta_id = v.id
      WHERE v.estado = 'activa' AND v.sucursal_id = $1
      GROUP BY p.id, p.nombre, c.nombre
      ORDER BY total_vendido DESC
    `;
    const result = await db.query(query, [sucursal_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en ventasPorProductoCategoria:', err);
    res.status(500).json({ error: 'Error obteniendo reporte ventas por producto y categoría' });
  }
};


exports.resumenVentasPorPeriodo = async (req, res) => {
  const { periodo } = req.query;
  const sucursal_id = req.user.sucursal_id;

  if (!['dia', 'semana', 'mes'].includes(periodo)) {
    return res.status(400).json({ error: 'Parámetro periodo inválido. Use dia, semana o mes.' });
  }

  let groupBy;
  switch (periodo) {
    case 'dia':
      groupBy = "DATE(v.fecha)";
      break;
    case 'semana':
      groupBy = "DATE_TRUNC('week', v.fecha)";
      break;
    case 'mes':
      groupBy = "DATE_TRUNC('month', v.fecha)";
      break;
  }

  try {
    const query = `
      SELECT
        ${groupBy} AS periodo,
        COUNT(*) AS cantidad_ventas,
        SUM(v.total) AS total_ventas
      FROM ventas v
      WHERE v.estado = 'activa' AND v.sucursal_id = $1
      GROUP BY periodo
      ORDER BY periodo DESC
    `;
    const result = await db.query(query, [sucursal_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en resumenVentasPorPeriodo:', err);
    res.status(500).json({ error: 'Error obteniendo resumen de ventas' });
  }
};


exports.productosConStockBajo = async (req, res) => {
  const sucursal_id = req.user.sucursal_id;

  try {
    const result = await db.query(`
      SELECT 
        s.producto_id,
        p.nombre,
        s.stock,
        p.stock_minimo
      FROM stock s
      JOIN productos p ON s.producto_id = p.id
      WHERE s.sucursal_id = $1 AND s.stock <= p.stock_minimo
      ORDER BY s.stock ASC
    `, [sucursal_id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener productos con stock bajo:', err);
    res.status(500).json({ error: 'Error al obtener productos con stock bajo' });
  }
};


exports.movimientosDeStock = async (req, res) => {
  const sucursal_id = req.user.sucursal_id;

  try {
    const result = await db.query(`
      SELECT 
        m.id,
        m.producto_id,
        p.nombre AS producto,
        m.tipo,
        m.cantidad,
        m.origen,
        m.descripcion,
        m.fecha,
        u.nombre AS usuario
      FROM movimientos_stock m
      JOIN productos p ON m.producto_id = p.id
      JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.sucursal_id = $1
      ORDER BY m.fecha DESC
    `, [sucursal_id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener movimientos de stock:', err);
    res.status(500).json({ error: 'Error al obtener movimientos de stock' });
  }
};


exports.cajasPorFechaUsuario = async (req, res) => {
  const { desde, hasta, usuario_id, caja_id } = req.query;

  let queryAperturas = `
    SELECT c.id, c.fecha_apertura, c.fecha_cierre, c.estado, c.usuario_id, u.nombre AS usuario, c.sucursal_id
    FROM cajas c
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.fecha_apertura BETWEEN $1 AND $2
  `;

  const params = [desde, hasta];
  let paramIndex = 3;

  if (usuario_id) {
    queryAperturas += ` AND c.usuario_id = $${paramIndex++}`;
    params.push(usuario_id);
  }
  if (caja_id) {
    queryAperturas += ` AND c.id = $${paramIndex++}`;
    params.push(caja_id);
  }
  queryAperturas += ` ORDER BY c.fecha_apertura DESC`;

  let queryMovimientos = `
    SELECT m.id, m.caja_id, m.tipo, m.monto, m.descripcion, m.fecha, u.nombre AS usuario
    FROM movimientos_caja m
    JOIN usuarios u ON m.usuario_id = u.id
    WHERE m.fecha BETWEEN $1 AND $2
  `;

  paramIndex = 3;
  if (usuario_id) {
    queryMovimientos += ` AND m.usuario_id = $${paramIndex++}`;
  }
  if (caja_id) {
    queryMovimientos += ` AND m.caja_id = $${paramIndex++}`;
  }
  queryMovimientos += ` ORDER BY m.fecha DESC`;

  try {
    const aperturas = await db.query(queryAperturas, params);
    const movimientos = await db.query(queryMovimientos, params);
    res.json({
      aperturas: aperturas.rows,
      movimientos: movimientos.rows,
    });
  } catch (error) {
    console.error('Error en reporte cajas:', error);
    res.status(500).json({ error: 'Error obteniendo reporte de cajas' });
  }
};

exports.resumenIngresosEgresosPorCaja = async (req, res) => {
  const { desde, hasta, caja_id } = req.query;

  let query = `
    SELECT m.caja_id, 
      SUM(CASE WHEN m.tipo = 'ingreso' THEN m.monto ELSE 0 END) AS total_ingresos,
      SUM(CASE WHEN m.tipo = 'egreso' THEN m.monto ELSE 0 END) AS total_egresos
    FROM movimientos_caja m
    WHERE m.fecha BETWEEN $1 AND $2
  `;

  const params = [desde, hasta];
  if (caja_id) {
    query += ` AND m.caja_id = $3`;
    params.push(caja_id);
  }

  query += ` GROUP BY m.caja_id`;

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en resumen de caja:', error);
    res.status(500).json({ error: 'Error obteniendo resumen de caja' });
  }
};

exports.conciliacionCaja = async (req, res) => {
  const { caja_id } = req.query;

  if (!caja_id) {
    return res.status(400).json({ error: 'Debe especificar caja_id' });
  }

  try {
    const cajaRes = await db.query(`SELECT * FROM cajas WHERE id = $1`, [caja_id]);
    if (cajaRes.rows.length === 0) {
      return res.status(404).json({ error: 'Caja no encontrada' });
    }

    const caja = cajaRes.rows[0];

    const movimientosRes = await db.query(
      `SELECT
        SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) AS total_ingresos,
        SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) AS total_egresos
       FROM movimientos_caja WHERE caja_id = $1`,
      [caja_id]
    );

    const { total_ingresos = 0, total_egresos = 0 } = movimientosRes.rows[0];

    const saldoCalculado = total_ingresos - total_egresos;

    const conciliacion = saldoCalculado === caja.saldo_cierre;

    res.json({
      caja_id,
      saldo_apertura: caja.saldo_apertura,
      saldo_cierre: caja.saldo_cierre,
      total_ingresos,
      total_egresos,
      saldoCalculado,
      conciliacion,
    });
  } catch (error) {
    console.error('Error en conciliación de caja:', error);
    res.status(500).json({ error: 'Error en conciliación de caja' });
  }
};

exports.gastosPorCategoria = async (req, res) => {
  try {
    const query = `
      SELECT 
        gc.id AS categoria_id,
        gc.nombre AS categoria,
        SUM(g.monto) AS total_gastado
      FROM gastos g
      JOIN gastos_categorias gc ON g.categoria_id = gc.id
      WHERE g.estado = 'activo'
      GROUP BY gc.id, gc.nombre
      ORDER BY total_gastado DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en gastosPorCategoria:', error);
    res.status(500).json({ error: 'Error obteniendo gastos por categoría' });
  }
};

exports.gastosPorSucursalYPeriodo = async (req, res) => {
  const { sucursal_id, desde, hasta } = req.query;

  if (!sucursal_id) {
    return res.status(400).json({ error: 'Parámetro sucursal_id es obligatorio' });
  }

  let query = `
    SELECT 
      g.id,
      g.fecha,
      g.monto,
      g.descripcion,
      gc.nombre AS categoria,
      s.nombre AS sucursal
    FROM gastos g
    JOIN gastos_categorias gc ON g.categoria_id = gc.id
    JOIN sucursales s ON g.sucursal_id = s.id
    WHERE g.sucursal_id = $1
  `;

  const params = [sucursal_id];

  if (desde) {
    query += ` AND g.fecha >= $${params.length + 1}`;
    params.push(desde);
  }
  if (hasta) {
    query += ` AND g.fecha <= $${params.length + 1}`;
    params.push(hasta);
  }

  query += ` ORDER BY g.fecha DESC`;

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en gastosPorSucursalYPeriodo:', error);
    res.status(500).json({ error: 'Error obteniendo gastos por sucursal y periodo' });
  }
};

exports.cuentasCorrientesPorCliente = async (req, res) => {
  const { cliente_id } = req.params;

  if (!cliente_id) {
    return res.status(400).json({ error: 'cliente_id es obligatorio' });
  }

  try {
    const movimientos = await db.query(
      `
      SELECT 
        cc.id,
        cc.tipo,
        cc.monto,
        cc.fecha,
        cc.descripcion,
        u.nombre AS usuario
      FROM cuentas_corrientes cc
      JOIN usuarios u ON cc.usuario_id = u.id
      WHERE cc.cliente_id = $1
      ORDER BY cc.fecha DESC
      `,
      [cliente_id]
    );

    const saldoRes = await db.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'credito' THEN monto ELSE 0 END),0) AS total_creditos,
        COALESCE(SUM(CASE WHEN tipo = 'debito' THEN monto ELSE 0 END),0) AS total_debitos
      FROM cuentas_corrientes
      WHERE cliente_id = $1
      `,
      [cliente_id]
    );

    const saldo = saldoRes.rows[0].total_creditos - saldoRes.rows[0].total_debitos;

    res.json({
      cliente_id,
      saldo,
      movimientos: movimientos.rows,
    });
  } catch (error) {
    console.error('Error en cuentasCorrientesPorCliente:', error);
    res.status(500).json({ error: 'Error obteniendo cuentas corrientes por cliente' });
  }
};

exports.ventasFiadasYPagosPorCliente = async (req, res) => {
  const { cliente_id } = req.params;

  if (!cliente_id) {
    return res.status(400).json({ error: 'cliente_id es obligatorio' });
  }

  try {
    const ventasFiadas = await db.query(
      `
      SELECT 
        v.id,
        v.fecha,
        v.total,
        v.estado,
        u.nombre AS usuario,
        s.nombre AS sucursal
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      JOIN sucursales s ON v.sucursal_id = s.id
      WHERE v.cliente_id = $1 AND v.metodo_pago = 'cuenta_corriente' AND v.estado = 'activa'
      ORDER BY v.fecha DESC
      `,
      [cliente_id]
    );

    const pagos = await db.query(
      `
      SELECT 
        cc.id,
        cc.monto,
        cc.fecha,
        cc.descripcion,
        u.nombre AS usuario
      FROM cuentas_corrientes cc
      JOIN usuarios u ON cc.usuario_id = u.id
      WHERE cc.cliente_id = $1 AND cc.tipo = 'credito'
      ORDER BY cc.fecha DESC
      `,
      [cliente_id]
    );

    res.json({
      cliente_id,
      ventasFiadas: ventasFiadas.rows,
      pagos: pagos.rows,
    });
  } catch (error) {
    console.error('Error en ventasFiadasYPagosPorCliente:', error);
    res.status(500).json({ error: 'Error obteniendo ventas fiadas y pagos por cliente' });
  }
};

exports.comprasPorPeriodo = async (req, res) => {
  const { desde, hasta, sucursal_id, proveedor_id } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ error: 'Parámetros desde y hasta son obligatorios' });
  }

  let query = `
    SELECT c.id, c.fecha, c.total, c.estado, c.sucursal_id, c.proveedor_id,
           p.nombre AS proveedor,
           s.nombre AS sucursal,
           u.nombre AS usuario
    FROM compras c
    JOIN proveedores p ON c.proveedor_id = p.id
    JOIN sucursales s ON c.sucursal_id = s.id
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.fecha BETWEEN $1 AND $2
  `;

  const params = [desde, hasta];
  let paramIndex = 3;

  if (sucursal_id) {
    query += ` AND c.sucursal_id = $${paramIndex++}`;
    params.push(sucursal_id);
  }
  if (proveedor_id) {
    query += ` AND c.proveedor_id = $${paramIndex++}`;
    params.push(proveedor_id);
  }

  query += ` ORDER BY c.fecha DESC`;

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en reporte compras por periodo:', error);
    res.status(500).json({ error: 'Error obteniendo reporte de compras' });
  }
};

exports.comprasPorProveedor = async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ error: 'Parámetros desde y hasta son obligatorios' });
  }

  try {
    const query = `
      SELECT 
        p.id AS proveedor_id,
        p.nombre AS proveedor,
        COUNT(c.id) AS cantidad_compras,
        SUM(c.total) AS total_compras
      FROM compras c
      JOIN proveedores p ON c.proveedor_id = p.id
      WHERE c.fecha BETWEEN $1 AND $2
      GROUP BY p.id, p.nombre
      ORDER BY total_compras DESC
    `;
    const result = await db.query(query, [desde, hasta]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en reporte compras por proveedor:', error);
    res.status(500).json({ error: 'Error obteniendo reporte compras por proveedor' });
  }
};
