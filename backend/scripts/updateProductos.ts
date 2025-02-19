import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProductos() {
  try {
    console.log('🚀 Iniciando actualización de productos...');
    
    // Obtener el primer proveedor o crear uno por defecto
    let proveedor = await prisma.proveedor.findFirst();
    
    if (!proveedor) {
      proveedor = await prisma.proveedor.create({
        data: {
          razonSocial: 'Proveedor Por Defecto',
          nit: 'DEFAULT-001',
          direccion: 'Dirección Por Defecto',
          telefono: '0000000000',
          email: 'default@proveedor.com',
          contacto: 'Contacto Por Defecto',
          tipoProveedor: 'Nacional',
          estado: 'Activo'
        }
      });
    }

    // Actualizar todos los productos que tienen proveedorId NULL
    await prisma.producto.updateMany({
      where: {
        proveedorId: 0
      },
      data: {
        proveedorId: proveedor.id
      }
    });

    console.log('✅ Productos actualizados exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductos()
  .catch(console.error);