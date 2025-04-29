import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'
import path from "path";
import fs from "fs";

const schemaFile = path.resolve(__dirname, '../../prisma/schemas/json-schema.json');
const prismaSchemas = JSON.parse(fs.readFileSync(schemaFile, 'utf-8')).definitions;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Super Tienda",
      contact: {
        name: "Super    Tienda",
        url: "https://www.superTienda.com",
        email: "superTienda@gmail.com",
      },
    },
    components: {
       schemas: prismaSchemas,
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/**/*.ts", "./src/models/**/*.ts", './src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options)

function swaggerDocs(app: Express, port: number) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })

  console.log(`Swagger docs available at http://localhost:${port}/api-docs`)
}

export default swaggerDocs
