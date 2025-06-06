import { Router } from 'express';
import * as userController from '../controllers/user.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Gestión de usuarios
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/users', userController.getAll);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/users/:id', userController.getById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, role_id]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role_id:
 *                 type: integer
 *               status:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Username duplicado o datos inválidos
 */
router.post('/users', userController.create);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
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
 *             properties:
 *               role_id:
 *                 type: integer
 *               status:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               avatar_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/users/:id', userController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Eliminado exitosamente
 */
router.delete('/users/:id', userController.remove);

export default router;
