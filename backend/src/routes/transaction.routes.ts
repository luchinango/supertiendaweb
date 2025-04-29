import {Router} from 'express';
import * as controller from '../controllers/transaction.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Transactions
 *     description: Gestión de ventas realizadas
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Listar todas las ventas
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Lista de ventas
 */
router.get('/transactions', controller.getAll);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Obtener venta por ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta encontrada
 *       404:
 *         description: No encontrada
 */
router.get('/transactions/:id', controller.getById);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Registrar una nueva venta
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Venta registrada
 */
router.post('/transactions', controller.create);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Actualizar datos de una venta
 *     tags: [Transactions]
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
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Venta actualizada
 */
router.put('/transactions/:id', controller.update);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Eliminar venta
 *     tags: [Transactions]
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
router.delete('/transactions/:id', controller.remove);

export default router;
