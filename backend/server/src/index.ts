import express from 'express';

const app = express();
const PORT = 5001;
const HOST = '192.168.0.23';

app.get('/api', (req, res) => {
  res.json({ message: 'Hola desde el servidor!' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});