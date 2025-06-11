import {Router} from 'express';
import * as controller from '../controllers/purchaseOrderController';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: PurchaseOrders
 *     description: Gestión de órdenes de compra
 */

/**
 * @swagger
 * /api/purchase-orders:
 *   get:
 *     summary: Listar todas las órdenes de compra
 *     tags: [PurchaseOrders]
 *     responses:
 *       200:
 *         description: Lista de órdenes de compra
 */
router.get('/purchase-orders', controller.getAll);

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   get:
 *     summary: Obtener orden de compra por ID
 *     tags: [PurchaseOrders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orden de compra encontrada
 *       404:
 *         description: No encontrada
 */
router.get('/purchase-orders/:id', controller.getById);

/**
 * @swagger
 * /api/purchase-orders:
 *   post:
 *     summary: Crear nueva orden de compra
 *     tags: [PurchaseOrders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchaseOrder'
 *     responses:
 *       201:
 *         description: Orden de compra creada
 */
router.post('/purchase-orders', controller.create);

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   put:
 *     summary: Actualizar orden de compra
 *     tags: [PurchaseOrders]
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
 *             $ref: '#/components/schemas/PurchaseOrder'
 *     responses:
 *       200:
 *         description: Orden de compra actualizada
 */
router.put('/purchase-orders/:id', controller.update);

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   delete:
 *     summary: Eliminar orden de compra
 *     tags: [PurchaseOrders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Orden eliminada exitosamente
 */
router.delete('/purchase-orders/:id', controller.remove);

export default router;
