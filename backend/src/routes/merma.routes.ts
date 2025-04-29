import { Router } from 'express';
import * as controller from '../controllers/merma.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Mermas
 *     description: Gestión de pérdidas o deterioros de productos
 */

/**
 * @swagger
 * /api/mermas:
 *   get:
 *     summary: Listar todas las mermas
 *     tags: [Mermas]
 *     responses:
 *       200:
 *         description: Lista de mermas
 */
router.get('/mermas', controller.getAll);

/**
 * @swagger
 * /api/mermas/{id}:
 *   get:
 *     summary: Obtener merma por ID
 *     tags: [Mermas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Merma encontrada
 *       404:
 *         description: No encontrado
 */
router.get('/mermas/:id', controller.getById);

/**
 * @swagger
 * /api/mermas:
 *   post:
 *     summary: Crear nueva merma
 *     tags: [Mermas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Merma'
 *     responses:
 *       201:
 *         description: Merma creada
 */
router.post('/mermas', controller.create);

/**
 * @swagger
 * /api/mermas/{id}:
 *   put:
 *     summary: Actualizar merma
 *     tags: [Mermas]
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
 *             $ref: '#/components/schemas/Merma'
 *     responses:
 *       200:
 *         description: Merma actualizada
 */
router.put('/mermas/:id', controller.update);

/**
 * @swagger
 * /api/mermas/{id}:
 *   delete:
 *     summary: Eliminar merma
 *     tags: [Mermas]
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
router.delete('/mermas/:id', controller.remove);

export default router;
