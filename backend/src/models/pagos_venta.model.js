// models/pagos_venta.model.js
const pool = require("../config/db");

const insertarPago = async (venta_id, tipo_pago, monto) => {
  return pool.query(
    "INSERT INTO pagos_venta (venta_id, tipo_pago, monto) VALUES ($1, $2, $3)",
    [venta_id, tipo_pago, monto]
  );
};

const obtenerPagosPorVenta = async (venta_id) => {
  const res = await pool.query(
    "SELECT tipo_pago, monto FROM pagos_venta WHERE venta_id = $1",
    [venta_id]
  );
  return res.rows;
};

module.exports = {
  insertarPago,
  obtenerPagosPorVenta,
};
