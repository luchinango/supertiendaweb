import { Router } from 'express';
import * as permissionController from '../controllers/permission.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Permissions
 *     description: Endpoints para gestión de permisos del sistema
 */

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Obtener todos los permisos
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de permisos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Permission'
 */
router.get('/permissions', permissionController.getAll);

/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     summary: Obtener un permiso por ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permiso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       404:
 *         description: Permiso no encontrado
 */
router.get('/permissions/:id', permissionController.getById);

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Crear un nuevo permiso
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Permission'
 *     responses:
 *       201:
 *         description: Permiso creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Error de validación o datos inválidos
 */
router.post('/permissions', permissionController.create);

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: Actualizar un permiso existente
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/Permission'
 *     responses:
 *       200:
 *         description: Permiso actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       404:
 *         description: Permiso no encontrado
 */
router.put('/permissions/:id', permissionController.update);

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Eliminar un permiso por ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Permiso eliminado correctamente
 *       404:
 *         description: Permiso no encontrado
 */
router.delete('/permissions/:id', permissionController.remove);

export default router;
