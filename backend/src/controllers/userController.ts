import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  ChangeUserPasswordRequest,
  ResetUserPasswordRequest
} from '../types/userTypes';

const userService = new UserService();

/**
 * Crear un nuevo usuario
 * POST /api/users
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const userData: CreateUserRequest = req.body;

    // Validaciones básicas
    if (!userData.username || !userData.password || !userData.roleId) {
      res.status(400).json({
        error: 'Datos incompletos',
        message: 'Username, password y roleId son requeridos'
      });
      return;
    }

    // Validar longitud de username
    if (userData.username.length < 3 || userData.username.length > 50) {
      res.status(400).json({
        error: 'Username inválido',
        message: 'El username debe tener entre 3 y 50 caracteres'
      });
      return;
    }

    // Validar longitud de password
    if (userData.password.length < 8) {
      res.status(400).json({
        error: 'Contraseña inválida',
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
      return;
    }

    // Verificar si el username ya existe
    const usernameExists = await userService.isUsernameAvailable(userData.username);
    if (!usernameExists) {
      res.status(409).json({
        error: 'Username duplicado',
        message: 'El nombre de usuario ya existe'
      });
      return;
    }

    const user = await userService.createUser(userData);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user
    });
  } catch (error) {
    console.error('Error en createUser:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener usuario por ID
 * GET /api/users/:id
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        error: 'ID inválido',
        message: 'El ID debe ser un número válido'
      });
      return;
    }

    const user = await userService.getUserById(id);

    if (!user) {
      res.status(404).json({
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con ID ${id}`
      });
      return;
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener usuario por username
 * GET /api/users/username/:username
 */
export const getUserByUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({
        error: 'Username requerido',
        message: 'El username es obligatorio'
      });
      return;
    }

    const user = await userService.getUserByUsername(username);

    if (!user) {
      res.status(404).json({
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con username ${username}`
      });
      return;
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Error en getUserByUsername:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener lista de usuarios con filtros
 * GET /api/users
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const filters: UserFilters = {
      status: req.query.status as any,
      roleId: req.query.roleId ? parseInt(req.query.roleId as string) : undefined,
      businessId: req.query.businessId ? parseInt(req.query.businessId as string) : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    };

    // Validar parámetros de paginación
    if (filters.page && filters.page < 1) {
      res.status(400).json({
        error: 'Página inválida',
        message: 'La página debe ser mayor a 0'
      });
      return;
    }

    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      res.status(400).json({
        error: 'Límite inválido',
        message: 'El límite debe estar entre 1 y 100'
      });
      return;
    }

    const result = await userService.getUsers(filters);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en getUsers:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Actualizar usuario
 * PUT /api/users/:id
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData: UpdateUserRequest = req.body;

    if (isNaN(id)) {
      res.status(400).json({
        error: 'ID inválido',
        message: 'El ID debe ser un número válido'
      });
      return;
    }

    // Verificar si el usuario existe
    const userExists = await userService.userExists(id);
    if (!userExists) {
      res.status(404).json({
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con ID ${id}`
      });
      return;
    }

    const user = await userService.updateUser(id, updateData);

    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      user
    });
  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Eliminar usuario (soft delete)
 * DELETE /api/users/:id
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        error: 'ID inválido',
        message: 'El ID debe ser un número válido'
      });
      return;
    }

    // Verificar si el usuario existe
    const userExists = await userService.userExists(id);
    if (!userExists) {
      res.status(404).json({
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con ID ${id}`
      });
      return;
    }

    await userService.deleteUser(id);

    res.status(200).json({
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Cambiar contraseña del usuario
 * POST /api/users/:id/change-password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const passwordData: ChangeUserPasswordRequest = req.body;

    if (isNaN(id)) {
      res.status(400).json({
        error: 'ID inválido',
        message: 'El ID debe ser un número válido'
      });
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      res.status(400).json({
        error: 'Datos incompletos',
        message: 'La contraseña actual y nueva son requeridas'
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      res.status(400).json({
        error: 'Contraseña inválida',
        message: 'La nueva contraseña debe tener al menos 8 caracteres'
      });
      return;
    }

    await userService.changePassword(id, passwordData);

    res.status(200).json({
      message: 'Contraseña cambiada exitosamente'
    });
  } catch (error) {
    console.error('Error en changePassword:', error);

    if (error instanceof Error && error.message.includes('contraseña actual')) {
      res.status(400).json({
        error: 'Contraseña incorrecta',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Resetear contraseña del usuario (para administradores)
 * POST /api/users/:id/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const passwordData: ResetUserPasswordRequest = req.body;

    if (isNaN(id)) {
      res.status(400).json({
        error: 'ID inválido',
        message: 'El ID debe ser un número válido'
      });
      return;
    }

    if (!passwordData.newPassword) {
      res.status(400).json({
        error: 'Contraseña requerida',
        message: 'La nueva contraseña es requerida'
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      res.status(400).json({
        error: 'Contraseña inválida',
        message: 'La nueva contraseña debe tener al menos 8 caracteres'
      });
      return;
    }

    await userService.resetPassword(id, passwordData);

    res.status(200).json({
      message: 'Contraseña reseteada exitosamente'
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener estadísticas de usuarios
 * GET /api/users/stats
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const stats = await userService.getUserStats();

    res.status(200).json({
      stats
    });
  } catch (error) {
    console.error('Error en getUserStats:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Verificar disponibilidad de username
 * GET /api/users/check-username/:username
 */
export const checkUsernameAvailability = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const excludeId = req.query.excludeId ? parseInt(req.query.excludeId as string) : undefined;

    if (!username) {
      res.status(400).json({
        error: 'Username requerido',
        message: 'El username es obligatorio'
      });
      return;
    }

    const isAvailable = await userService.isUsernameAvailable(username, excludeId);

    res.status(200).json({
      username,
      available: isAvailable
    });
  } catch (error) {
    console.error('Error en checkUsernameAvailability:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener usuario actual (mantener compatibilidad)
 * GET /api/users/me
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        error: 'No autenticado',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'Usuario no encontrado'
      });
      return;
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
