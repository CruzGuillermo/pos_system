const db = require('../config/db');

// Obtener configuración general del sistema (id fijo = 1)
exports.getConfiguracionSistema = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM configuracion_sistema WHERE id = 1');
    if (result.rows.length === 0) {
      // Si no existe, la creamos por primera vez con valores por defecto
      const insert = await db.query(`
        INSERT INTO configuracion_sistema (
          simbolo_moneda, formato_decimal, redondeo,
          permitir_venta_sin_stock, permitir_venta_sin_caja, alerta_stock_bajo, stock_minimo_default
        ) VALUES ('$', '0.00', true, false, false, false, 5)
        RETURNING *;
      `);
      return res.json(insert.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al obtener configuración:', err);
    res.status(500).json({ error: 'Error al obtener configuración del sistema' });
  }
};

// Actualizar configuración general
exports.updateConfiguracionSistema = async (req, res) => {
  const {
    simbolo_moneda,
    formato_decimal,
    redondeo,
    permitir_venta_sin_stock,
    permitir_venta_sin_caja,
    alerta_stock_bajo,
    stock_minimo_default
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE configuracion_sistema SET
        simbolo_moneda = $1,
        formato_decimal = $2,
        redondeo = $3,
        permitir_venta_sin_stock = $4,
        permitir_venta_sin_caja = $5,
        alerta_stock_bajo = $6,
        stock_minimo_default = $7
      WHERE id = 1
      RETURNING *`,
      [
        simbolo_moneda,
        formato_decimal,
        redondeo,
        permitir_venta_sin_stock,
        permitir_venta_sin_caja,
        alerta_stock_bajo,
        stock_minimo_default
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al actualizar configuración:', err);
    res.status(500).json({ error: 'Error al actualizar configuración del sistema' });
  }
};
