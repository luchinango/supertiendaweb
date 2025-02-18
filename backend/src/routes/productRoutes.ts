import express from 'express';
import { ProductController } from '../controllers/productController';
import { validateProduct } from '../utils/validation';

const router = express.Router();
const productController = new ProductController();

// Middleware de autenticación (ejemplo)
const authenticate = (req: any, res: any, next: any) => {
    // Lógica de autenticación JWT/OAuth aquí
    next();
};

// CRUD Productos
router.post('/productos', validateProduct, productController.createProduct);
router.get('/productos', productController.getAllProducts.bind(productController));
router.get('/productos/:id', productController.getProductById);
router.put('/productos/:id', authenticate, validateProduct, productController.updateProduct);
router.delete('/productos/:id', authenticate, productController.deleteProduct);

export default router;

