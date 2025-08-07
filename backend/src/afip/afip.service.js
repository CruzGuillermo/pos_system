const Afip = require('@afipsdk/afip.js');

const afip = new Afip({
  CUIT: 20111111112, // CUIT del responsable inscripto
  environment: 'homologacion', // o 'produccion'
  cert: `${__dirname}/cert.pem`,
  key: `${__dirname}/key.pem`,
  res_folder: `${__dirname}/tmp/`, // carpeta donde guarda TA
});


function getAfipClient() {
  return new Afip({
    CUIT: 20111111112,
    cert: './certificado/cert.pem',
    key: './certificado/key.pem',
    production: false, // o true según ambiente
  });
}

module.exports = { getAfipClient };

