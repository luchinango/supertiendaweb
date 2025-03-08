import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

import userRoutes from './routes/user';
import customerRoutes from './routes/customers';
import supplierRoutes from './routes/suppliers';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import purchaseOrderRoutes from './routes/purchaseOrders';
import mermaRoutes from './routes/mermas';  
import creditRoutes from './services/creditService';
import kardexRouter from './routes/kardex';

//import consignmentRoutes from './routes/consignments';

const app = express();
app.use(express.json());

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/mermas', mermaRoutes);  
app.use('/api/credits', creditRoutes);
app.use('/api/kardex', kardexRouter);

const PORT: number = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

