import {Router} from 'express';
import * as controller from '../controllers/cartItem.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: CartItems
 *     description: Productos dentro de carritos de compra
 */

/**
 * @swagger
 * /api/cart-items:
 *   get:
 *     summary: Listar todos los ítems de carritos
 *     tags: [CartItems]
 *     responses:
 *       200:
 *         description: Lista de ítems
 */
router.get('/cart-items', controller.getAll);

/**
 * @swagger
 * /api/cart-items/{id}:
 *   get:
 *     summary: Obtener ítem de carrito por ID
 *     tags: [CartItems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ítem encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/cart-items/:id', controller.getById);

/**
 * @swagger
 * /api/cart-items:
 *   post:
 *     summary: Agregar producto al carrito
 *     tags: [CartItems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cart_id, product_id, quantity, price_at_time]
 *             properties:
 *               cart_id:
 *                 type: integer
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               price_at_time:
 *                 type: number
 *     responses:
 *       201:
 *         description: Ítem agregado
 */
router.post('/cart-items', controller.create);

/**
 * @swagger
 * /api/cart-items/{id}:
 *   put:
 *     summary: Actualizar producto en carrito
 *     tags: [CartItems]
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
 *             properties:
 *               quantity:
 *                 type: integer
 *               price_at_time:
 *                 type: number
 *     responses:
 *       200:
 *         description: Ítem actualizado
 */
router.put('/cart-items/:id', controller.update);

/**
 * @swagger
 * /api/cart-items/{id}:
 *   delete:
 *     summary: Eliminar ítem del carrito
 *     tags: [CartItems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Ítem eliminado
 */
router.delete('/cart-items/:id', controller.remove);

export default router;
