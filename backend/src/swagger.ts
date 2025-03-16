// swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Tienda',
    version: '1.0.0',
    description: 'Documentación de la API para la gestión de la tienda',
    contact: {
      name: 'Tu Nombre',
      email: 'tuemail@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Servidor de desarrollo',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.ts'], // Ruta donde están tus archivos de rutas
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;