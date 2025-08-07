const db = require('../config/db');

// Helper para obtener configuración del sistema (solo lo que necesitamos aquí)
async function getConfiguracionSistema() {
  const result = await db.query('SELECT permitir_venta_sin_caja FROM configuracion_sistema WHERE id = 1');
  if (result.rowCount === 0) throw new Error('Configuración del sistema no encontrada');
  return result.rows[0];
}

// Abrir caja
exports.abrirCaja = async (req, res) => {
  console.log('REQ.USER:', req.user);
  console.log('REQ.BODY:', req.body);

  let { turno, monto_inicial } = req.body;
  console.log('Turno recibido:', turno);

  const usuario_id = req.user.id;
  const sucursal_id = req.user.sucursal_id;

  // Normalización NFC + lowercase + validación estricta
  turno = turno.normalize("NFC").trim().toLowerCase();

  const turnoMap = {
    "mañana": "Mañana",
    "tarde": "Tarde",
    "noche": "Noche"
  };

  const turnoFinal = turnoMap[turno];

  if (!turnoFinal) {
    return res.status(400).json({ error: 'Turno inválido' });
  }

  try {
    // Validar que no exista caja abierta para el usuario
    const cajaAbierta = await db.query(
      'SELECT * FROM cajas WHERE usuario_id = $1 AND fecha_cierre IS NULL',
      [usuario_id]
    );
    if (cajaAbierta.rowCount > 0) {
      return res.status(400).json({ error: 'Ya existe una caja abierta para este usuario' });
    }

    // Confirmar turno insertado
    console.log('Turno final (insertará):', turnoFinal);

    const result = await db.query(
      `INSERT INTO cajas (usuario_id, sucursal_id, turno, monto_inicial, fecha_apertura) 
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [usuario_id, sucursal_id, turnoFinal, monto_inicial]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error abriendo caja:', error);
    res.status(500).json({ error: 'Error al abrir caja' });
  }
};

// Registrar movimiento (ingreso, egreso, apertura, cierre)
exports.registrarMovimiento = async (req, res) => {
  const { caja_id, tipo, descripcion = null, monto } = req.body;
  const usuario_id = req.user.id;

  const tiposValidos = ['ingreso', 'egreso', 'apertura', 'cierre'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de movimiento inválido' });
  }

  try {
    // Validar que la caja exista y esté abierta
    const caja = await db.query(
      'SELECT * FROM cajas WHERE id = $1 AND fecha_cierre IS NULL',
      [caja_id]
    );
    if (caja.rowCount === 0) {
      return res.status(400).json({ error: 'Caja no existe o está cerrada' });
    }

    const result = await db.query(
      `INSERT INTO movimientos_caja (caja_id, usuario_id, tipo, descripcion, monto, fecha)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [caja_id, usuario_id, tipo, descripcion, monto]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error registrando movimiento:', error);
    res.status(500).json({ error: 'Error al registrar movimiento' });
  }
};

// Cerrar caja
exports.cerrarCaja = async (req, res) => {
  const { id } = req.params;
  const { monto_final, dinero_rendido } = req.body;

  try {
    // Validar que la caja exista y esté abierta
    const caja = await db.query(
      'SELECT * FROM cajas WHERE id = $1 AND fecha_cierre IS NULL',
      [id]
    );
    if (caja.rowCount === 0) {
      return res.status(400).json({ error: 'Caja no existe o ya está cerrada' });
    }

    const diferencia = dinero_rendido - monto_final;

    // Actualizar caja con monto_final, dinero_rendido, diferencia y fecha_cierre
    await db.query(
      `UPDATE cajas
       SET fecha_cierre = NOW(), monto_final = $1, dinero_rendido = $2, diferencia = $3
       WHERE id = $4`,
      [monto_final, dinero_rendido, diferencia, id]
    );

    res.json({ message: 'Caja cerrada correctamente' });
  } catch (error) {
    console.error('Error cerrando caja:', error);
    res.status(500).json({ error: 'Error al cerrar caja' });
  }
};

// Obtener cajas (filtrado por sucursal y opcional usuario)
exports.getCajas = async (req, res) => {
  const sucursal_id = req.user.sucursal_id;
  const usuario_id = req.user.id;

  let query = 'SELECT * FROM cajas WHERE sucursal_id = $1';
  const params = [sucursal_id];

  // Si quieres que cada usuario vea SOLO sus cajas, descomenta esta línea:
  query += ' AND usuario_id = $2';
  params.push(usuario_id);

  query += ' ORDER BY fecha_apertura DESC';

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo cajas:', error);
    res.status(500).json({ error: 'Error al obtener cajas' });
  }
};

// Obtener movimientos de caja por caja_id
exports.getMovimientosPorCaja = async (req, res) => {
  const { caja_id } = req.params;

  try {
    const result = await db.query(
      `SELECT mc.*, u.nombre AS usuario_nombre 
       FROM movimientos_caja mc
       LEFT JOIN usuarios u ON mc.usuario_id = u.id
       WHERE mc.caja_id = $1
       ORDER BY mc.fecha DESC`,
      [caja_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo movimientos de caja:', error);
    res.status(500).json({ error: 'Error al obtener movimientos de caja' });
  }
};

// Obtener caja abierta para usuario y sucursal
exports.getCajaAbierta = async (req, res) => {
  const usuario_id = req.user.id;
  const sucursal_id = req.user.sucursal_id;

  try {
    const config = await getConfiguracionSistema();
    const permitirVentaSinCaja = config.permitir_venta_sin_caja;

    if (permitirVentaSinCaja) {
      // Si se permite vender sin caja abierta, devolver null (o mensaje)
      return res.status(200).json({ message: 'Venta sin caja permitida', caja: null });
    }

    // Caso contrario, se exige caja abierta
    const result = await db.query(
      'SELECT * FROM cajas WHERE usuario_id = $1 AND sucursal_id = $2 AND fecha_cierre IS NULL',
      [usuario_id, sucursal_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No hay caja abierta' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo caja abierta:', error);
    res.status(500).json({ error: 'Error al obtener caja abierta' });
  }
};

// Obtener la última caja cerrada para la sucursal
exports.getUltimaCajaCerrada = async (req, res) => {
  const sucursal_id = req.user.sucursal_id;

  try {
    const result = await db.query(
      `SELECT * FROM cajas 
       WHERE sucursal_id = $1 AND fecha_cierre IS NOT NULL
       ORDER BY fecha_cierre DESC
       LIMIT 1`,
      [sucursal_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No hay cajas cerradas' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo última caja cerrada:', error);
    res.status(500).json({ error: 'Error al obtener última caja cerrada' });
  }
};
