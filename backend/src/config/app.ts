import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración de la aplicación
 */
export const appConfig = {
  // Configuración del servidor
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Configuración de la base de datos
  database: {
    url: process.env.DATABASE_URL || '',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  },

  // Configuración de autenticación
  auth: {
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    saltRounds: parseInt(process.env.SALT_ROUNDS || '12', 10),
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
    enableFile: process.env.LOG_ENABLE_FILE === 'true',
    logFile: process.env.LOG_FILE || 'logs/app.log',
  },

  // Configuración de paginación
  meta: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },

  // Configuración de validación
  validation: {
    maxUsernameLength: 50,
    minUsernameLength: 3,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // Configuración de archivos
  files: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    uploadPath: process.env.UPLOAD_PATH || 'uploads/',
  },

  // Configuración de rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
} as const;

/**
 * Validar configuraciones críticas
 */
export const validateConfig = (): void => {
  const requiredEnvVars = ['DATABASE_URL'];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Variables de entorno requeridas faltantes: ${missingVars.join(', ')}`);
  }

  // Validar configuración de base de datos
  if (!appConfig.database.url) {
    throw new Error('DATABASE_URL es requerida');
  }

  // Validar configuración de autenticación
  if (!appConfig.auth.jwtSecret && appConfig.server.nodeEnv === 'production') {
    throw new Error('JWT_SECRET es requerida en producción');
  }
};

/**
 * Obtener configuración por entorno
 */
export const getConfigForEnvironment = (env: string) => {
  switch (env) {
    case 'production':
      return {
        ...appConfig,
        logging: {
          ...appConfig.logging,
          level: 'warn',
          enableConsole: false,
          enableFile: true,
        },
      };
    case 'test':
      return {
        ...appConfig,
        database: {
          ...appConfig.database,
          url: process.env.TEST_DATABASE_URL || appConfig.database.url,
        },
        logging: {
          ...appConfig.logging,
          level: 'error',
          enableConsole: false,
        },
      };
    default:
      return appConfig;
  }
};
