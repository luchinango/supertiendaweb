/**
 * Seed de desarrollo local — SuperTienda P1-B
 * Idempotente: upsert por claves únicas. No borra datos existentes.
 *
 * Uso (solo Docker local):
 *   SEED_CONFIRM_LOCAL=1 npm run db:seed
 *
 * Contraseña: SEED_DEV_PASSWORD (default DevPass123!)
 */
import bcrypt from 'bcryptjs';
import { PrismaClient, UserStatus, EmployeeStatus, Gender, BusinessStatus, BusinessType, Department, ProductStatus, SupplierStatus, DocumentType } from '../generated';

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '12', 10);

function assertLocalDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed bloqueado en production');
  }
  if (process.env.SEED_CONFIRM_LOCAL !== '1') {
    throw new Error('Falta SEED_CONFIRM_LOCAL=1 (protección anti-ejecución accidental)');
  }
  const url = process.env.DATABASE_URL || '';
  const isLocalDocker =
    url.includes('supertienda_dev') &&
    (url.includes('@db:') || url.includes('@localhost') || url.includes('@127.0.0.1'));
  if (!isLocalDocker) {
    throw new Error(`DATABASE_URL no parece Docker local (supertienda_dev). Abortando. urlHost=${url.replace(/:\/\/[^@]+@/, '://***@')}`);
  }
  if (/206\.183\.|5217|2932/.test(url)) {
    throw new Error('DATABASE_URL parece remota. Abortando seed.');
  }
}

async function upsertRole(code: string, name: string, description: string) {
  return prisma.role.upsert({
    where: { code },
    update: { name, description, isActive: true },
    create: { code, name, description, isActive: true },
  });
}

async function upsertPermission(code: string, name: string, module: string) {
  return prisma.permission.upsert({
    where: { code },
    update: { name, module, isActive: true },
    create: { code, name, module, isActive: true },
  });
}

async function linkRolePermission(roleId: number, permissionId: number) {
  const existing = await prisma.rolePermission.findFirst({
    where: { roleId, permissionId },
  });
  if (existing) return existing;
  return prisma.rolePermission.create({ data: { roleId, permissionId } });
}

async function upsertBusiness(nit: string, name: string, legalName: string) {
  const existing = await prisma.business.findUnique({ where: { nit } });
  if (existing) {
    return prisma.business.update({
      where: { nit },
      data: { name, legalName, status: BusinessStatus.ACTIVE, deletedAt: null },
    });
  }
  return prisma.business.create({
    data: {
      name,
      legalName,
      nit,
      businessType: BusinessType.PERSONA_NATURAL,
      department: Department.LA_PAZ,
      city: 'La Paz',
      country: 'Bolivia',
      status: BusinessStatus.ACTIVE,
      email: `${nit.replace(/[^0-9]/g, '')}@dev.local`,
      phone: '70000000',
      address: 'Dirección de prueba',
    },
  });
}

async function upsertUserWithEmployee(opts: {
  username: string;
  passwordHash: string;
  roleId: number;
  businessId: number;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  ciNumber: string;
}) {
  const user = await prisma.user.upsert({
    where: { username: opts.username },
    update: {
      passwordHash: opts.passwordHash,
      status: UserStatus.ACTIVE,
      roleId: opts.roleId,
      phone: '70000001',
    },
    create: {
      username: opts.username,
      passwordHash: opts.passwordHash,
      status: UserStatus.ACTIVE,
      roleId: opts.roleId,
      phone: '70000001',
    },
  });

  const existingEmp = await prisma.employee.findUnique({ where: { userId: user.id } });
  if (existingEmp) {
    await prisma.employee.update({
      where: { id: existingEmp.id },
      data: {
        businessId: opts.businessId,
        firstName: opts.firstName,
        lastName: opts.lastName,
        position: opts.position,
        email: opts.email,
        status: EmployeeStatus.ACTIVE,
        ciNumber: opts.ciNumber,
        phone: '70000001',
        address: 'Dev address',
        department: 'Operaciones',
      },
    });
  } else {
    // email/ci unique — clear soft conflicts from other seeds carefully via find
    const emailTaken = await prisma.employee.findUnique({ where: { email: opts.email } });
    if (emailTaken && emailTaken.userId !== user.id) {
      throw new Error(`Email seed en conflicto: ${opts.email}`);
    }
    await prisma.employee.create({
      data: {
        userId: user.id,
        businessId: opts.businessId,
        firstName: opts.firstName,
        lastName: opts.lastName,
        position: opts.position,
        email: opts.email,
        status: EmployeeStatus.ACTIVE,
        gender: Gender.UNSPECIFIED,
        startDate: new Date('2024-01-01T00:00:00.000Z'),
        ciNumber: opts.ciNumber,
        phone: '70000001',
        address: 'Dev address',
        department: 'Operaciones',
      },
    });
  }
  return user;
}

async function upsertCategory(name: string) {
  return prisma.category.upsert({
    where: { name },
    update: { isActive: true, description: 'Categoría seed P1-B' },
    create: { name, description: 'Categoría seed P1-B', isActive: true, sortOrder: 1 },
  });
}

async function upsertProduct(sku: string, name: string, categoryId: number, cost: number, price: number) {
  const existing = await prisma.product.findUnique({ where: { sku } });
  if (existing) {
    return prisma.product.update({
      where: { sku },
      data: {
        name,
        categoryId,
        costPrice: cost,
        sellingPrice: price,
        status: ProductStatus.ACTIVE,
        isActive: true,
        deletedAt: null,
        unit: 'pcs',
      },
    });
  }
  return prisma.product.create({
    data: {
      sku,
      barcode: `BC-${sku}`,
      name,
      categoryId,
      costPrice: cost,
      sellingPrice: price,
      status: ProductStatus.ACTIVE,
      isActive: true,
      unit: 'pcs',
      minStock: 5,
      reorderPoint: 5,
    },
  });
}

async function upsertBusinessProduct(
  businessId: number,
  productId: number,
  customPrice: number,
  stock: number
) {
  const existing = await prisma.businessProduct.findFirst({
    where: { businessId, productId, deletedAt: null },
  });
  if (existing) {
    return prisma.businessProduct.update({
      where: { id: existing.id },
      data: {
        customPrice,
        currentStock: stock,
        availableStock: stock,
        reservedStock: 0,
        version: { increment: 1 },
      },
    });
  }
  return prisma.businessProduct.create({
    data: {
      businessId,
      productId,
      customPrice,
      currentStock: stock,
      availableStock: stock,
      reservedStock: 0,
      version: 1,
    },
  });
}

async function upsertSupplier(businessId: number, code: string, name: string) {
  const existing = await prisma.supplier.findUnique({ where: { code } });
  if (existing) {
    return prisma.supplier.update({
      where: { code },
      data: { businessId, name, status: SupplierStatus.ACTIVE, deletedAt: null },
    });
  }
  return prisma.supplier.create({
    data: {
      businessId,
      code,
      name,
      documentType: DocumentType.NIT,
      documentNumber: code.replace('SUP-', ''),
      status: SupplierStatus.ACTIVE,
      city: 'La Paz',
      country: 'Bolivia',
    },
  });
}

async function main() {
  assertLocalDatabase();
  const password = process.env.SEED_DEV_PASSWORD || 'DevPass123!';
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  console.log('🌱 Seed P1-B/P1-G iniciando (idempotente)...');

  const roleAdmin = await upsertRole('ADMIN', 'Administrador', 'Admin de empresa (dev)');
  const roleEmployee = await upsertRole('EMPLOYEE', 'Empleado', 'Empleado operativo (dev)');
  const rolePlatform = await upsertRole(
    'PLATFORM_ADMIN',
    'Administrador de plataforma',
    'CODEMEDIIA — sin empresa (dev)'
  );

  const perms = await Promise.all([
    upsertPermission('products.read', 'Ver productos', 'products'),
    upsertPermission('products.write', 'Editar productos', 'products'),
    upsertPermission('suppliers.read', 'Ver proveedores', 'suppliers'),
    upsertPermission('purchase_orders.read', 'Ver OC', 'purchase_orders'),
    upsertPermission('employees.read', 'Ver empleados', 'employees'),
    upsertPermission('platform.health', 'Health de plataforma', 'platform'),
  ]);
  for (const p of perms) {
    if (p.code.startsWith('platform.')) {
      await linkRolePermission(rolePlatform.id, p.id);
    } else {
      await linkRolePermission(roleAdmin.id, p.id);
    }
  }
  await linkRolePermission(roleEmployee.id, perms[0].id);

  const businessA = await upsertBusiness('9000001016', 'Empresa A Dev', 'Empresa A Dev SRL');
  const businessB = await upsertBusiness('9000002016', 'Empresa B Dev', 'Empresa B Dev SRL');

  await upsertUserWithEmployee({
    username: 'admin_a',
    passwordHash,
    roleId: roleAdmin.id,
    businessId: businessA.id,
    firstName: 'Ada',
    lastName: 'AdminA',
    position: 'Administradora',
    email: 'admin_a@dev.local',
    ciNumber: 'CI-ADMIN-A',
  });
  await upsertUserWithEmployee({
    username: 'admin_b',
    passwordHash,
    roleId: roleAdmin.id,
    businessId: businessB.id,
    firstName: 'Bruno',
    lastName: 'AdminB',
    position: 'Administrador',
    email: 'admin_b@dev.local',
    ciNumber: 'CI-ADMIN-B',
  });
  await upsertUserWithEmployee({
    username: 'employee_a',
    passwordHash,
    roleId: roleEmployee.id,
    businessId: businessA.id,
    firstName: 'Elena',
    lastName: 'EmpleadaA',
    position: 'Cajera',
    email: 'employee_a@dev.local',
    ciNumber: 'CI-EMP-A',
  });

  // P1-G: usuario plataforma sin Employee (credenciales vía SEED_DEV_PASSWORD / SEED_PLATFORM_USERNAME)
  const platformUsername = process.env.SEED_PLATFORM_USERNAME || 'platform_admin';
  await prisma.user.upsert({
    where: { username: platformUsername },
    update: {
      passwordHash,
      status: UserStatus.ACTIVE,
      roleId: rolePlatform.id,
    },
    create: {
      username: platformUsername,
      passwordHash,
      status: UserStatus.ACTIVE,
      roleId: rolePlatform.id,
    },
  });
  // Garantizar ausencia de Employee (idempotente)
  const platformUser = await prisma.user.findUnique({
    where: { username: platformUsername },
    select: { id: true, employee: { select: { id: true } } },
  });
  if (platformUser?.employee) {
    throw new Error(
      `Usuario plataforma ${platformUsername} no debe tener Employee. Abortando seed.`
    );
  }

  const category = await upsertCategory('Abarrotes Dev');
  const productShared = await upsertProduct('SKU-SHARED-001', 'Arroz 1kg (compartido)', category.id, 5, 8);
  const productAOnly = await upsertProduct('SKU-A-001', 'Aceite Empresa A', category.id, 10, 15);
  const productBOnly = await upsertProduct('SKU-B-001', 'Azúcar Empresa B', category.id, 4, 7);

  // Inventario separado: mismo producto compartido con stock/precio distinto
  await upsertBusinessProduct(businessA.id, productShared.id, 8.5, 100);
  await upsertBusinessProduct(businessB.id, productShared.id, 9.0, 40);
  await upsertBusinessProduct(businessA.id, productAOnly.id, 15, 25);
  await upsertBusinessProduct(businessB.id, productBOnly.id, 7, 60);

  await upsertSupplier(businessA.id, 'SUP-A-001', 'Proveedor Solo A');
  await upsertSupplier(businessB.id, 'SUP-B-001', 'Proveedor Solo B');

  console.log('✅ Seed P1-B/P1-G listo');
  console.log(JSON.stringify({
    businesses: { A: businessA.id, B: businessB.id },
    users: ['admin_a', 'admin_b', 'employee_a', platformUsername],
    platformRole: 'PLATFORM_ADMIN',
    passwordEnv: 'SEED_DEV_PASSWORD',
    platformUsernameEnv: 'SEED_PLATFORM_USERNAME',
    passwordDefaultUsed: !process.env.SEED_DEV_PASSWORD,
  }));
}

main()
  .catch((e) => {
    console.error('❌ Seed falló:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
