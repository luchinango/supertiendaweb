import express from 'express';
import { CarritoController } from '../controllers/carritoController';

const router = express.Router();
const carritoController = new CarritoController();

router.post('/carritos', carritoController.crearCarrito.bind(carritoController));
router.post('/carritos/items', carritoController.agregarItem.bind(carritoController));
router.put('/carritos/items/:itemId', carritoController.actualizarCantidadItem.bind(carritoController));
router.delete('/carritos/items/:itemId', carritoController.eliminarItem.bind(carritoController));
router.get('/carritos/:id', carritoController.obtenerCarrito.bind(carritoController));
router.post('/carritos/:id/completar', carritoController.completarCarrito.bind(carritoController));

export default router;