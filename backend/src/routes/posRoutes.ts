import {Router} from 'express';
import * as controller from '../controllers/posController';
import {authenticate} from '../middlewares/authMiddleware';

const router = Router();

// router.use(authenticate(['ADMIN', 'MANAGER', 'CASHIER']));

/**
 * @swagger
 * /api/pos/start-sale:
 *   post:
 *     summary: Iniciar una nueva venta
 *     description: Crea un nuevo carrito activo para comenzar una venta
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Venta iniciada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/start-sale', authenticate(), controller.startSale);

/**
 * @swagger
 * /api/pos/add-item:
 *   post:
 *     summary: Agregar producto al carrito
 *     description: Agrega un producto al carrito con validación de stock
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartId
 *               - productId
 *               - quantity
 *             properties:
 *               cartId:
 *                 type: integer
 *                 description: ID del carrito
 *               productId:
 *                 type: integer
 *                 description: ID del producto
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Cantidad a agregar
 *     responses:
 *       200:
 *         description: Producto agregado exitosamente
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
router.post('/add-item', authenticate(), controller.addItemToCart);

/**
 * @swagger
 * /api/pos/cart/{cartId}/item/{productId}:
 *   delete:
 *     summary: Remover producto del carrito
 *     description: Elimina un producto específico del carrito
 *     tags: [POS]
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
 *       200:
 *         description: Producto removido exitosamente
 *       404:
 *         description: Carrito o producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/cart/:cartId/item/:productId', authenticate(), controller.removeItemFromCart);

/**
 * @swagger
 * /api/pos/cart/{cartId}/item/{productId}:
 *   put:
 *     summary: Actualizar cantidad de un producto
 *     description: Modifica la cantidad de un producto en el carrito
 *     tags: [POS]
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
 *                 description: Nueva cantidad
 *     responses:
 *       200:
 *         description: Cantidad actualizada exitosamente
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
router.put('/cart/:cartId/item/:productId', authenticate(), controller.updateItemQuantity);

/**
 * @swagger
 * /api/pos/cart/{cartId}/summary:
 *   get:
 *     summary: Obtener resumen de la venta actual
 *     description: Retorna el resumen completo del carrito con productos y totales
 *     tags: [POS]
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
 *         description: Resumen obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Carrito no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/cart/:cartId/summary', authenticate(), controller.getSaleSummary);

/**
 * @swagger
 * /api/pos/cart/{cartId}/complete:
 *   post:
 *     summary: Completar venta
 *     description: Finaliza la venta, genera factura y actualiza inventario
 *     tags: [POS]
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
 *               - paymentMethod
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, MOBILE_PAYMENT]
 *                 description: Método de pago
 *               notes:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       200:
 *         description: Venta completada exitosamente
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
router.post('/cart/:cartId/complete', authenticate(), controller.completeSale);

/**
 * @swagger
 * /api/pos/cart/{cartId}/cancel:
 *   post:
 *     summary: Cancelar venta
 *     description: Cancela la venta y marca el carrito como abandonado
 *     tags: [POS]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Razón de la cancelación
 *     responses:
 *       200:
 *         description: Venta cancelada exitosamente
 *       500:
 *         description: Error del servidor
 */
router.post('/cart/:cartId/cancel', authenticate(), controller.cancelSale);

/**
 * @swagger
 * /api/pos/search-products:
 *   get:
 *     summary: Buscar productos
 *     description: Busca productos por código o nombre
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda (código o nombre del producto)
 *     responses:
 *       200:
 *         description: Productos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Query requerida
 *       500:
 *         description: Error del servidor
 */
router.get('/search-products', authenticate(), controller.searchProducts);

/**
 * @swagger
 * /api/pos/quick-products:
 *   get:
 *     summary: Obtener productos rápidos
 *     description: Retorna los productos más vendidos o frecuentes
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Número máximo de productos a retornar
 *     responses:
 *       200:
 *         description: Productos rápidos obtenidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Error del servidor
 */
router.get('/quick-products', authenticate(), controller.getQuickProducts);

/**
 * @swagger
 * /api/pos/cart/{cartId}/assign-customer:
 *   post:
 *     summary: Asignar cliente al carrito
 *     description: Asigna un cliente al carrito para facturación
 *     tags: [POS]
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
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: ID del cliente a asignar
 *     responses:
 *       200:
 *         description: Cliente asignado exitosamente
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error del servidor
 */
router.post('/cart/:cartId/assign-customer', authenticate(), controller.assignCustomerToCart);

export default router;
