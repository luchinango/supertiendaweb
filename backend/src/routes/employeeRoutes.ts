import {Router} from 'express';
import * as controller from '../controllers/employeeController';
import {authenticate} from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Employees
 *     description: Endpoints para gestión de empleados
 */

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Obtener todos los empleados
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: Lista de empleados
 */
router.get('/employees', controller.getAll);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Obtener un empleado por ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Datos del empleado
 *       404:
 *         description: No encontrado
 */
router.get('/employees/:id', controller.getById);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Crear un nuevo empleado
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - start_date
 *               - status
 *               - gender
 *               - email
 *               - address
 *               - mobile_phone
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               position:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, ON_LEAVE, TERMINATED]
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, UNSPECIFIED]
 *               birth_date:
 *                 type: string
 *                 format: date
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               mobile_phone:
 *                 type: string
 *               user_id:
 *                 type: number
 *     responses:
 *       201:
 *         description: Empleado creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       409:
 *         description: Email ya existe o usuario ya tiene empleado asociado
 */
router.post('/employees', authenticate(['ADMIN']), controller.create);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Actualizar empleado por ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       200:
 *         description: Empleado actualizado
 */
router.put('/employees/:id', controller.update);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Eliminar empleado por ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       204:
 *         description: Eliminado exitosamente
 */
router.delete('/employees/:id', controller.remove);

/**
 * @swagger
 * /api/employees/user/{userId}:
 *   get:
 *     tags: [Employees]
 *     summary: Obtener empleado por ID de usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del empleado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Empleado no encontrado
 */
router.get('/employees/user/:userId', authenticate(), controller.getByUserId);

export default router;
