const db = require('../config/db');

// Obtener permisos de un usuario
exports.getPermisosPorUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'SELECT modulo, accion, permitido FROM permisos_usuario WHERE usuario_id = $1',
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener permisos:', err);
    res.status(500).json({ error: 'Error al obtener permisos' });
  }
};

// Guardar permisos (reemplazar todos los permisos actuales del usuario)
exports.setPermisosPorUsuario = async (req, res) => {
  const { id } = req.params;
  const permisos = req.body.permisos; // [{ modulo, accion, permitido }, ...]

  if (!Array.isArray(permisos)) {
    return res.status(400).json({ error: 'Formato de permisos inválido' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Eliminar permisos actuales
    await client.query('DELETE FROM permisos_usuario WHERE usuario_id = $1', [id]);

    // Insertar nuevos permisos
    for (const permiso of permisos) {
      const { modulo, accion, permitido } = permiso;
      await client.query(
        'INSERT INTO permisos_usuario (usuario_id, modulo, accion, permitido) VALUES ($1, $2, $3, $4)',
        [id, modulo, accion, permitido]
      );
    }

    await client.query('COMMIT');
    res.json({ mensaje: 'Permisos actualizados correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error al guardar permisos:', err);
    res.status(500).json({ error: 'Error al guardar permisos', detalle: err.message });
  } finally {
    client.release();
  }
};
