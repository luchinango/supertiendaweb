/**
 * Seed DEMO comercial — P2-C1.D
 * Independiente del seed técnico (seed.ts). Idempotente. No borra otras empresas.
 * No crea ventas, cajas ni movimientos históricos.
 *
 * Uso (solo Docker local):
 *   docker exec -w /app \
 *     -e SEED_CONFIRM_LOCAL=1 \
 *     -e SEED_DEV_PASSWORD=DevPass123! \
 *     -e DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev?schema=public \
 *     -e NODE_ENV=development \
 *     supertienda-backend npm run db:seed:demo
 *
 * Usuarios DEMO (password = SEED_DEV_PASSWORD | DevPass123!):
 *   demo_admin_1 / demo_emp_1  → Demo Tienda Norte
 *   demo_admin_2 / demo_emp_2  → Demo Tienda Sur
 *   demo_admin_3 / demo_emp_3  → Demo Minimarket Centro
 *
 * Dispositivos de prueba (client-side X-Device-Id / localStorage):
 *   demo-device-norte-01, demo-device-sur-01, demo-device-centro-01
 */
import bcrypt from 'bcryptjs';
import {
  PrismaClient,
  UserStatus,
  EmployeeStatus,
  Gender,
  BusinessStatus,
  BusinessType,
  Department,
  ProductStatus,
  ProductVisibility,
  CategoryVisibility,
} from '../generated';

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '12', 10);

const DEMO_NITS = ['9100001001', '9100002002', '9100003003'] as const;
const DEMO_SKUS_PREFIX = 'DEMO-';

function assertLocalDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed DEMO bloqueado en production');
  }
  if (process.env.SEED_CONFIRM_LOCAL !== '1') {
    throw new Error('Falta SEED_CONFIRM_LOCAL=1');
  }
  const url = process.env.DATABASE_URL || '';
  const isLocalDocker =
    url.includes('supertienda_dev') &&
    (url.includes('@db:') || url.includes('@localhost') || url.includes('@127.0.0.1'));
  if (!isLocalDocker) {
    throw new Error(`DATABASE_URL no parece Docker local (supertienda_dev). Abortando.`);
  }
  if (/206\.183\.|5217|2932|supabase|pooler\.supabase/i.test(url)) {
    throw new Error('DATABASE_URL parece remota. Abortando seed DEMO.');
  }
}

async function upsertRole(code: string, name: string, description: string) {
  return prisma.role.upsert({
    where: { code },
    update: { name, description, isActive: true },
    create: { code, name, description, isActive: true },
  });
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
      email: `demo-${nit}@demo.local`,
      phone: '70100000',
      address: 'Dirección DEMO',
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
      phone: '70100001',
    },
    create: {
      username: opts.username,
      passwordHash: opts.passwordHash,
      status: UserStatus.ACTIVE,
      roleId: opts.roleId,
      phone: '70100001',
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
        phone: '70100001',
        address: 'Demo address',
        department: 'Operaciones',
      },
    });
  } else {
    const emailTaken = await prisma.employee.findUnique({ where: { email: opts.email } });
    if (emailTaken && emailTaken.userId !== user.id) {
      throw new Error(`Email DEMO en conflicto: ${opts.email}`);
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
        startDate: new Date('2025-01-01T00:00:00.000Z'),
        ciNumber: opts.ciNumber,
        phone: '70100001',
        address: 'Demo address',
        department: 'Operaciones',
      },
    });
  }
  return user;
}

async function upsertSharedCategory(name: string, sortOrder: number) {
  const existing = await prisma.category.findFirst({
    where: { name, visibility: CategoryVisibility.PLATFORM_SHARED, deletedAt: null },
  });
  if (existing) {
    return prisma.category.update({
      where: { id: existing.id },
      data: { isActive: true, description: 'Categoría DEMO compartida', sortOrder, version: { increment: 1 } },
    });
  }
  return prisma.category.create({
    data: {
      name,
      description: 'Categoría DEMO compartida',
      visibility: CategoryVisibility.PLATFORM_SHARED,
      businessId: null,
      isActive: true,
      sortOrder,
      version: 1,
    },
  });
}

async function upsertPrivateCategory(businessId: number, name: string, sortOrder: number) {
  const existing = await prisma.category.findFirst({
    where: {
      businessId,
      name,
      visibility: CategoryVisibility.BUSINESS_PRIVATE,
      deletedAt: null,
    },
  });
  if (existing) {
    return prisma.category.update({
      where: { id: existing.id },
      data: { isActive: true, sortOrder, version: { increment: 1 } },
    });
  }
  return prisma.category.create({
    data: {
      name,
      description: `Privada empresa ${businessId}`,
      visibility: CategoryVisibility.BUSINESS_PRIVATE,
      businessId,
      isActive: true,
      sortOrder,
      version: 1,
    },
  });
}

async function upsertSharedProduct(opts: {
  sku: string;
  barcode: string;
  name: string;
  categoryId: number;
  cost: number;
  price: number;
}) {
  const existing = await prisma.product.findFirst({
    where: { sku: opts.sku, visibility: ProductVisibility.PLATFORM_SHARED, deletedAt: null },
  });
  if (existing) {
    return prisma.product.update({
      where: { id: existing.id },
      data: {
        name: opts.name,
        barcode: opts.barcode,
        categoryId: opts.categoryId,
        costPrice: opts.cost,
        sellingPrice: opts.price,
        status: ProductStatus.ACTIVE,
        isActive: true,
        deletedAt: null,
        version: { increment: 1 },
      },
    });
  }
  return prisma.product.create({
    data: {
      sku: opts.sku,
      barcode: opts.barcode,
      name: opts.name,
      categoryId: opts.categoryId,
      visibility: ProductVisibility.PLATFORM_SHARED,
      businessId: null,
      costPrice: opts.cost,
      sellingPrice: opts.price,
      status: ProductStatus.ACTIVE,
      isActive: true,
      unit: 'pcs',
      minStock: 5,
      reorderPoint: 5,
      version: 1,
    },
  });
}

async function upsertPrivateProduct(opts: {
  businessId: number;
  sku: string;
  barcode: string;
  name: string;
  categoryId: number;
  cost: number;
  price: number;
}) {
  const existing = await prisma.product.findFirst({
    where: {
      sku: opts.sku,
      businessId: opts.businessId,
      visibility: ProductVisibility.BUSINESS_PRIVATE,
      deletedAt: null,
    },
  });
  if (existing) {
    return prisma.product.update({
      where: { id: existing.id },
      data: {
        name: opts.name,
        barcode: opts.barcode,
        categoryId: opts.categoryId,
        costPrice: opts.cost,
        sellingPrice: opts.price,
        status: ProductStatus.ACTIVE,
        isActive: true,
        version: { increment: 1 },
      },
    });
  }
  return prisma.product.create({
    data: {
      sku: opts.sku,
      barcode: opts.barcode,
      name: opts.name,
      categoryId: opts.categoryId,
      visibility: ProductVisibility.BUSINESS_PRIVATE,
      businessId: opts.businessId,
      costPrice: opts.cost,
      sellingPrice: opts.price,
      status: ProductStatus.ACTIVE,
      isActive: true,
      unit: 'pcs',
      minStock: 2,
      reorderPoint: 2,
      version: 1,
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

const SHARED_CATEGORIES = [
  'Abarrotes',
  'Bebidas',
  'Lácteos',
  'Limpieza',
  'Snacks',
  'Cuidado personal',
] as const;

const PRIVATE_CATEGORY_NAMES = ['Marca propia', 'Promociones locales'] as const;

function stockForIndex(i: number): number {
  if (i % 17 === 0) return 0; // sin stock
  if (i % 11 === 0) return 2; // stock bajo
  if (i % 7 === 0) return 8;
  return 20 + (i % 40);
}

function priceForBusiness(base: number, businessIndex: number): number {
  return Math.round((base + businessIndex * 0.75 + (base % 3) * 0.25) * 100) / 100;
}

async function main() {
  assertLocalDatabase();
  const password = process.env.SEED_DEV_PASSWORD || 'DevPass123!';
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  console.log('🌱 Seed DEMO P2-C1.D iniciando (idempotente, sin borrar otras empresas)...');

  const roleAdmin = await upsertRole('ADMIN', 'Administrador', 'Admin de empresa');
  const roleEmployee = await upsertRole('EMPLOYEE', 'Empleado', 'Empleado operativo');

  const businesses = [
    await upsertBusiness(DEMO_NITS[0], 'Demo Tienda Norte', 'Demo Tienda Norte SRL'),
    await upsertBusiness(DEMO_NITS[1], 'Demo Tienda Sur', 'Demo Tienda Sur SRL'),
    await upsertBusiness(DEMO_NITS[2], 'Demo Minimarket Centro', 'Demo Minimarket Centro SRL'),
  ];

  const usersMeta: string[] = [];
  for (let i = 0; i < businesses.length; i++) {
    const b = businesses[i]!;
    const n = i + 1;
    await upsertUserWithEmployee({
      username: `demo_admin_${n}`,
      passwordHash,
      roleId: roleAdmin.id,
      businessId: b.id,
      firstName: `Admin`,
      lastName: `Demo${n}`,
      position: 'Administrador',
      email: `demo_admin_${n}@demo.local`,
      ciNumber: `CI-DEMO-ADM-${n}`,
    });
    await upsertUserWithEmployee({
      username: `demo_emp_${n}`,
      passwordHash,
      roleId: roleEmployee.id,
      businessId: b.id,
      firstName: `Empleado`,
      lastName: `Demo${n}`,
      position: 'Cajero',
      email: `demo_emp_${n}@demo.local`,
      ciNumber: `CI-DEMO-EMP-${n}`,
    });
    usersMeta.push(`demo_admin_${n}`, `demo_emp_${n}`);
  }

  const sharedCats = [];
  for (let i = 0; i < SHARED_CATEGORIES.length; i++) {
    sharedCats.push(await upsertSharedCategory(SHARED_CATEGORIES[i]!, i + 1));
  }

  const privateCatsByBusiness = new Map<number, number[]>();
  for (const b of businesses) {
    const ids: number[] = [];
    for (let i = 0; i < PRIVATE_CATEGORY_NAMES.length; i++) {
      const c = await upsertPrivateCategory(b.id, PRIVATE_CATEGORY_NAMES[i]!, 100 + i);
      ids.push(c.id);
    }
    privateCatsByBusiness.set(b.id, ids);
  }

  // 90 productos compartidos + 20 privados por empresa (60) = 150 productos
  const SHARED_COUNT = 90;
  const PRIVATE_PER_BUSINESS = 20;
  let productCount = 0;
  let bpCount = 0;

  for (let i = 1; i <= SHARED_COUNT; i++) {
    const cat = sharedCats[(i - 1) % sharedCats.length]!;
    const sku = `${DEMO_SKUS_PREFIX}SH-${String(i).padStart(3, '0')}`;
    const basePrice = 5 + (i % 25);
    const product = await upsertSharedProduct({
      sku,
      barcode: `BC${sku}`,
      name: `Demo compartido ${i} (${SHARED_CATEGORIES[(i - 1) % SHARED_CATEGORIES.length]})`,
      categoryId: cat.id,
      cost: Math.max(1, basePrice - 2),
      price: basePrice,
    });
    productCount += 1;
    for (let bi = 0; bi < businesses.length; bi++) {
      const b = businesses[bi]!;
      await upsertBusinessProduct(
        b.id,
        product.id,
        priceForBusiness(basePrice, bi),
        stockForIndex(i + bi * 3)
      );
      bpCount += 1;
    }
  }

  for (let bi = 0; bi < businesses.length; bi++) {
    const b = businesses[bi]!;
    const privCats = privateCatsByBusiness.get(b.id) || [];
    for (let j = 1; j <= PRIVATE_PER_BUSINESS; j++) {
      const idx = bi * 100 + j;
      const catId = privCats[(j - 1) % Math.max(privCats.length, 1)] || sharedCats[0]!.id;
      const sku = `${DEMO_SKUS_PREFIX}P${bi + 1}-${String(j).padStart(3, '0')}`;
      const basePrice = 8 + (j % 20);
      const product = await upsertPrivateProduct({
        businessId: b.id,
        sku,
        barcode: `BC${sku}`,
        name: `Demo privado E${bi + 1} #${j}`,
        categoryId: catId,
        cost: Math.max(1, basePrice - 3),
        price: basePrice,
      });
      productCount += 1;
      await upsertBusinessProduct(b.id, product.id, priceForBusiness(basePrice, bi), stockForIndex(idx));
      bpCount += 1;
    }
  }

  // Secuencias comerciales — requeridas por SALE_CREATE (sin inventar ventas).
  for (const b of businesses) {
    const existing = await prisma.businessDocumentSequence.findUnique({
      where: {
        businessId_docType: { businessId: b.id, docType: 'COMMERCIAL_TICKET' },
      },
    });
    if (!existing) {
      await prisma.businessDocumentSequence.create({
        data: {
          businessId: b.id,
          docType: 'COMMERCIAL_TICKET',
          prefix: 'COM',
          currentNumber: 0,
        },
      });
    }
  }

  console.log('✅ Seed DEMO listo');
  console.log(
    JSON.stringify(
      {
        businesses: businesses.map((b, i) => ({
          id: b.id,
          nit: DEMO_NITS[i],
          name: b.name,
        })),
        users: usersMeta,
        passwordEnv: 'SEED_DEV_PASSWORD',
        passwordDefaultUsed: !process.env.SEED_DEV_PASSWORD,
        productsUpsertedApprox: productCount,
        businessProductsUpsertedApprox: bpCount,
        devices: [
          'demo-device-norte-01',
          'demo-device-sur-01',
          'demo-device-centro-01',
        ],
        note: 'Sin ventas/cajas/movimientos artificiales. No toca empresas técnicas 9000001016/2016. Incluye COMMERCIAL_TICKET.',
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed DEMO falló:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
