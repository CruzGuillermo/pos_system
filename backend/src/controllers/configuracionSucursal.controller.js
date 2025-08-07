const db = require('../config/db');

// Obtener configuración de sucursal (datos del local)
exports.getConfiguracionSucursal = async (req, res) => {
  const { sucursal_id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM configuracion_sucursal WHERE sucursal_id = $1',
      [sucursal_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuración de sucursal no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener configuración sucursal:', err);
    res.status(500).json({ error: 'Error al obtener configuración de sucursal' });
  }
};

// Crear o actualizar configuración sucursal
// ... tu código anterior ...

exports.upsertConfiguracionSucursal = async (req, res) => {
  const { sucursal_id } = req.params;
  const {
    nombre_fantasia,
    razon_social,
    cuit,
    telefono,
    email,
    direccion,
    ciudad,
    provincia,
    condicion_iva,
    logo_base64, // nuevo campo
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO configuracion_sucursal (
        sucursal_id, nombre_fantasia, razon_social, cuit, telefono, email, direccion, ciudad, provincia, condicion_iva, logo_base64
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
      )
      ON CONFLICT (sucursal_id) DO UPDATE SET
        nombre_fantasia = EXCLUDED.nombre_fantasia,
        razon_social = EXCLUDED.razon_social,
        cuit = EXCLUDED.cuit,
        telefono = EXCLUDED.telefono,
        email = EXCLUDED.email,
        direccion = EXCLUDED.direccion,
        ciudad = EXCLUDED.ciudad,
        provincia = EXCLUDED.provincia,
        condicion_iva = EXCLUDED.condicion_iva,
        logo_base64 = EXCLUDED.logo_base64
      RETURNING *`,
      [
        sucursal_id,
        nombre_fantasia,
        razon_social,
        cuit,
        telefono,
        email,
        direccion,
        ciudad,
        provincia,
        condicion_iva,
        logo_base64 || null, // si no envían logo, guardamos null
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al guardar configuración sucursal:', err);
    res.status(500).json({ error: 'Error al guardar configuración de sucursal' });
  }
};
