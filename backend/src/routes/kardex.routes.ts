import { Router } from 'express';
import * as controller from '../controllers/kardex.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Kardex
 *     description: Gestión de movimientos de stock
 */

/**
 * @swagger
 * /api/kardex:
 *   get:
 *     summary: Listar todos los movimientos de stock
 *     tags: [Kardex]
 *     responses:
 *       200:
 *         description: Lista de movimientos
 */
router.get('/kardex', controller.getAll);

/**
 * @swagger
 * /api/kardex/{id}:
 *   get:
 *     summary: Obtener movimiento de stock por ID
 *     tags: [Kardex]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Movimiento encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/kardex/:id', controller.getById);

/**
 * @swagger
 * /api/kardex:
 *   post:
 *     summary: Crear nuevo movimiento de stock
 *     tags: [Kardex]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Kardex'
 *     responses:
 *       201:
 *         description: Movimiento creado
 */
router.post('/kardex', controller.create);

/**
 * @swagger
 * /api/kardex/{id}:
 *   put:
 *     summary: Actualizar movimiento de stock
 *     tags: [Kardex]
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
 *             $ref: '#/components/schemas/Kardex'
 *     responses:
 *       200:
 *         description: Movimiento actualizado
 */
router.put('/kardex/:id', controller.update);

/**
 * @swagger
 * /api/kardex/{id}:
 *   delete:
 *     summary: Eliminar movimiento de stock
 *     tags: [Kardex]
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
router.delete('/kardex/:id', controller.remove);

export default router;
