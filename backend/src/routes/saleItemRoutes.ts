import { Router } from 'express';
import * as controller from '../controllers/saleItemController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: SaleItems
 *     description: Gestión de ítems de venta
 */

/**
 * @swagger
 * /api/sale-items:
 *   get:
 *     summary: Listar todos los ítems de venta
 *     tags: [SaleItems]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ítems de venta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SaleItem'
 */
router.get('/sale-items', authenticate(['ADMIN', 'MANAGER', 'CASHIER']), controller.getAll);

/**
 * @swagger
 * /api/sale-items/{id}:
 *   get:
 *     summary: Obtener ítem de venta por ID
 *     tags: [SaleItems]
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
 *         description: Ítem de venta encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaleItem'
 *       404:
 *         description: Ítem de venta no encontrado
 */
router.get('/sale-items/:id', authenticate(['ADMIN', 'MANAGER', 'CASHIER']), controller.getById);

/**
 * @swagger
 * /api/sale-items:
 *   post:
 *     summary: Crear un nuevo ítem de venta
 *     tags: [SaleItems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - saleId
 *               - productId
 *               - quantity
 *               - unitPrice
 *             properties:
 *               saleId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 *               taxRate:
 *                 type: number
 *                 default: 13
 *               discountAmount:
 *                 type: number
 *                 default: 0
 *     responses:
 *       201:
 *         description: Ítem de venta creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaleItem'
 */
router.post('/sale-items', authenticate(['ADMIN', 'MANAGER', 'CASHIER']), controller.create);

/**
 * @swagger
 * /api/sale-items/{id}:
 *   put:
 *     summary: Actualizar ítem de venta
 *     tags: [SaleItems]
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
 *               quantity:
 *                 type: integer
 *               unit_price:
 *                 type: number
 *               tax_rate:
 *                 type: number
 *               discount_amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Ítem de venta actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaleItem'
 */
router.put('/sale-items/:id', authenticate(['ADMIN', 'MANAGER']), controller.update);

/**
 * @swagger
 * /api/sale-items/{id}:
 *   delete:
 *     summary: Eliminar ítem de venta
 *     tags: [SaleItems]
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
 *         description: Ítem de venta eliminado exitosamente
 */
router.delete('/sale-items/:id', authenticate(['ADMIN', 'MANAGER']), controller.remove);

/**
 * @swagger
 * /api/sale-items/sale/{saleId}:
 *   get:
 *     summary: Obtener ítems de venta por venta
 *     tags: [SaleItems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de ítems de la venta
 */
router.get('/sale-items/sale/:saleId', authenticate(['ADMIN', 'MANAGER', 'CASHIER']), controller.getBySale);

/**
 * @swagger
 * /api/sale-items/product/{productId}:
 *   get:
 *     summary: Obtener ítems de venta por producto
 *     tags: [SaleItems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de ítems del producto
 */
router.get('/sale-items/product/:productId', authenticate(['ADMIN', 'MANAGER', 'CASHIER']), controller.getByProduct);

export default router;