const db = require('../config/db');

// Crear movimiento en cuenta corriente
exports.create = async (req, res) => {
  const {
    cliente_id,
    tipo,
    monto,
    referencia = null,
    detalle = null,
    venta_id = null,
    usuario_id,
    sucursal_id,
  } = req.body;

  if (!['venta', 'pago', 'ajuste'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }

  try {
    const result = await db.query(
      `INSERT INTO cuentas_corrientes
      (cliente_id, tipo, monto, referencia, detalle, venta_id, usuario_id, sucursal_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [cliente_id, tipo, monto, referencia, detalle, venta_id, usuario_id, sucursal_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creando movimiento cuenta corriente:', err);
    res.status(500).json({ error: 'Error creando movimiento' });
  }
};

// Obtener historial de movimientos por cliente (ordenado por fecha desc)
exports.getByCliente = async (req, res) => {
  const { cliente_id } = req.params;
  try {
    const result = await db.query(
      `SELECT cc.*, u.nombre AS usuario, s.nombre AS sucursal
       FROM cuentas_corrientes cc
       JOIN usuarios u ON cc.usuario_id = u.id
       JOIN sucursales s ON cc.sucursal_id = s.id
       WHERE cc.cliente_id = $1
       ORDER BY cc.fecha DESC`,
      [cliente_id]
    );

    // Calcular saldo acumulado
    let saldo = 0;
    const movimientos = result.rows.map((mov) => {
      saldo += mov.tipo === 'pago' ? -mov.monto : mov.monto; // Pago resta, ventas/ajustes suman
      return { ...mov, saldo };
    });

    res.json(movimientos);
  } catch (err) {
    console.error('Error obteniendo movimientos cuenta corriente:', err);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};
