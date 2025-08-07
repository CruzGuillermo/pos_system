const db = require('../config/db');

function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validarTelefono(telefono) {
  const re = /^[0-9+\-\s]{6,20}$/;
  return re.test(telefono);
}

exports.create = async (req, res) => {
  const { nombre, apellido, documento, telefono, email, direccion, notas = null } = req.body;
  const sucursal_id = req.user.sucursal_id;

  if (!validarEmail(email)) return res.status(400).json({ error: 'Email inválido' });
  if (!validarTelefono(telefono)) return res.status(400).json({ error: 'Teléfono inválido' });

  try {
    const existeDoc = await db.query(
      'SELECT id FROM clientes WHERE documento = $1 AND sucursal_id = $2',
      [documento, sucursal_id]
    );
    if (existeDoc.rowCount > 0) return res.status(400).json({ error: 'Documento ya registrado' });

    const result = await db.query(
      `INSERT INTO clientes (nombre, apellido, documento, telefono, email, direccion, notas, sucursal_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nombre, apellido, documento, telefono, email, direccion, notas, sucursal_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creando cliente:', err);
    res.status(500).json({ error: 'Error creando cliente' });
  }
};

exports.getAll = async (req, res) => {
  const sucursal_id = req.user.sucursal_id;
  try {
    const result = await db.query(
      'SELECT * FROM clientes WHERE sucursal_id = $1 ORDER BY apellido, nombre',
      [sucursal_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo clientes:', err);
    res.status(500).json({ error: 'Error obteniendo clientes' });
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params;
  const sucursal_id = req.user.sucursal_id;
  try {
    const result = await db.query(
      'SELECT * FROM clientes WHERE id = $1 AND sucursal_id = $2',
      [id, sucursal_id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error obteniendo cliente:', err);
    res.status(500).json({ error: 'Error obteniendo cliente' });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, documento, telefono, email, direccion, notas = null } = req.body;
  const sucursal_id = req.user.sucursal_id;

  if (!validarEmail(email)) return res.status(400).json({ error: 'Email inválido' });
  if (!validarTelefono(telefono)) return res.status(400).json({ error: 'Teléfono inválido' });

  try {
    const existeDoc = await db.query(
      'SELECT id FROM clientes WHERE documento = $1 AND id <> $2 AND sucursal_id = $3',
      [documento, id, sucursal_id]
    );
    if (existeDoc.rowCount > 0) return res.status(400).json({ error: 'Documento duplicado' });

    const result = await db.query(
      `UPDATE clientes SET nombre=$1, apellido=$2, documento=$3, telefono=$4,
       email=$5, direccion=$6, notas=$7
       WHERE id = $8 AND sucursal_id = $9 RETURNING *`,
      [nombre, apellido, documento, telefono, email, direccion, notas, id, sucursal_id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error actualizando cliente:', err);
    res.status(500).json({ error: 'Error actualizando cliente' });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const sucursal_id = req.user.sucursal_id;

  try {
    const result = await db.query(
      'DELETE FROM clientes WHERE id = $1 AND sucursal_id = $2 RETURNING *',
      [id, sucursal_id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    console.error('Error eliminando cliente:', err);
    res.status(500).json({ error: 'Error eliminando cliente' });
  }
};

exports.search = async (req, res) => {
  const { query = '', page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const sucursal_id = req.user.sucursal_id;

  try {
    const result = await db.query(
      `SELECT * FROM clientes 
       WHERE sucursal_id = $4 AND (
         nombre ILIKE $1 OR apellido ILIKE $1 OR documento ILIKE $1 OR telefono ILIKE $1
       )
       ORDER BY apellido, nombre
       LIMIT $2 OFFSET $3`,
      [`%${query}%`, limit, offset, sucursal_id]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM clientes 
       WHERE sucursal_id = $2 AND (
         nombre ILIKE $1 OR apellido ILIKE $1 OR documento ILIKE $1 OR telefono ILIKE $1
       )`,
      [`%${query}%`, sucursal_id]
    );

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Error en búsqueda de clientes:', err);
    res.status(500).json({ error: 'Error al buscar clientes' });
  }
};

exports.getVentas = async (req, res) => {
  const { id } = req.params;
  const sucursal_id = req.user.sucursal_id;

  try {
    const clienteResult = await db.query(
      'SELECT * FROM clientes WHERE id = $1 AND sucursal_id = $2',
      [id, sucursal_id]
    );
    if (clienteResult.rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });

    const ventasResult = await db.query(`
      SELECT v.id, v.codigo, v.fecha, v.total, v.metodo_pago, v.caja_id, v.sucursal_id,
        u.nombre AS usuario,
        json_agg(
          json_build_object(
            'producto_id', dv.producto_id,
            'cantidad', dv.cantidad,
            'precio_unitario', dv.precio_unitario,
            'producto', p.nombre
          )
        ) AS detalles
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN detalle_ventas dv ON dv.venta_id = v.id
      LEFT JOIN productos p ON dv.producto_id = p.id
      WHERE v.cliente_id = $1 AND v.sucursal_id = $2
      GROUP BY v.id, u.nombre
      ORDER BY v.fecha DESC
    `, [id, sucursal_id]);

    res.json({
      cliente: clienteResult.rows[0],
      ventas: ventasResult.rows
    });
  } catch (err) {
    console.error('Error al obtener historial de ventas del cliente:', err);
    res.status(500).json({ error: 'Error al obtener historial de ventas del cliente' });
  }
};

exports.getHistorial = async (req, res) => {
  const { id } = req.params;
  const sucursal_id = req.user.sucursal_id;

  try {
    const clienteRes = await db.query(
      'SELECT * FROM clientes WHERE id = $1 AND sucursal_id = $2',
      [id, sucursal_id]
    );
    if (clienteRes.rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });

    const movimientosRes = await db.query(
      `SELECT c.*, u.nombre AS usuario, v.codigo AS codigo_venta
       FROM cuentas_corrientes c
       LEFT JOIN usuarios u ON c.usuario_id = u.id
       LEFT JOIN ventas v ON c.venta_id = v.id
       WHERE c.cliente_id = $1
       ORDER BY c.fecha DESC`,
      [id]
    );

    res.json({
      cliente: clienteRes.rows[0],
      movimientos: movimientosRes.rows
    });
  } catch (err) {
    console.error('Error obteniendo historial financiero:', err);
    res.status(500).json({ error: 'Error obteniendo historial financiero del cliente' });
  }
};

exports.exportCSV = async (req, res) => {
  const sucursal_id = req.user.sucursal_id;

  try {
    const result = await db.query(
      'SELECT * FROM clientes WHERE sucursal_id = $1 ORDER BY apellido, nombre',
      [sucursal_id]
    );
    const parser = new Parser();
    const csv = parser.parse(result.rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('clientes.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Error exportando clientes:', err);
    res.status(500).json({ error: 'Error exportando clientes' });
  }
};

