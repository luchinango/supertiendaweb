import { fakerES as faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para generar teléfonos
const generateTelefono = () => {
  return faker.helpers.arrayElement([
    // Formato para teléfonos fijos
    `(${faker.number.int({ min: 2, max: 4 })}) ${faker.string.numeric(7)}`,
    // Formato para móviles
    `${faker.string.numeric(11)}`
  ]);
};

// Generar datos ficticios para clientes
const generateFakeCliente = () => {
  const nombreCompleto = faker.person.fullName();
  const empresa = faker.company.name();

  return {
    nombre: nombreCompleto,
    razonSocial: Math.random() > 0.3 ? empresa : null, // 70% tendrán razón social
    direccion: `${faker.location.street()}, ${faker.location.city()}`,
    telefono: generateTelefono(),
    email: faker.internet.email({
      firstName: nombreCompleto.split(' ')[0].toLowerCase(),
      provider: 'empresa.com',
      allowSpecialCharacters: false
    })
    // No necesitamos incluir createdAt y updatedAt, Prisma los maneja automáticamente
  };
};

// Insertar 50 clientes de prueba
const seedClientes = async () => {
  try {
    console.log('🚀 Iniciando la generación de clientes...');
    
    const clientes = Array.from({ length: 50 }, generateFakeCliente);
    
    await prisma.cliente.createMany({
      data: clientes,
      skipDuplicates: true
    });
    
    console.log('✅ 50 clientes insertados exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Detalles:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

// Ejecutar el seed
seedClientes()
  .catch((error) => {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  });