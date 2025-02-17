import express from 'express';

const app = express();
const HOST = '192.168.0.23';

const userRoutes = require('./routes/users');
require('dotenv').config();

app.get('/api', (req, res) => {
  res.json({ message: 'Hola desde el servidor!' });
});



// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);

// Sincronizar base de datos
const { sequelize } = require('./models');
sequelize.sync().then(() => {
  console.log('Base de datos conectada');
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});

function cors(): any {
  throw new Error('Function not implemented.');
}
