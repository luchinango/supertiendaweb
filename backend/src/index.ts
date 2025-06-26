import server from './server';
import logger from './utils/logger';

const APP_INFO = {
  name: 'Super Tienda Web API',
  version: '1.0.0',
  description: 'Backend API para sistema de gestión de tienda',
  environment: process.env.NODE_ENV || 'development',
};

/**
 * Función principal que inicia la aplicación
 */
async function main(): Promise<void> {
  try {
    logger.info('Starting application', {
      ...APP_INFO,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    });

    // El servidor ya se inicia automáticamente cuando se importa
    // Mantenemos la referencia para que el proceso no termine
    const serverInstance = server;

    logger.info('Application started successfully', {
      ...APP_INFO,
      timestamp: new Date().toISOString(),
      serverStatus: 'running'
    });

    // Mantener el proceso vivo
    return new Promise((resolve) => {
      // El proceso se mantendrá vivo mientras el servidor esté escuchando
    });

  } catch (error) {
    logger.error('Failed to start application', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      ...APP_INFO,
      timestamp: new Date().toISOString(),
    });

    process.exit(1);
  }
}

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception during startup', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...APP_INFO,
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection during startup', {
    reason: reason instanceof Error ? reason.message : reason,
    promise: promise.toString(),
    ...APP_INFO,
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});

main();
