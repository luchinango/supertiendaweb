import express from 'express';
import { CarritoController } from '../controllers/carritoController';

const router = express.Router();
const carritoController = new CarritoController();

// Rutas mejoradas con mejores prácticas REST
router.post('/carritos', carritoController.crearCarrito.bind(carritoController));
router.post('/carritos/:carritoId/items', carritoController.agregarItem.bind(carritoController));
router.put('/carritos/items/:itemId', carritoController.actualizarCantidadItem.bind(carritoController));
router.delete('/carritos/items/:itemId', carritoController.eliminarItem.bind(carritoController));
router.get('/carritos/:carritoId', carritoController.obtenerCarrito.bind(carritoController));
router.post('/carritos/:carritoId/completar', carritoController.completarCarrito.bind(carritoController));

export default router;