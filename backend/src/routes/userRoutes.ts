import {Router} from 'express';
import * as controller from '../controllers/userController';
import {authenticate} from "../middlewares/authMiddleware";
import {validateRequest} from "../middlewares/validation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios del sistema
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario creado exitosamente
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserError'
 *       409:
 *         description: Usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserError'
 *       500:
 *         description: Error interno del servidor
 */
router.post('/users',
  authenticate(),
  validateRequest('CreateUserRequest'),
  controller.createUser
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener lista de usuarios
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION]
 *         description: Filtrar por estado del usuario
 *       - in: query
 *         name: roleId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del rol
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del negocio
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por username o nombre de empleado
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/users',
  authenticate(),
  controller.getUsers
);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Obtener estadísticas de usuarios
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   $ref: '#/components/schemas/UserStats'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/users/stats',
  authenticate(),
  controller.getUserStats
);

/**
 * @swagger
 * /api/users/check-username/{username}:
 *   get:
 *     summary: Verificar disponibilidad de username
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username a verificar
 *       - in: query
 *         name: excludeId
 *         schema:
 *           type: integer
 *         description: ID de usuario a excluir de la verificación
 *     responses:
 *       200:
 *         description: Verificación completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 available:
 *                   type: boolean
 *       400:
 *         description: Username requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/users/check-username/:username',
  authenticate(),
  controller.checkUsernameAvailability
);

/**
 * @swagger
 * /api/users/username/{username}:
 *   get:
 *     summary: Obtener usuario por username
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserError'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/users/username/:username',
  authenticate(),
  controller.getUserByUsername
);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/users/me',
  authenticate(),
  controller.getCurrentUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserError'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/users/:id',
  authenticate(),
  controller.getUserById
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario actualizado exitosamente
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserError'
 *       500:
 *         description: Error interno del servidor
 */
router.put('/users/:id',
  authenticate(),
  validateRequest('UpdateUserRequest'),
  controller.updateUser
);

/**
 * @swagger
 * /api/users/{id}/change-password:
 *   post:
 *     summary: Cambiar contraseña del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeUserPasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contraseña cambiada exitosamente
 *       400:
 *         description: Contraseña actual incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserError'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/users/:id/change-password',
  authenticate(),
  validateRequest('ChangeUserPasswordRequest'),
  controller.changePassword
);

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   post:
 *     summary: Resetear contraseña del usuario (solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetUserPasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña reseteada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contraseña reseteada exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/users/:id/reset-password',
  authenticate(),
  validateRequest('ResetUserPasswordRequest'),
  controller.resetPassword
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserError'
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/users/:id',
  authenticate(),
  controller.deleteUser
);

export default router;
