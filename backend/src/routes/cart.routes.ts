import {Router} from 'express';
import * as controller from '../controllers/cart.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Carts
 *     description: Gestión de carritos de compra
 */

/**
 * @swagger
 * /api/carts:
 *   get:
 *     summary: Listar todos los carritos de compra
 *     tags: [Carts]
 *     responses:
 *       200:
 *         description: Lista de carritos
 */
router.get('/carts', controller.getAll);

/**
 * @swagger
 * /api/carts/{id}:
 *   get:
 *     summary: Obtener carrito por ID
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Carrito encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/carts/:id', controller.getById);

/**
 * @swagger
 * /api/carts:
 *   post:
 *     summary: Crear nuevo carrito de compra
 *     tags: [Carts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_id]
 *             properties:
 *               customer_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Carrito creado
 */
router.post('/carts', controller.create);

/**
 * @swagger
 * /api/carts/{id}:
 *   put:
 *     summary: Actualizar carrito
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_id]
 *             properties:
 *               customer_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Carrito actualizado
 */
router.put('/carts/:id', controller.update);

/**
 * @swagger
 * /api/carts/{id}:
 *   delete:
 *     summary: Eliminar carrito
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Carrito eliminado
 */
router.delete('/carts/:id', controller.remove);

export default router;
