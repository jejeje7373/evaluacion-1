import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir la carpeta de producción generada por Vite (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Redirigir todas las demás peticiones a index.html (soporte Single Page Application)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Escuchar en 0.0.0.0 para permitir conexiones desde fuera (EC2 / Red local)
app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================================');
  console.log('🌿 HuertoHogar — Servidor Node.js (Express) Ejecutándose');
  console.log(`🚀 Puerto activo: ${PORT}`);
  console.log(`🌐 Local:        http://localhost:${PORT}`);
  console.log(`🌐 Servidor/EC2: http://<IP_PUBLICA_EC2>:${PORT}`);
  console.log('========================================================');
});
