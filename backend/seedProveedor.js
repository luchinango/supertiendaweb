import { fakerES as faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para generar NIT boliviano válido
const generateNIT = () => {
  const numero = faker.string.numeric(7);
  const digitoVerificador = faker.helpers.arrayElement([
    ...Array(10).keys(), // Números 0-9
    'K' // Para casos especiales
  ]);
  return `${numero}-${digitoVerificador}`;
};

// Función para generar teléfonos bolivianos
const generateTelefono = () => {
  return faker.helpers.arrayElement([
    // Formato para teléfonos fijos
    `(${faker.number.int({ min: 2, max: 4 })}) ${faker.string.numeric(7)}`,
    // Formato para móviles
    `7${faker.string.numeric(7)}`
  ]);
};

// Generar datos ficticios para proveedores
const generateFakeProveedor = () => {
  const razonSocial = `${faker.company.name()} ${
    Math.random() < 0.7 ? faker.helpers.arrayElement(['S.R.L.', 'C.A.', 'S.A.', 'Ltda.']) : ''
  }`.trim();

  return {
    razonSocial,
    nit: generateNIT(),
    direccion: `${faker.location.streetAddress()}, ${faker.location.city()}`,
    telefono: generateTelefono(),
    email: faker.internet.email({
      firstName: razonSocial.split(' ')[0].toLowerCase(),
      lastName: faker.location.city().toLowerCase(),
      provider: 'proveedores.bo',
      allowSpecialCharacters: false
    }),
    contacto: faker.person.fullName(),
    tipoProveedor: faker.helpers.arrayElement(['Nacional', 'Internacional']),
    estado: faker.helpers.arrayElement(['Activo', 'Inactivo'])
  };
};

// Insertar 53 proveedores de prueba
const seedProveedor = async () => {
  try {
    const proveedores = Array.from({ length: 53 }, generateFakeProveedor);
    
    await prisma.proveedor.createMany({
      data: proveedores,
      skipDuplicates: true
    });
    
    console.log('✅ 53 proveedores insertados exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedProveedor();