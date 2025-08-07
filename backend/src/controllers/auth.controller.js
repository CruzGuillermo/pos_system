const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

exports.register = async (req, res) => {
const { nombre, usuario, contrasena, rol, sucursal_id } = req.body;

  try {
    const hashed = await bcrypt.hash(contrasena, 10);
    const result = await db.query(
      'INSERT INTO usuarios (nombre, usuario, contrasena, rol, sucursal_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, usuario, rol, sucursal_id',
      [nombre, usuario, hashed, rol, sucursal_id]
    );
    res.status(201).json({ user: result.rows[0] });
 } catch (err) {
  console.error('❌ Error en registro:', err);
  res.status(500).json({ error: 'Error al registrar usuario', detalle: err.message });
}
};

exports.login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
    const user = result.rows[0];

    if (!user) {
      console.log(`Intento de login fallido: usuario "${usuario}" no encontrado`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) {
      console.log(`Intento de login fallido: contraseña incorrecta para usuario "${usuario}"`);
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    console.log(`Usuario "${usuario}" inició sesión correctamente`);

    const token = jwt.sign(
      { id: user.id, usuario: user.usuario, rol: user.rol, sucursal_id: user.sucursal_id },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token, usuario: user.usuario, rol: user.rol, sucursal_id: user.sucursal_id });
  } catch (err) {
    console.error('❌ Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

exports.getUsuarios = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nombre, usuario, rol, sucursal_id FROM usuarios ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};
// Obtiene usuarios solo de la sucursal del usuario logueado
exports.getUsuariosPorSucursal = async (req, res) => {
  const { sucursal_id } = req.user;

  try {
    const result = await db.query(
      'SELECT id, nombre, usuario, rol, sucursal_id FROM usuarios WHERE sucursal_id = $1 ORDER BY id ASC',
      [sucursal_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener usuarios por sucursal:', err);
    res.status(500).json({ error: 'Error al obtener los usuarios por sucursal' });
  }
};
