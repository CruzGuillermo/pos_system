const { getAfipClient } = require('./afip.service');

const pingAfip = async (req, res) => {
  try {
    const afip = getAfipClient();

    // Solicita el último comprobante del punto de venta 1, tipo comprobante 6 (Factura C)
    const lastVoucher = await afip.ElectronicBilling.getLastVoucher(1, 6);

    res.json({
      success: true,
      message: 'Conexión con AFIP exitosa ✅',
      lastVoucher,
    });
  } catch (error) {
    console.error('Error al conectar con AFIP:', error);

    if (error.response) {
      return res.status(500).json({ success: false, error: error.response.data });
    }
    res.status(500).json({ success: false, error: error.message || error });
  }
};

module.exports = { pingAfip };
