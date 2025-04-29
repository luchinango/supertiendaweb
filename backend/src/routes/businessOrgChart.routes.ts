import { Router } from 'express';
import * as controller from '../controllers/businessOrgChart.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: BusinessOrgCharts
 *     description: Organización interna de empleados
 */

/**
 * @swagger
 * /api/business-org-charts:
 *   get:
 *     summary: Listar todos los organigramas
 *     tags: [BusinessOrgCharts]
 *     responses:
 *       200:
 *         description: Lista de organigramas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BusinessOrgChart'
 */
router.get('/business-org-charts', controller.getAll);

/**
 * @swagger
 * /api/business-org-charts/{id}:
 *   get:
 *     summary: Obtener un organigrama por ID
 *     tags: [BusinessOrgCharts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Organigrama encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/business-org-charts/:id', controller.getById);

/**
 * @swagger
 * /api/business-org-charts:
 *   post:
 *     summary: Crear un nuevo organigrama
 *     tags: [BusinessOrgCharts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessId, userId, position]
 *             properties:
 *               businessId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               position:
 *                 type: string
 *               parentPositionId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Organigrama creado
 */
router.post('/business-org-charts', controller.create);

/**
 * @swagger
 * /api/business-org-charts/{id}:
 *   put:
 *     summary: Actualizar un organigrama
 *     tags: [BusinessOrgCharts]
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
 *               businessId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               position:
 *                 type: string
 *               parentPositionId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Organigrama actualizado
 */
router.put('/business-org-charts/:id', controller.update);

/**
 * @swagger
 * /api/business-org-charts/{id}:
 *   delete:
 *     summary: Eliminar un organigrama
 *     tags: [BusinessOrgCharts]
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
router.delete('/business-org-charts/:id', controller.remove);

export default router;
