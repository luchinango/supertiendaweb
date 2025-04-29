import {Router} from 'express';
import * as controller from '../controllers/auditLog.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: AuditLogs
 *     description: Auditoría general del sistema
 */

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Listar todas las auditorías
 *     tags: [AuditLogs]
 *     responses:
 *       200:
 *         description: Lista de auditorías
 */
router.get('/audit-logs', controller.getAll);

/**
 * @swagger
 * /api/audit-logs/{id}:
 *   get:
 *     summary: Obtener auditoría por ID
 *     tags: [AuditLogs]
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
router.get('/audit-logs/:id', controller.getById);

/**
 * @swagger
 * /api/audit-logs:
 *   post:
 *     summary: Registrar acción de auditoría
 *     tags: [AuditLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action, entity, entity_id, user_id]
 *             properties:
 *               action:
 *                 type: string
 *               entity:
 *                 type: string
 *               entity_id:
 *                 type: integer
 *               old_values:
 *                 type: object
 *               new_values:
 *                 type: object
 *               user_id:
 *                 type: integer
 *               ip_address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Auditoría registrada
 */
router.post('/audit-logs', controller.create);

/**
 * @swagger
 * /api/audit-logs/{id}:
 *   delete:
 *     summary: Eliminar auditoría
 *     tags: [AuditLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Auditoría eliminada
 */
router.delete('/audit-logs/:id', controller.remove);

export default router;
