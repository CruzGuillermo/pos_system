const app = require('./src/app');
const db = require('./src/config/db');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

// Este bloque mantiene viva la conexión con la base de datos
setInterval(async () => {
  try {
    await db.query('SELECT 1'); // Ping a la base
    console.log('⏱️ Ping a la base de datos exitoso');
  } catch (error) {
    console.error('⚠️ Error en ping a la base de datos:', error);
  }
}, 5 * 60 * 1000); // cada 5 minutos

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

// Solo para debug del certificado
console.log("🔒 Leyendo certificado:", fs.readFileSync('./src/afip/certs/certificado.pem', 'utf8'));
