import { faker } from '@faker-js/faker/locale/es';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para generar productos únicos
const generateProduct = () => {
  const nombre = faker.commerce.productName() + " " + faker.string.alphanumeric(5); // Evita duplicados
  const barcode = faker.string.numeric(13); // EAN-13

  return {
    nombre,
    descripcion: faker.commerce.productDescription(),
    precio_compra: parseFloat(faker.commerce.price({ min: 5, max: 500 })),
    precio_venta: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    barcode,
    category: faker.commerce.department(),
    subcategory: faker.commerce.productMaterial(),
    brand: faker.company.name(),
    unidad: faker.helpers.arrayElement(['unidad', 'litro', 'kg', 'paquete']),
    minStock: faker.number.int({ min: 10, max: 50 }),
    maxStock: faker.number.int({ min: 100, max: 500 }),
    actualStock: faker.number.int({ min: 20, max: 300 }),
    fechaExpiracion: faker.date.future({ years: 2 }),
    imagen: faker.image.urlLoremFlickr({ category: 'food' }) // Ejemplo para imágenes
  };
};

// Insertar 1000 productos
const seed = async () => {
  const products = Array.from({ length: 1000 }, generateProduct);

  // Insertar en lotes de 100 (Prisma tiene límites de batch)
  for (let i = 0; i < 10; i++) {
    await prisma.producto.createMany({
      data: products.slice(i * 100, (i + 1) * 100),
      skipDuplicates: true
    });
    console.log(`Lote ${i + 1}/10 insertado`);
  }
};

seed()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });