import express from 'express';
import { ProveedorController } from '../controllers/proveedorController';

const router = express.Router();
const proveedorController = new ProveedorController();

router.post('/proveedores', proveedorController.createProveedor.bind(proveedorController));
router.get('/proveedores', proveedorController.getAllProveedores.bind(proveedorController));
router.get('/proveedores/:id', proveedorController.getProveedorById.bind(proveedorController));

export default router;