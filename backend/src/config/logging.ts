import { appConfig } from './app';

/**
 * Configuración del sistema de logging
 */
export const loggingConfig = {
  // Niveles de log por entorno
  levels: {
    development: 'debug',
    test: 'error',
    production: 'info',
  },

  // Configuración de archivos de log
  files: {
    error: {
      filename: 'logs/error.log',
      maxSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      level: 'error',
    },
    combined: {
      filename: 'logs/combined.log',
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      level: 'info',
    },
    http: {
      filename: 'logs/http.log',
      maxSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      level: 'http',
    },
    database: {
      filename: 'logs/database.log',
      maxSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      level: 'info',
    },
    auth: {
      filename: 'logs/auth.log',
      maxSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      level: 'info',
    },
  },

  // Configuración de rotación
  rotation: {
    enabled: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    checkInterval: 24 * 60 * 60 * 1000, // 24 horas
  },

  // Configuración de formateo
  format: {
    timestamp: 'YYYY-MM-DD HH:mm:ss:ms',
    colors: {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      http: 'magenta',
      debug: 'white',
    },
  },

  // Configuración de sanitización
  sanitization: {
    enabled: true,
    sensitiveFields: [
      'password',
      'passwordHash',
      'token',
      'secret',
      'key',
      'authorization',
      'apiKey',
      'privateKey',
      'publicKey',
    ],
    replacement: '***REDACTED***',
  },

  // Configuración de performance
  performance: {
    slowRequestThreshold: 1000, // 1 segundo
    logSlowRequests: true,
    logRequestDetails: true,
  },

  // Configuración de seguridad
  security: {
    logAuthenticationAttempts: true,
    logAuthorizationFailures: true,
    logSensitiveOperations: true,
    maskIPs: false, // Cambiar a true en producción si es necesario
    maskUserAgents: false,
  },
};

/**
 * Obtener configuración de logging para el entorno actual
 */
export const getLoggingConfig = () => {
  const env = appConfig.server.nodeEnv;

  return {
    ...loggingConfig,
    level: loggingConfig.levels[env as keyof typeof loggingConfig.levels] || 'info',
    console: env !== 'production',
    file: env === 'production' || env === 'development',
  };
};

/**
 * Configuración de alertas de logging
 */
export const loggingAlerts = {
  // Alertas de errores
  errorThresholds: {
    consecutiveErrors: 5,
    timeWindow: 5 * 60 * 1000, // 5 minutos
    alertEmail: process.env.ALERT_EMAIL,
  },

  // Alertas de performance
  performanceThresholds: {
    slowRequestPercentage: 10, // 10% de requests lentos
    timeWindow: 10 * 60 * 1000, // 10 minutos
    alertEmail: process.env.ALERT_EMAIL,
  },

  // Alertas de autenticación
  authThresholds: {
    failedLoginAttempts: 10,
    timeWindow: 15 * 60 * 1000, // 15 minutos
    alertEmail: process.env.ALERT_EMAIL,
  },
};

/**
 * Configuración de métricas de logging
 */
export const loggingMetrics = {
  // Métricas de requests
  requestMetrics: {
    enabled: true,
    trackResponseTime: true,
    trackStatusCodes: true,
    trackUserAgents: false,
    trackIPs: false,
  },

  // Métricas de base de datos
  databaseMetrics: {
    enabled: true,
    trackQueryTime: true,
    trackSlowQueries: true,
    trackConnectionPool: true,
  },

  // Métricas de autenticación
  authMetrics: {
    enabled: true,
    trackLoginAttempts: true,
    trackFailedLogins: true,
    trackTokenRefresh: true,
  },
};
