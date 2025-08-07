const db = require('../config/db');

// Obtener configuración de impresión por sucursal
exports.getConfiguracionImpresion = async (req, res) => {
  const { sucursal_id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM configuracion_impresion WHERE sucursal_id = $1',
      [sucursal_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuración de impresión no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener configuración impresión:', err);
    res.status(500).json({ error: 'Error al obtener configuración de impresión' });
  }
};

// Crear o actualizar configuración de impresión
exports.upsertConfiguracionImpresion = async (req, res) => {
  const { sucursal_id } = req.params;
  const {
    modo_impresion,
    tipo_ticket,
    mostrar_logo,
    mostrar_cuit,
    mensaje_pie,
    impresora_nombre,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO configuracion_impresion (
        sucursal_id, modo_impresion, tipo_ticket, mostrar_logo, mostrar_cuit, mensaje_pie, impresora_nombre
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      ON CONFLICT (sucursal_id) DO UPDATE SET
        modo_impresion = EXCLUDED.modo_impresion,
        tipo_ticket = EXCLUDED.tipo_ticket,
        mostrar_logo = EXCLUDED.mostrar_logo,
        mostrar_cuit = EXCLUDED.mostrar_cuit,
        mensaje_pie = EXCLUDED.mensaje_pie,
        impresora_nombre = EXCLUDED.impresora_nombre
      RETURNING *`,
      [
        sucursal_id,
        modo_impresion,
        tipo_ticket,
        mostrar_logo,
        mostrar_cuit,
        mensaje_pie,
        impresora_nombre,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al guardar configuración impresión:', err);
    res.status(500).json({ error: 'Error al guardar configuración de impresión' });
  }
};

exports.updateConfiguracionImpresion = async (req, res) => {
  const { sucursal_id } = req.params;
  const {
    modo_impresion,
    tipo_ticket,
    mostrar_logo,
    mostrar_cuit,
    mensaje_pie,
    impresora_nombre,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE configuracion_impresion SET
        modo_impresion = $1,
        tipo_ticket = $2,
        mostrar_logo = $3,
        mostrar_cuit = $4,
        mensaje_pie = $5,
        impresora_nombre = $6
       WHERE sucursal_id = $7
       RETURNING *`,
      [
        modo_impresion,
        tipo_ticket,
        mostrar_logo,
        mostrar_cuit,
        mensaje_pie,
        impresora_nombre,
        sucursal_id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada para actualizar' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar configuración impresión:', err);
    res.status(500).json({ error: 'Error al actualizar configuración de impresión' });
  }
};
