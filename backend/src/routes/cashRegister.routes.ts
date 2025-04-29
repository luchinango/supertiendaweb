import {Router} from 'express';
import * as controller from '../controllers/cashRegister.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: CashRegisters
 *     description: Gestión de apertura y cierre de cajas
 */

/**
 * @swagger
 * /api/cash-registers:
 *   get:
 *     summary: Listar todas las cajas
 *     tags: [CashRegisters]
 *     responses:
 *       200:
 *         description: Lista de cajas
 */
router.get('/cash-registers', controller.getAll);

/**
 * @swagger
 * /api/cash-registers/{id}:
 *   get:
 *     summary: Obtener una caja por ID
 *     tags: [CashRegisters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Caja encontrada
 *       404:
 *         description: No encontrado
 */
router.get('/cash-registers/:id', controller.getById);

/**
 * @swagger
 * /api/cash-registers:
 *   post:
 *     summary: Abrir una nueva caja
 *     tags: [CashRegisters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, opening_amount]
 *             properties:
 *               user_id:
 *                 type: integer
 *               opening_amount:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Caja abierta
 */
router.post('/cash-registers', controller.create);

/**
 * @swagger
 * /api/cash-registers/{id}:
 *   put:
 *     summary: Cerrar caja
 *     tags: [CashRegisters]
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
 *               closing_amount:
 *                 type: number
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Caja actualizada
 */
router.put('/cash-registers/:id', controller.update);

/**
 * @swagger
 * /api/cash-registers/{id}:
 *   delete:
 *     summary: Eliminar caja
 *     tags: [CashRegisters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Caja eliminada
 */
router.delete('/cash-registers/:id', controller.remove);

export default router;
