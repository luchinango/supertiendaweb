// seed.ts (o seed.js)
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedProducts() {
  const proveedores = await prisma.proveedor.findMany({ select: { id: true } });
  
  if (proveedores.length === 0) throw new Error('Primero crear proveedores');

  const PRODUCTOS_A_CREAR = 500;

  const productosData = Array.from({ length: PRODUCTOS_A_CREAR }, () => {
    const minStock = faker.number.int({ min: 10, max: 50 });
    const maxStock = faker.number.int({ min: minStock + 50, max: 500 });
    
    return {
      nombre: `${faker.commerce.productName().slice(0, 40)} ${faker.string.alphanumeric(6)}`,
      descripcion: faker.commerce.productDescription(),
      precio_compra: parseFloat(faker.commerce.price({ min: 5, max: 150 })),
      precio_venta: parseFloat(faker.commerce.price({ min: 150, max: 800 })),
      sku: faker.string.alphanumeric(10).toUpperCase(),
      barcode: faker.commerce.isbn(13),
      category: faker.commerce.department(),
      subcategory: faker.commerce.productAdjective(),
      brand: faker.company.name(),
      unidad: faker.helpers.arrayElement(['unidad', 'litro', 'kg', 'paquete']),
      minStock,
      maxStock,
      actualStock: faker.number.int({ min: minStock, max: maxStock }),
      fechaExpiracion: faker.date.future({ years: 2 }),
      imagen: faker.image.urlLoremFlickr({ category: 'technics' }), // Método actualizado
      proveedorId: faker.helpers.arrayElement(proveedores).id
    };
  });

  await prisma.producto.createMany({ data: productosData });
  console.log(`✅ ${PRODUCTOS_A_CREAR} productos creados`);
}

// Ejecutar primero seed de proveedores y luego productos
seedProducts()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());