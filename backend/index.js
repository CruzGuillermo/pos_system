const app = require('./src/app');
const db = require('./src/config/db');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

// Este bloque mantiene viva la conexión con la base de datos
setInterval(async () => {
  const client = await db.pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('⏱️ Ping a la base de datos exitoso');
  } catch (error) {
    console.error('⚠️ Error en ping a la base de datos:', error);
  } finally {
    client.release();
  }
}, 5 * 60 * 1000);

// Solo para debug del certificado
console.log("🔒 Leyendo certificado:", fs.readFileSync('./src/afip/certs/certificado.pem', 'utf8'));
