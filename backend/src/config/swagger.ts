import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import {Express} from 'express'
import path from "path";
import fs from "fs";
import {authSchemas} from '../schemas/authSchemas';
import {userSchemas} from '../schemas/userSchemas';
import {businessSchemas} from '../schemas/businessSchemas';
import {productSchemas} from '../schemas/productSchemas';

const SCHEMA_FILE = path.resolve(__dirname, '../../prisma/schemas/json-schema.json');
const API_PATHS = [
  "./src/routes/**/*.ts",
  "./src/controllers/**/*.ts",
  './src/middlewares/**/*.ts',
  './src/utils/**/*.ts',
  './src/config/**/*.ts'
];

let prismaSchemas = {};
try {
  if (fs.existsSync(SCHEMA_FILE)) {
    const schemaContent = fs.readFileSync(SCHEMA_FILE, 'utf-8');
    const schemaData = JSON.parse(schemaContent);
    const definitions = schemaData.definitions || {};

    // Convertir referencias de #/definitions/ a #/components/schemas/
    const schemaString = JSON.stringify(definitions);
    const convertedSchemaString = schemaString.replace(/"\$ref":\s*"#\/definitions\//g, '"$ref": "#/components/schemas/');
    const convertedSchemas = JSON.parse(convertedSchemaString);

    prismaSchemas = convertedSchemas;
    console.log('Esquemas Prisma cargados y convertidos correctamente');
    console.log(`Esquemas cargados: ${Object.keys(convertedSchemas).length}`);
  } else {
    console.warn('Archivo de esquemas Prisma no encontrado:', SCHEMA_FILE);
  }
} catch (error) {
  console.error('Error al cargar esquemas Prisma:', error);
}

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "🏪 Super Tienda API",
      version: "1.0.0",
      description: ``,
      contact: {
        name: "Super Tienda",
        url: "https://www.supertienda.com",
        email: "contacto@supertienda.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    components: {
      schemas: {
        ...prismaSchemas,
        ...authSchemas,
        ...userSchemas,
        ...businessSchemas,
        ...productSchemas,
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtenido del endpoint de login",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Endpoints de autenticación y autorización"
      },
      {
        name: "Users",
        description: "Gestión de usuarios, roles y permisos"
      },
      {
        name: "POS",
        description: "Sistema de punto de venta y carritos de compra"
      },
      {
        name: "Cash Register",
        description: "Gestión de cajas registradoras y apertura/cierre"
      },
      {
        name: "Products",
        description: "Gestión de productos, categorías e inventario"
      },
      {
        name: "Sales",
        description: "Historial de ventas, reportes y análisis"
      },
      {
        name: "Reports",
        description: "Reportes, estadísticas y métricas del negocio"
      }
    ],
    externalDocs: {
      description: "Documentación adicional",
      url: "https://docs.supertienda.com"
    }
  },
  apis: API_PATHS,
  failOnErrors: true,
  verbose: process.env.NODE_ENV === 'development',
};

export const swaggerSpec = swaggerJsdoc(options)

function swaggerDocs(app: Express, port: number) {
  const dynamicOptions: swaggerJsdoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "🏪 Super Tienda API",
        version: "1.0.0",
        description: ``,
        contact: {
          name: "Super Tienda",
          url: "https://www.supertienda.com",
          email: "contacto@supertienda.com",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      },
      components: {
        schemas: {
          ...prismaSchemas,
          ...authSchemas,
          ...userSchemas,
          ...businessSchemas,
          ...productSchemas,
        },
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT token obtenido del endpoint de login",
          },
        },
        responses: options.definition?.components?.responses || {},
        parameters: options.definition?.components?.parameters || {},
        examples: options.definition?.components?.examples || {}
      },
      security: options.definition?.security || [],
      tags: options.definition?.tags || [],
      externalDocs: options.definition?.externalDocs
    },
    apis: API_PATHS,
    failOnErrors: true,
    verbose: process.env.NODE_ENV === 'development',
  };

  const dynamicSwaggerSpec = swaggerJsdoc(dynamicOptions);

  const swaggerUiOptions = {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .scheme-container { background: #f8f9fa; }
      .swagger-ui .btn.execute { background-color: #28a745; }
      .swagger-ui .btn.execute:hover { background-color: #218838; }
      .swagger-ui .schemas { display: none !important; }
      .swagger-ui .models { display: none !important; }
      .swagger-ui .model-box { display: none !important; }
      .swagger-ui .info .description { font-size: 14px; line-height: 1.6; }
      .swagger-ui .info .description h2 { color: #2c3e50; margin-top: 20px; }
      .swagger-ui .info .description ul { margin-left: 20px; }
    `,
    customSiteTitle: "Super Tienda API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: -1,

      showMutatedRequest: true,
      showRequestHeaders: true,
      showResponseHeaders: true,
      apisSorter: 'alpha',

      operationsSorter: (a: any, b: any) => {
        const order = ['get', 'post', 'put', 'delete', 'patch'];
        const aIndex = order.indexOf(a.get('method'));
        const bIndex = order.indexOf(b.get('method'));

        if (aIndex === bIndex) {
          return a.get('path').localeCompare(b.get('path'));
        }
        return aIndex - bIndex;
      },
      tagsSorter: null,
      cacheControl: false,

      onFailure: (data: any) => {
        console.error('Error en Swagger UI:', data);
      },
    },
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(dynamicSwaggerSpec, swaggerUiOptions));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(dynamicSwaggerSpec);
  });

  app.get('/api-docs/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      services: {
        auth: 'running',
        pos: 'running',
        cashRegister: 'running'
      }
    });
  });

  app.get('/api-docs/info', (req, res) => {
    res.json({
      name: "Super Tienda API",
      version: "1.0.0",
      description: "API REST para el sistema de gestión de Super Tienda",
      endpoints: {
        documentation: `/api-docs`,
        specification: `/api-docs.json`,
        health: `/api-docs/health`,
        metrics: `/api-docs/metrics`
      },
      contact: {
        email: "contacto@supertienda.com",
        url: "https://www.supertienda.com"
      },
      support: {
        documentation: "https://docs.supertienda.com",
        issues: "https://github.com/supertienda/api/issues",
        community: "https://community.supertienda.com"
      }
    });
  });

  app.get('/api-docs/metrics', (req, res) => {
    res.json({
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      },
      cpu: process.cpuUsage(),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform
    });
  });

  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
  console.log(`API spec available at http://localhost:${port}/api-docs.json`);
  console.log(`Health check available at http://localhost:${port}/api-docs/health`);
  console.log(`API info available at http://localhost:${port}/api-docs/info`);
  console.log(`Metrics available at http://localhost:${port}/api-docs/metrics`);
}

export default swaggerDocs
