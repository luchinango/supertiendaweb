/**
 * Esquemas Swagger para Gestión de Usuarios
 */

export const userSchemas = {
  UserBasic: {
    type: 'object',
    properties: {
      id: {type: 'integer', example: 1},
      username: {type: 'string', example: 'juan.perez'},
      phone: {type: 'string', nullable: true, example: '+591 70012345'},
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
        example: 'ACTIVE'
      },
      roleId: {type: 'integer', example: 2},
      createdAt: {type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z'},
      updatedAt: {type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z'},
      lastLogin: {type: 'string', format: 'date-time', nullable: true, example: '2024-01-15T09:00:00Z'}
    },
    required: ['id', 'username', 'status', 'roleId', 'createdAt', 'updatedAt']
  },

  User: {
    type: 'object',
    properties: {
      id: {type: 'integer', example: 1},
      username: {type: 'string', example: 'juan.perez'},
      phone: {type: 'string', nullable: true, example: '+591 70012345'},
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
        example: 'ACTIVE'
      },
      roleId: {type: 'integer', example: 2},
      createdAt: {type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z'},
      updatedAt: {type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z'},
      lastLogin: {type: 'string', format: 'date-time', nullable: true, example: '2024-01-15T09:00:00Z'},
      role: {
        type: 'object',
        properties: {
          id: {type: 'integer', example: 2},
          code: {type: 'string', example: 'EMP'},
          name: {type: 'string', example: 'Empleado'},
          description: {type: 'string', nullable: true, example: 'Empleado del negocio'}
        },
        required: ['id', 'code', 'name']
      },
      employee: {
        type: 'object',
        nullable: true,
        properties: {
          id: {type: 'integer', example: 1},
          firstName: {type: 'string', example: 'Juan'},
          lastName: {type: 'string', nullable: true, example: 'Pérez'},
          position: {type: 'string', example: 'Vendedor'},
          department: {type: 'string', nullable: true, example: 'Ventas'},
          startDate: {type: 'string', format: 'date', example: '2024-01-01'},
          endDate: {type: 'string', format: 'date', nullable: true},
          salary: {type: 'number', nullable: true, example: 5000.00},
          status: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'],
            example: 'ACTIVE'
          },
          gender: {
            type: 'string',
            enum: ['MALE', 'FEMALE', 'OTHER'],
            example: 'MALE'
          },
          birthDate: {type: 'string', format: 'date', nullable: true, example: '1990-05-15'},
          email: {type: 'string', format: 'email', nullable: true, example: 'juan.perez@empresa.com'},
          phone: {type: 'string', nullable: true, example: '+591 70012345'},
          address: {type: 'string', nullable: true, example: 'Av. Principal 123'},
          emergencyContact: {type: 'string', nullable: true, example: 'María Pérez'},
          emergencyPhone: {type: 'string', nullable: true, example: '+591 70054321'},
          ciNumber: {type: 'string', nullable: true, example: '12345678'},
          businessId: {type: 'integer', example: 1}
        },
        required: ['id', 'firstName', 'position', 'startDate', 'status', 'gender', 'businessId']
      }
    },
    required: ['id', 'username', 'status', 'roleId', 'createdAt', 'updatedAt', 'role']
  },

  CreateUserRequest: {
    type: 'object',
    properties: {
      username: {type: 'string', example: 'juan.perez', minLength: 3, maxLength: 50},
      password: {type: 'string', example: 'Contraseña123!', minLength: 8},
      phone: {type: 'string', example: '+591 70012345'},
      roleId: {type: 'integer', example: 2},
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
        example: 'ACTIVE'
      },
      employee: {
        type: 'object',
        properties: {
          firstName: {type: 'string', example: 'Juan', minLength: 2, maxLength: 50},
          lastName: {type: 'string', example: 'Pérez', maxLength: 50},
          position: {type: 'string', example: 'Vendedor', minLength: 2, maxLength: 100},
          department: {type: 'string', example: 'Ventas', maxLength: 100},
          startDate: {type: 'string', format: 'date', example: '2024-01-01'},
          salary: {type: 'number', example: 5000.00, minimum: 0},
          gender: {
            type: 'string',
            enum: ['MALE', 'FEMALE', 'OTHER'],
            example: 'MALE'
          },
          birthDate: {type: 'string', format: 'date', example: '1990-05-15'},
          email: {type: 'string', format: 'email', example: 'juan.perez@empresa.com'},
          phone: {type: 'string', example: '+591 70012345'},
          address: {type: 'string', example: 'Av. Principal 123'},
          emergencyContact: {type: 'string', example: 'María Pérez'},
          emergencyPhone: {type: 'string', example: '+591 70054321'},
          ciNumber: {type: 'string', example: '12345678'},
          businessId: {type: 'integer', example: 1}
        },
        required: ['firstName', 'position', 'startDate', 'gender', 'businessId']
      }
    },
    required: ['username', 'password', 'roleId']
  },

  UpdateUserRequest: {
    type: 'object',
    properties: {
      phone: {type: 'string', example: '+591 70012345'},
      roleId: {type: 'integer', example: 2},
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']
      },
      employee: {
        type: 'object',
        properties: {
          firstName: {type: 'string', example: 'Juan', minLength: 2, maxLength: 50},
          lastName: {type: 'string', example: 'Pérez', maxLength: 50},
          position: {type: 'string', example: 'Vendedor', minLength: 2, maxLength: 100},
          department: {type: 'string', example: 'Ventas', maxLength: 100},
          startDate: {type: 'string', format: 'date', example: '2024-01-01'},
          endDate: {type: 'string', format: 'date'},
          salary: {type: 'number', example: 5000.00, minimum: 0},
          status: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']
          },
          gender: {
            type: 'string',
            enum: ['MALE', 'FEMALE', 'OTHER']
          },
          birthDate: {type: 'string', format: 'date', example: '1990-05-15'},
          email: {type: 'string', format: 'email', example: 'juan.perez@empresa.com'},
          phone: {type: 'string', example: '+591 70012345'},
          address: {type: 'string', example: 'Av. Principal 123'},
          emergencyContact: {type: 'string', example: 'María Pérez'},
          emergencyPhone: {type: 'string', example: '+591 70054321'},
          ciNumber: {type: 'string', example: '12345678'},
          businessId: {type: 'integer', example: 1}
        }
      }
    }
  },

  ChangeUserPasswordRequest: {
    type: 'object',
    properties: {
      currentPassword: {type: 'string', example: 'ContraseñaActual123!', minLength: 1},
      newPassword: {type: 'string', example: 'NuevaContraseña456!', minLength: 8}
    },
    required: ['currentPassword', 'newPassword']
  },

  ResetUserPasswordRequest: {
    type: 'object',
    properties: {
      newPassword: {type: 'string', example: 'NuevaContraseña456!', minLength: 8}
    },
    required: ['newPassword']
  },

  UserFilters: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']
      },
      roleId: {type: 'integer', example: 2},
      businessId: {type: 'integer', example: 1},
      search: {type: 'string', example: 'juan', description: 'Buscar por username o nombre de empleado'},
      page: {type: 'integer', example: 1, minimum: 1, default: 1},
      limit: {type: 'integer', example: 10, minimum: 1, maximum: 100, default: 10}
    }
  },

  UserListResponse: {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: {$ref: '#/components/schemas/User'}
      },
      total: {type: 'integer', example: 25},
      page: {type: 'integer', example: 1},
      totalPages: {type: 'integer', example: 3},
      limit: {type: 'integer', example: 10}
    },
    required: ['users', 'total', 'page', 'totalPages', 'limit']
  },

  UserStats: {
    type: 'object',
    properties: {
      total: {type: 'integer', example: 25},
      active: {type: 'integer', example: 20},
      inactive: {type: 'integer', example: 3},
      suspended: {type: 'integer', example: 1},
      pendingVerification: {type: 'integer', example: 1},
      byRole: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            roleName: {type: 'string', example: 'Empleado'},
            count: {type: 'integer', example: 15}
          },
          required: ['roleName', 'count']
        }
      },
      byBusiness: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            businessName: {type: 'string', example: 'Mi Negocio'},
            count: {type: 'integer', example: 10}
          },
          required: ['businessName', 'count']
        }
      }
    },
    required: ['total', 'active', 'inactive', 'suspended', 'pendingVerification', 'byRole', 'byBusiness']
  },

  UserError: {
    type: 'object',
    properties: {
      error: {type: 'string', example: 'Usuario no encontrado'},
      message: {type: 'string', example: 'El usuario con ID 123 no existe'},
      statusCode: {type: 'integer', example: 404}
    },
    required: ['error', 'message', 'statusCode']
  }
};