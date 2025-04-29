import {Router} from 'express';
import * as businessController from '../controllers/business.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Businesses
 *     description: Gestión de empresas
 */

/**
 * @swagger
 * /api/businesses:
 *   get:
 *     summary: Listar todas las empresas
 *     tags: [Businesses]
 *     responses:
 *       200:
 *         description: Lista de empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Business'
 */
router.get('/businesses', businessController.getAll);

/**
 * @swagger
 * /api/businesses/{id}:
 *   get:
 *     summary: Obtener empresa por ID
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *       404:
 *         description: No encontrado
 */
router.get('/businesses/:id', businessController.getById);

/**
 * @swagger
 * /api/businesses:
 *   post:
 *     summary: Crear nueva empresa
 *     tags: [Businesses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Business'
 *     responses:
 *       201:
 *         description: Empresa creada
 */
router.post('/businesses', businessController.create);

/**
 * @swagger
 * /api/businesses/{id}:
 *   put:
 *     summary: Actualizar empresa
 *     tags: [Businesses]
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
 *             $ref: '#/components/schemas/Business'
 *     responses:
 *       200:
 *         description: Empresa actualizada
 */
router.put('/businesses/:id', businessController.update);

/**
 * @swagger
 * /api/businesses/{id}:
 *   delete:
 *     summary: Eliminar empresa
 *     tags: [Businesses]
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
router.delete('/businesses/:id', businessController.remove);

export default router;
