const app = require('./src/app');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
const fs = require('fs');
console.log("🔒 Leyendo certificado:", fs.readFileSync('./src/afip/certs/certificado.pem', 'utf8'));
