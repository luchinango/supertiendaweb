import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import axios from 'axios';

import userRoutes from './routes/user';
import customerRoutes from './routes/customers';
import supplierRoutes from './routes/suppliers';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import purchaseOrderRoutes from './routes/purchaseOrders';
import mermasRouter from './routes/mermas'; // Usa un solo nombre
import creditRoutes from './services/creditService';
import kardexRouter from './routes/kardex';
import perishablesRouter from './routes/perishables';
import reportRoutes from './routes/reports';
import alarmRoutes from './routes/alarms';
import categoriesRouter from './routes/categories';
import cashRegistersRouter from './routes/cashRegisters';


const app = express();

const checkExpiredProducts = async () => {
    try {
        const response = await axios.post('http://localhost:3000/api/mermas/check-expired', {}, {
            headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
        });
        console.log('Mermas automáticas procesadas:', response.data);
    } catch (error) {
        console.error('Error al procesar mermas automáticas:', error);
    }
};

// Ejecutar cada día a las 00:00
cron.schedule('0 0 * * *', checkExpiredProducts);

app.use(express.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/mermas', mermasRouter); // Solo una vez
app.use('/api/credits', creditRoutes);
app.use('/api/kardex', kardexRouter);
app.use('/api/perishables', perishablesRouter);
app.use("/api/reports", reportRoutes);
app.use("/api/alarms", alarmRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/cash-registers', cashRegistersRouter);


// Actualizamos el cron para usar el endpoint
const checkExpiredPerishables = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/perishables/check-expired', {}, {
        headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
      });
      console.log('Perecederos vencidos procesados:', response.data);
    } catch (error) {
      console.error('Error al procesar perecederos vencidos:', error);
    }
  };
  
  cron.schedule('0 0 * * *', checkExpiredPerishables);

const PORT: number = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Generación de token de prueba
import { generateToken } from './middleware/auth';
import { User as UserModel } from './models/user';

export interface User {
    id: number;
    username: string;
    email: string;
    role_id: number;
    password: string;
    first_name: string;
    last_name: string;
}

const testUser: User & { role?: string } = {
    id: 1,
    username: 'admin',
    email: 'admin@tienda.com',
    role_id: 1,
    role: 'admin',
    password: 'hashed_password',
    first_name: 'Admin',
    last_name: 'User'
};

const token = generateToken(testUser);
console.log('Token generado:', token);