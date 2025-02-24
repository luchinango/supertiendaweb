const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const customerRoutes = require('./routes/customers');
const supplierRoutes = require('./routes/suppliers');
const cartRoutes = require('./routes/cart');
const productRoutes = require('./routes/products');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const mermaRoutes = require('./routes/mermas');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchase_orders', purchaseOrderRoutes);
app.use('/api/mermas', mermaRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});