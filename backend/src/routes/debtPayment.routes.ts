import {Router} from 'express';
import * as controller from '../controllers/debtPayment.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: DebtPayments
 *     description: Pagos de deudas a proveedores
 */

/**
 * @swagger
 * /api/debt-payments:
 *   get:
 *     summary: Listar todos los pagos de deudas
 *     tags: [DebtPayments]
 *     responses:
 *       200:
 *         description: Lista de pagos de deudas
 */
router.get('/debt-payments', controller.getAll);

/**
 * @swagger
 * /api/debt-payments/{id}:
 *   get:
 *     summary: Obtener pago de deuda por ID
 *     tags: [DebtPayments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pago encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/debt-payments/:id', controller.getById);

/**
 * @swagger
 * /api/debt-payments:
 *   post:
 *     summary: Registrar un pago de deuda
 *     tags: [DebtPayments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [debt_id, amount]
 *             properties:
 *               debt_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Pago registrado
 */
router.post('/debt-payments', controller.create);

/**
 * @swagger
 * /api/debt-payments/{id}:
 *   put:
 *     summary: Actualizar pago de deuda
 *     tags: [DebtPayments]
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
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pago actualizado
 */
router.put('/debt-payments/:id', controller.update);

/**
 * @swagger
 * /api/debt-payments/{id}:
 *   delete:
 *     summary: Eliminar pago de deuda
 *     tags: [DebtPayments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Pago eliminado exitosamente
 */
router.delete('/debt-payments/:id', controller.remove);

export default router;
