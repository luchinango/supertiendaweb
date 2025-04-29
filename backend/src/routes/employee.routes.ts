import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';

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
router.get('/employees', employeeController.getAll);

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
router.get('/employees/:id', employeeController.getById);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Crear un nuevo empleado
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       201:
 *         description: Empleado creado
 */
router.post('/employees', employeeController.create);

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
router.put('/employees/:id', employeeController.update);

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
router.delete('/employees/:id', employeeController.remove);

export default router;
