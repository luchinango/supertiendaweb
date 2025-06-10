import { Router, RequestHandler } from 'express'
import { authenticate } from '../middlewares/authMiddleware'
import * as userController from '../controllers/user.controller'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/me', authenticate(), userController.getCurrentUser)

 
export default router
