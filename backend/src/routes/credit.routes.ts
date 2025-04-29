import { Router } from 'express';
import * as controller from '../controllers/credit.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Credits
 *     description: Gestión de créditos de clientes
 */

/**
 * @swagger
 * /api/credits:
 *   get:
 *     summary: Listar todos los créditos de clientes
 *     tags: [Credits]
 *     responses:
 *       200:
 *         description: Lista de créditos
 */
router.get('/credits', controller.getAll);

/**
 * @swagger
 * /api/credits/{id}:
 *   get:
 *     summary: Obtener crédito de cliente por ID
 *     tags: [Credits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Crédito encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/credits/:id', controller.getById);

/**
 * @swagger
 * /api/credits:
 *   post:
 *     summary: Crear nuevo crédito para cliente
 *     tags: [Credits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Credit'
 *     responses:
 *       201:
 *         description: Crédito creado
 *       400:
 *         description: Cliente ya tiene crédito
 */
router.post('/credits', controller.create);

/**
 * @swagger
 * /api/credits/{id}:
 *   put:
 *     summary: Actualizar crédito de cliente
 *     tags: [Credits]
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
 *             $ref: '#/components/schemas/Credit'
 *     responses:
 *       200:
 *         description: Crédito actualizado
 */
router.put('/credits/:id', controller.update);

/**
 * @swagger
 * /api/credits/{id}:
 *   delete:
 *     summary: Eliminar crédito de cliente
 *     tags: [Credits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Crédito eliminado
 */
router.delete('/credits/:id', controller.remove);

export default router;
