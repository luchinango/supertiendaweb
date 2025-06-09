import {Router} from 'express';
import * as controller from '../controllers/cart.controller';
import {authenticate} from '../middlewares/authMiddleware';

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

/**
 * @swagger
 * /api/businesses/{businessId}/cart:
 *   get:
 *     summary: Obtener carrito activo
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Carrito no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/businesses/:businessId/cart', authenticate(), controller.getActiveCart);

/**
 * @swagger
 * /api/businesses/{businessId}/cart:
 *   post:
 *     summary: Crear nuevo carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *     responses:
 *       201:
 *         description: Carrito creado exitosamente
 *       401:
 *         description: No autorizado
 *       409:
 *         description: Ya existe un carrito activo
 *       500:
 *         description: Error del servidor
 */
router.post('/businesses/:businessId/cart', authenticate(), controller.createCart);

/**
 * @swagger
 * /api/cart/{cartId}/items:
 *   post:
 *     summary: Agregar item al carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del carrito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Item agregado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Carrito o producto no encontrado
 *       409:
 *         description: Stock insuficiente
 *       500:
 *         description: Error del servidor
 */
router.post('/cart/:cartId/items', authenticate(), controller.addItem);

/**
 * @swagger
 * /api/cart/{cartId}/items/{productId}:
 *   put:
 *     summary: Actualizar cantidad de item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del carrito
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cantidad actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Item no encontrado
 *       409:
 *         description: Stock insuficiente
 *       500:
 *         description: Error del servidor
 */
router.put('/cart/:cartId/items/:productId', authenticate(), controller.updateItemQuantity);

/**
 * @swagger
 * /api/cart/{cartId}/items/{productId}:
 *   delete:
 *     summary: Eliminar item del carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del carrito
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       204:
 *         description: Item eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Item no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/cart/:cartId/items/:productId', authenticate(), controller.removeItem);

/**
 * @swagger
 * /api/cart/{cartId}/clear:
 *   delete:
 *     summary: Vaciar carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del carrito
 *     responses:
 *       204:
 *         description: Carrito vaciado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Carrito no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/cart/:cartId/clear', authenticate(), controller.clearCart);

/**
 * @swagger
 * /api/cart/{cartId}/total:
 *   get:
 *     summary: Obtener total del carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del carrito
 *     responses:
 *       200:
 *         description: Total obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Carrito no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/cart/:cartId/total', authenticate(), controller.getCartTotal);

export default router;
