import {Router} from 'express';
import * as controller from '../controllers/auditCashRegister.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: AuditCashRegisters
 *     description: Auditoría de acciones sobre cajas
 */

/**
 * @swagger
 * /api/audit-cash-registers:
 *   get:
 *     summary: Listar todas las auditorías de cajas
 *     tags: [AuditCashRegisters]
 *     responses:
 *       200:
 *         description: Lista de auditorías
 */
router.get('/audit-cash-registers', controller.getAll);

/**
 * @swagger
 * /api/audit-cash-registers/{id}:
 *   get:
 *     summary: Obtener auditoría de caja por ID
 *     tags: [AuditCashRegisters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Auditoría encontrada
 *       404:
 *         description: No encontrada
 */
router.get('/audit-cash-registers/:id', controller.getById);

/**
 * @swagger
 * /api/audit-cash-registers:
 *   post:
 *     summary: Registrar acción sobre una caja
 *     tags: [AuditCashRegisters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cashRegisterId, action, userId]
 *             properties:
 *               cashRegisterId:
 *                 type: integer
 *               action:
 *                 type: string
 *               userId:
 *                 type: integer
 *               details:
 *                 type: string
 *     responses:
 *       201:
 *         description: Auditoría registrada
 */
router.post('/audit-cash-registers', controller.create);

/**
 * @swagger
 * /api/audit-cash-registers/{id}:
 *   delete:
 *     summary: Eliminar auditoría de caja
 *     tags: [AuditCashRegisters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Auditoría eliminada exitosamente
 */
router.delete('/audit-cash-registers/:id', controller.remove);

export default router;
