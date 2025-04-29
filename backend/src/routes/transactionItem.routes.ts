import {Router} from 'express';
import * as controller from '../controllers/transactionItem.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: TransactionItems
 *     description: Productos vendidos en cada transacción
 */

/**
 * @swagger
 * /api/transaction-items:
 *   get:
 *     summary: Listar todos los productos vendidos
 *     tags: [TransactionItems]
 *     responses:
 *       200:
 *         description: Lista de productos vendidos
 */
router.get('/transaction-items', controller.getAll);

/**
 * @swagger
 * /api/transaction-items/{id}:
 *   get:
 *     summary: Obtener producto vendido por ID
 *     tags: [TransactionItems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto vendido encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/transaction-items/:id', controller.getById);

/**
 * @swagger
 * /api/transaction-items:
 *   post:
 *     summary: Agregar producto a una venta
 *     tags: [TransactionItems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [transaction_id, product_id, quantity, price_at_sale]
 *             properties:
 *               transaction_id:
 *                 type: integer
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               price_at_sale:
 *                 type: number
 *     responses:
 *       201:
 *         description: Producto registrado en la venta
 */
router.post('/transaction-items', controller.create);

/**
 * @swagger
 * /api/transaction-items/{id}:
 *   put:
 *     summary: Actualizar datos de producto vendido
 *     tags: [TransactionItems]
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
 *               price_at_sale:
 *                 type: number
 *     responses:
 *       200:
 *         description: Producto actualizado
 */
router.put('/transaction-items/:id', controller.update);

/**
 * @swagger
 * /api/transaction-items/{id}:
 *   delete:
 *     summary: Eliminar producto de la venta
 *     tags: [TransactionItems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Producto eliminado
 */
router.delete('/transaction-items/:id', controller.remove);

export default router;
