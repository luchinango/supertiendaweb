import { fakerES as faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para generar usuarios ficticios
const generateFakeUser = () => ({
  nombre: faker.person.firstName(),
  apellido: faker.person.lastName(),
  direccion: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}`,
  tel_cel: faker.phone.number('+591 ## ### ###'),
  email: faker.internet.email({ provider: 'fakecompany.com' }),
  puesto: faker.person.jobTitle()
});

// Insertar 20 usuarios de prueba
const seed = async () => {
  try {
    for (let i = 0; i < 20; i++) {
      const user = generateFakeUser();
      await prisma.user.create({
        data: user
      });
    }
    
    console.log('✅ 20 usuarios insertados exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();