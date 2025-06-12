import {AuthResponse, LoginRequest, ChangePasswordRequest, RefreshTokenRequest} from '../types/auth.types';

export const authSchemas = {
  AuthResponse: {
    type: "object",
    properties: {
      token: {
        type: "string",
        description: "JWT token de acceso",
        example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
      },
      refreshToken: {
        type: "string",
        description: "Token para renovar el acceso",
        example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
      },
      user: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "ID del usuario",
            example: 1
          },
          username: {
            type: "string",
            description: "Nombre de usuario",
            example: "admin"
          },
          role: {
            type: "string",
            description: "Rol del usuario",
            example: "ADMIN"
          },
          employee: {
            type: "object",
            nullable: true,
            properties: {
              firstName: {
                type: "string",
                description: "Nombre del empleado",
                example: "Juan"
              },
              lastName: {
                type: "string",
                nullable: true,
                description: "Apellido del empleado",
                example: "Pérez"
              },
              position: {
                type: "string",
                description: "Cargo del empleado",
                example: "Gerente"
              },
              startDate: {
                type: "string",
                format: "date-time",
                description: "Fecha de inicio",
                example: "2024-01-01T00:00:00Z"
              },
              status: {
                type: "string",
                enum: ["ACTIVE", "ON_LEAVE", "TERMINATED", "RETIRED"],
                description: "Estado del empleado",
                example: "ACTIVE"
              },
              gender: {
                type: "string",
                enum: ["MALE", "FEMALE", "OTHER", "UNSPECIFIED"],
                description: "Género del empleado",
                example: "MALE"
              },
              birthDate: {
                type: "string",
                format: "date-time",
                nullable: true,
                description: "Fecha de nacimiento",
                example: "1990-01-01T00:00:00Z"
              },
              email: {
                type: "string",
                nullable: true,
                description: "Email del empleado",
                example: "juan.perez@empresa.com"
              },
              address: {
                type: "string",
                nullable: true,
                description: "Dirección del empleado",
                example: "Av. Principal 123"
              },
              phone: {
                type: "string",
                nullable: true,
                description: "Teléfono del empleado",
                example: "+591 70012345"
              },
              businessId: {
                type: "integer",
                description: "ID del negocio",
                example: 1
              }
            }
          }
        },
        required: ["id", "username", "role"]
      }
    },
    required: ["token", "refreshToken", "user"]
  },

  LoginRequest: {
    type: "object",
    properties: {
      username: {
        type: "string",
        description: "Nombre de usuario",
        example: "admin"
      },
      password: {
        type: "string",
        description: "Contraseña",
        example: "password123"
      }
    },
    required: ["username", "password"]
  },

  ChangePasswordRequest: {
    type: "object",
    properties: {
      currentPassword: {
        type: "string",
        description: "Contraseña actual",
        example: "oldpassword123"
      },
      newPassword: {
        type: "string",
        description: "Nueva contraseña",
        example: "newpassword123"
      }
    },
    required: ["currentPassword", "newPassword"]
  },

  RefreshTokenRequest: {
    type: "object",
    properties: {
      refreshToken: {
        type: "string",
        description: "Token de renovación",
        example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    },
    required: ["refreshToken"]
  }
};
