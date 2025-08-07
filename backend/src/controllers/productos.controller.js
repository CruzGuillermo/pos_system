const db = require('../config/db');

// 🔍 Obtener todos los productos de la sucursal del usuario
exports.getAll = async (req, res) => {
  const sucursal_id = req.user.sucursal_id;
  const { auto_barcode } = req.query;

  try {
    let query = `
      SELECT p.*, c.nombre AS categoria, u.nombre AS unidad
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN unidades u ON p.unidad_id = u.id
      WHERE p.activo = true AND p.sucursal_id = $1
    `;
    const values = [sucursal_id];

    // Filtrar solo los que tienen código generado automáticamente (por ejemplo, los de 13 dígitos numéricos)
    if (auto_barcode === 'true') {
      query += ` AND p.codigo_barras ~ '^[0-9]{13}$'`; // usa expresión regular
    }

    query += ` ORDER BY p.nombre ASC`;

    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};


// 🔍 Obtener un solo producto por ID (si pertenece a la sucursal)
exports.getOne = async (req, res) => {
  const { id } = req.params;
  const sucursal_id = req.user.sucursal_id;

  try {
    const result = await db.query(
      'SELECT * FROM productos WHERE id = $1 AND sucursal_id = $2',
      [id, sucursal_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en su sucursal' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener producto:', err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// 🔍 Buscar producto por código de barras
exports.getByCodigoBarras = async (req, res) => {
  const sucursal_id = req.user.sucursal_id;
  const { codigo_barras } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM productos WHERE codigo_barras = $1 AND sucursal_id = $2',
      [codigo_barras, sucursal_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado con ese código de barras' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al buscar producto por código de barras:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 🆕 Crear producto con soporte para código de barras
// Función para generar un código de barras de 13 dígitos (simple, no válido EAN-13 real)
function generarCodigoBarras() {
  const base = Math.floor(100000000000 + Math.random() * 900000000000); // 12 dígitos
  return base.toString(); // Podés agregar verificador real si querés
}

exports.create = async (req, res) => {
  const { codigo, nombre, descripcion, categoria_id, unidad_id, precio } = req.body;
  let { codigo_barras } = req.body;
  const sucursal_id = req.user.sucursal_id;

  if (!codigo || !nombre || !precio || !categoria_id || !unidad_id) {
    return res.status(400).json({ error: 'Campos obligatorios faltantes' });
  }

  try {
    // Verificar duplicado por código
    const checkCodigo = await db.query(
      'SELECT id FROM productos WHERE codigo = $1 AND sucursal_id = $2',
      [codigo, sucursal_id]
    );
    if (checkCodigo.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un producto con ese código en esta sucursal' });
    }

    // Si no se manda código de barras, generar uno
    if (!codigo_barras) {
      let intento = 0;
      let encontrado = true;

      // Buscar un código de barras único
      while (encontrado && intento < 10) {
        codigo_barras = generarCodigoBarras();
        const check = await db.query(
          'SELECT id FROM productos WHERE codigo_barras = $1 AND sucursal_id = $2',
          [codigo_barras, sucursal_id]
        );
        encontrado = check.rows.length > 0;
        intento++;
      }

      if (encontrado) {
        return res.status(500).json({ error: 'No se pudo generar un código de barras único' });
      }
    } else {
      // Verificar código de barras enviado por usuario
      const checkBarra = await db.query(
        'SELECT id FROM productos WHERE codigo_barras = $1 AND sucursal_id = $2',
        [codigo_barras, sucursal_id]
      );
      if (checkBarra.rows.length > 0) {
        return res.status(409).json({ error: 'Ya existe un producto con ese código de barras en esta sucursal' });
      }
    }

    const result = await db.query(
      `INSERT INTO productos (codigo, nombre, descripcion, categoria_id, unidad_id, precio, sucursal_id, codigo_barras)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [codigo, nombre, descripcion || '', categoria_id, unidad_id, precio, sucursal_id, codigo_barras]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear producto:', err.message);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};


// ✏️ Actualizar producto (verifica sucursal y unicidad de código de barras)
exports.update = async (req, res) => {
  const { id } = req.params;
  const sucursal_id = req.user.sucursal_id;
  let { codigo, nombre, descripcion, categoria_id, unidad_id, precio, activo, codigo_barras } = req.body;

  try {
    // Verificar que el producto pertenezca a la sucursal
    const resultCheck = await db.query(
      'SELECT * FROM productos WHERE id = $1 AND sucursal_id = $2',
      [id, sucursal_id]
    );
    if (resultCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No autorizado para modificar este producto' });
    }

    if (activo === undefined) {
      activo = resultCheck.rows[0].activo;
    }

    // Verificar duplicado de código de barras (excluyendo el actual)
    if (codigo_barras) {
      const checkBarra = await db.query(
        'SELECT id FROM productos WHERE codigo_barras = $1 AND sucursal_id = $2 AND id != $3',
        [codigo_barras, sucursal_id, id]
      );
      if (checkBarra.rows.length > 0) {
        return res.status(409).json({ error: 'Ya existe otro producto con ese código de barras' });
      }
    }

    const result = await db.query(
      `UPDATE productos
       SET codigo = $1, nombre = $2, descripcion = $3, categoria_id = $4, unidad_id = $5, precio = $6, activo = $7, codigo_barras = $8
       WHERE id = $9 AND sucursal_id = $10 RETURNING *`,
      [codigo, nombre, descripcion, categoria_id, unidad_id, precio, activo, codigo_barras || null, id, sucursal_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// 🗑️ Eliminar producto (solo si pertenece a la sucursal)
exports.delete = async (req, res) => {
  const { id } = req.params;
  const sucursal_id = req.user.sucursal_id;

  try {
    const result = await db.query(
      'DELETE FROM productos WHERE id = $1 AND sucursal_id = $2 RETURNING *',
      [id, sucursal_id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'No autorizado para eliminar este producto' });
    }

    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
