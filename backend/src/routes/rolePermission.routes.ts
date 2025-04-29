import { Router } from 'express';
import * as controller from '../controllers/rolePermission.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: RolePermissions
 *     description: Asignación de permisos a roles
 */

/**
 * @swagger
 * /api/role-permissions:
 *   get:
 *     summary: Listar todas las asignaciones de permisos a roles
 *     tags: [RolePermissions]
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RolePermission'
 */
router.get('/role-permissions', controller.getAll);

/**
 * @swagger
 * /api/role-permissions/{id}:
 *   get:
 *     summary: Obtener una asignación por ID
 *     tags: [RolePermissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Asignación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolePermission'
 *       404:
 *         description: No encontrada
 */
router.get('/role-permissions/:id', controller.getById);

/**
 * @swagger
 * /api/role-permissions:
 *   post:
 *     summary: Crear una nueva asignación rol-permiso
 *     tags: [RolePermissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleId, permissionId]
 *             properties:
 *               roleId:
 *                 type: integer
 *                 example: 1
 *               permissionId:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Asignación creada
 */
router.post('/role-permissions', controller.create);

/**
 * @swagger
 * /api/role-permissions/{id}:
 *   put:
 *     summary: Actualizar una asignación rol-permiso
 *     tags: [RolePermissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleId, permissionId]
 *             properties:
 *               roleId:
 *                 type: integer
 *               permissionId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Asignación actualizada
 */
router.put('/role-permissions/:id', controller.update);

/**
 * @swagger
 * /api/role-permissions/{id}:
 *   delete:
 *     summary: Eliminar una asignación rol-permiso
 *     tags: [RolePermissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Eliminado correctamente
 */
router.delete('/role-permissions/:id', controller.remove);

export default router;
