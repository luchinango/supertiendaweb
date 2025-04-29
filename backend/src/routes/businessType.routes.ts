import {Router} from 'express';
import * as businessTypeController from '../controllers/businessType.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: BusinessTypes
 *     description: Tipos de negocios
 */

/**
 * @swagger
 * /api/business-types:
 *   get:
 *     summary: Listar todos los tipos de negocio
 *     tags: [BusinessTypes]
 *     responses:
 *       200:
 *         description: Lista de tipos de negocio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BusinessType'
 */
router.get('/business-types', businessTypeController.getAll);

/**
 * @swagger
 * /api/business-types/{id}:
 *   get:
 *     summary: Obtener tipo de negocio por ID
 *     tags: [BusinessTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/business-types/:id', businessTypeController.getById);

/**
 * @swagger
 * /api/business-types:
 *   post:
 *     summary: Crear tipo de negocio
 *     tags: [BusinessTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusinessType'
 *     responses:
 *       201:
 *         description: Tipo creado
 */
router.post('/business-types', businessTypeController.create);

/**
 * @swagger
 * /api/business-types/{id}:
 *   put:
 *     summary: Actualizar tipo de negocio
 *     tags: [BusinessTypes]
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
 *             $ref: '#/components/schemas/BusinessType'
 *     responses:
 *       200:
 *         description: Tipo actualizado
 */
router.put('/business-types/:id', businessTypeController.update);

/**
 * @swagger
 * /api/business-types/{id}:
 *   delete:
 *     summary: Eliminar tipo de negocio
 *     tags: [BusinessTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Tipo eliminado exitosamente
 */
router.delete('/business-types/:id', businessTypeController.remove);

export default router;
