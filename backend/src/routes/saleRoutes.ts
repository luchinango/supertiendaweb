import { Router } from 'express';
import * as controller from '../controllers/saleController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Sales
 *     description: Gestión de ventas
 */

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Listar todas las ventas
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sale'
 */
router.get('/sales', authenticate(['ADMIN', 'MANAGER', 'CASHIER']), controller.getAll);

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Obtener venta por ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Venta no encontrada
 */
router.get('/sales/:id', authenticate(['ADMIN', 'MANAGER', 'CASHIER']), controller.getById);

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Crear una nueva venta
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_id
 *               - cart_id
 *               - user_id
 *               - payment_method
 *             properties:
 *               business_id:
 *                 type: integer
 *               cart_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               customer_id:
 *                 type: integer
 *               payment_method:
 *                 type: string
 *                 enum: [CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, MOBILE_PAYMENT, GIFT_CARD, LOYALTY_POINTS, QR_PAYMENT, ELECTRONIC_WALLET]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Venta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 */
router.post('/sales', authenticate(['ADMIN', 'MANAGER', 'CASHIER']), controller.create);

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Actualizar venta
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
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
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED]
 *               payment_status:
 *                 type: string
 *                 enum: [PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Venta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 */
router.put('/sales/:id', authenticate(['ADMIN', 'MANAGER']), controller.update);

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Eliminar venta
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Venta eliminada exitosamente
 */
router.delete('/sales/:id', authenticate(['ADMIN']), controller.remove);

/**
 * @swagger
 * /api/sales/business/{businessId}:
 *   get:
 *     summary: Obtener ventas por negocio
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de ventas del negocio
 */
router.get('/sales/business/:businessId', authenticate(['ADMIN', 'MANAGER', 'CASHIER']), controller.getByBusiness);

/**
 * @swagger
 * /api/sales/customer/{customerId}:
 *   get:
 *     summary: Obtener ventas por cliente
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de ventas del cliente
 */
router.get('/sales/customer/:customerId', authenticate(['ADMIN', 'MANAGER', 'CASHIER']), controller.getByCustomer);

/**
 * @swagger
 * /api/sales/date-range:
 *   get:
 *     summary: Obtener ventas por rango de fechas
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de ventas en el rango de fechas
 */
router.get('/sales/date-range', authenticate(['ADMIN', 'MANAGER', 'CASHIER']), controller.getByDateRange);

/**
 * @swagger
 * /api/sales/process:
 *   post:
 *     summary: Procesar venta desde carrito
 *     tags: [Sales]
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
 *               - paymentMethod
 *             properties:
 *               cartId:
 *                 type: integer
 *               customerId:
 *                 type: integer
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, MOBILE_PAYMENT, GIFT_CARD, LOYALTY_POINTS, QR_PAYMENT, ELECTRONIC_WALLET]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Venta procesada exitosamente
 */
router.post('/sales/process', authenticate(['ADMIN', 'MANAGER', 'CASHIER']), controller.processSale);

/**
 * @swagger
 * /api/sales/{id}/cancel:
 *   post:
 *     summary: Cancelar venta
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Venta cancelada exitosamente
 */
router.post('/sales/:id/cancel', authenticate(['ADMIN', 'MANAGER']), controller.cancelSale);

/**
 * @swagger
 * /api/sales/{id}/refund:
 *   post:
 *     summary: Reembolsar venta
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - amount
 *               - reason
 *             properties:
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reembolso procesado exitosamente
 */
router.post('/sales/:id/refund', authenticate(['ADMIN', 'MANAGER']), controller.refundSale);

export default router;