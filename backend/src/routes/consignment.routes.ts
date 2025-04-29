import { Router } from 'express';
import * as controller from '../controllers/consignment.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Consignments
 *     description: Gestión de consignaciones
 */

/**
 * @swagger
 * /api/consignments:
 *   get:
 *     summary: Listar todas las consignaciones
 *     tags: [Consignments]
 *     responses:
 *       200:
 *         description: Lista de consignaciones
 */
router.get('/consignments', controller.getAll);

/**
 * @swagger
 * /api/consignments/{id}:
 *   get:
 *     summary: Obtener consignación por ID
 *     tags: [Consignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Consignación encontrada
 *       404:
 *         description: No encontrado
 */
router.get('/consignments/:id', controller.getById);

/**
 * @swagger
 * /api/consignments:
 *   post:
 *     summary: Crear nueva consignación
 *     tags: [Consignments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Consignment'
 *     responses:
 *       201:
 *         description: Consignación creada
 */
router.post('/consignments', controller.create);

/**
 * @swagger
 * /api/consignments/{id}:
 *   put:
 *     summary: Actualizar consignación
 *     tags: [Consignments]
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
 *             $ref: '#/components/schemas/Consignment'
 *     responses:
 *       200:
 *         description: Consignación actualizada
 */
router.put('/consignments/:id', controller.update);

/**
 * @swagger
 * /api/consignments/{id}:
 *   delete:
 *     summary: Eliminar consignación
 *     tags: [Consignments]
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
router.delete('/consignments/:id', controller.remove);

export default router;
