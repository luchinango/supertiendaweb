import { Router } from 'express';
import * as controller from '../controllers/purchaseOrderItemController';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: PurchaseOrderItems
 *     description: Detalle de productos en órdenes de compra
 */

/**
 * @swagger
 * /api/purchase-order-items:
 *   get:
 *     summary: Listar todos los ítems de órdenes de compra
 *     tags: [PurchaseOrderItems]
 *     responses:
 *       200:
 *         description: Lista de ítems
 */
router.get('/purchase-order-items', controller.getAll);

/**
 * @swagger
 * /api/purchase-order-items/{id}:
 *   get:
 *     summary: Obtener ítem de orden de compra por ID
 *     tags: [PurchaseOrderItems]
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
router.get('/purchase-order-items/:id', controller.getById);

/**
 * @swagger
 * /api/purchase-order-items:
 *   post:
 *     summary: Crear nuevo ítem en orden de compra
 *     tags: [PurchaseOrderItems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchaseOrderItem'
 *     responses:
 *       201:
 *         description: Ítem creado
 */
router.post('/purchase-order-items', controller.create);

/**
 * @swagger
 * /api/purchase-order-items/{id}:
 *   put:
 *     summary: Actualizar ítem de orden de compra
 *     tags: [PurchaseOrderItems]
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
 *             $ref: '#/components/schemas/PurchaseOrderItem'
 *     responses:
 *       200:
 *         description: Ítem actualizado
 */
router.put('/purchase-order-items/:id', controller.update);

/**
 * @swagger
 * /api/purchase-order-items/{id}:
 *   delete:
 *     summary: Eliminar ítem de orden de compra
 *     tags: [PurchaseOrderItems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Eliminado exitosamente
 */
router.delete('/purchase-order-items/:id', controller.remove);

export default router;
