import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  applyPushResults,
  applyPullChanges,
  clearSessionExpirations,
  closeAllOfflineDbs,
  createScope,
  deleteOfflineDbForTests,
  listOutbox,
  openOfflineDb,
  setSessionExpirations,
  type SyncPullChange,
} from '@/lib/offline';
import { listCommercialCatalog } from '@/lib/catalog/commercialCatalogService';
import {
  evaluateOfflineCashAuth,
  OFFLINE_CASH_AUTH_MAX_MS,
  upsertConfirmedCash,
} from '@/lib/pos/posCashAuth';
import {
  migrateSessionPendingSale,
  persistSaleCreate,
} from '@/lib/pos/posSaleOfflineService';
import { savePendingSale } from '@/lib/pos/posOnlineService';

const scope = createScope(20, 2, 'dev-pos-c1c');

beforeEach(async () => {
  clearSessionExpirations();
  setSessionExpirations({
    accessExpiresAt: Date.now() + 3_600_000,
    refreshExpiresAt: Date.now() + 7 * 86_400_000,
  });
  sessionStorage.clear();
  await deleteOfflineDbForTests(scope);
});

afterEach(async () => {
  await closeAllOfflineDbs();
});

async function seedCatalogAndCash() {
  const changes: SyncPullChange[] = [
    {
      stream: 'catalog',
      entityType: 'product',
      serverId: 70,
      version: 1,
      updatedAt: '2026-01-01T00:00:00.000Z',
      deleted: false,
      payload: {
        name: 'POS Item',
        sku: 'POS-1',
        visibility: 'BUSINESS_PRIVATE',
        businessId: 2,
        categoryId: 1,
        sellingPrice: 50,
      },
    },
    {
      stream: 'stock',
      entityType: 'businessProduct',
      serverId: 700,
      version: 2,
      updatedAt: '2026-01-01T00:00:00.000Z',
      deleted: false,
      payload: {
        productId: 70,
        customPrice: 12.5,
        currentStock: 20,
        reservedStock: 0,
        availableStock: 20,
      },
    },
  ];
  await applyPullChanges(scope, changes);
  const openingDate = new Date().toISOString();
  await upsertConfirmedCash(scope, {
    id: 55,
    businessId: 2,
    userId: 20,
    deviceId: 'dev-pos-c1c',
    registerNumber: 'REG-55',
    version: 1,
    status: 'OPEN',
    openingAmount: '100',
    currentAmount: '100',
    openingDate,
    notes: null,
    leaseId: 'cl_55_test',
    leaseIssuedAt: openingDate,
    leaseExpiresAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
    cashLeaseToken: 'dGVzdA.dGVzdA', // presencia local; firma real se valida en servidor
  });
}

describe('P2-C1.C POS offline sales + cash auth', () => {
  it('bloquea ventas offline sin caja confirmada', async () => {
    await expect(
      persistSaleCreate(scope, {
        cashRegisterId: 1,
        lines: [
          {
            businessProductId: 1,
            quantity: 1,
            unitPrice: 10,
            baseVersion: 1,
            productName: 'X',
          },
        ],
        cashReceived: 20,
      })
    ).rejects.toMatchObject({ code: 'CASH_NOT_CONFIRMED' });
  });

  it('bloquea autorización offline si lease venció', async () => {
    const openingDate = '2020-01-01T00:00:00.000Z';
    await upsertConfirmedCash(scope, {
      id: 9,
      businessId: 2,
      userId: 20,
      deviceId: 'dev-pos-c1c',
      registerNumber: 'OLD',
      version: 1,
      status: 'OPEN',
      openingAmount: '10',
      currentAmount: '10',
      openingDate,
      notes: null,
      leaseId: 'cl_9_old',
      leaseIssuedAt: openingDate,
      leaseExpiresAt: new Date(Date.now() - 1000).toISOString(),
      cashLeaseToken: 'dGVzdA.dGVzdA',
    });
    const db = await openOfflineDb(scope);
    const auth = evaluateOfflineCashAuth(scope, (await db.cashRegisters.get(9)) ?? null);
    expect(auth.ok).toBe(false);
    if (!auth.ok) expect(auth.code).toBe('LEASE_EXPIRED');
  });

  it('bloquea sin cashLeaseToken', async () => {
    await upsertConfirmedCash(scope, {
      id: 88,
      businessId: 2,
      userId: 20,
      deviceId: 'dev-pos-c1c',
      registerNumber: 'NOLEASE',
      version: 1,
      status: 'OPEN',
      openingAmount: '10',
      currentAmount: '10',
      openingDate: new Date().toISOString(),
      notes: null,
    });
    const db = await openOfflineDb(scope);
    const auth = evaluateOfflineCashAuth(scope, (await db.cashRegisters.get(88)) ?? null);
    expect(auth.ok).toBe(false);
    if (!auth.ok) expect(auth.code).toBe('LEASE_MISSING');
  });

  it('persiste venta + outbox atómicamente y descuenta stock visible', async () => {
    await seedCatalogAndCash();
    const before = await listCommercialCatalog(scope);
    expect(before[0]!.availableStock).toBe(20);

    const { sale, outbox } = await persistSaleCreate(scope, {
      cashRegisterId: 55,
      lines: [
        {
          businessProductId: 700,
          quantity: 3,
          unitPrice: 12.5,
          baseVersion: 2,
          productName: 'POS Item',
          sku: 'POS-1',
        },
      ],
      cashReceived: 50,
      notes: 'test offline',
    });

    expect(sale.syncStatus).toBe('pending');
    expect(sale.commercialNumber).toBeNull();
    // 3 × 12.50 + IVA 13% = 37.50 + 4.88 = 42.38 (fórmula SALE_CREATE)
    expect(sale.provisionalTotal).toBe(42.38);
    expect(outbox.operationType).toBe('SALE_CREATE');
    expect(outbox.status).toBe('pending');
    expect(outbox.payload['cashRegisterId']).toBe(55);
    expect((outbox.payload['lines'] as unknown[])[0]).toMatchObject({
      businessProductId: 700,
      quantity: 3,
      unitPrice: 12.5,
      baseVersion: 2,
    });

    const after = await listCommercialCatalog(scope);
    expect(after[0]!.availableStock).toBe(17);

    const ops = await listOutbox(scope, ['pending']);
    expect(ops.some((o) => o.clientOperationId === sale.clientOperationId)).toBe(true);

    // Doble persist mismo UUID no duplica
    const again = await persistSaleCreate(scope, {
      clientOperationId: sale.clientOperationId,
      localSaleId: sale.localId,
      cashRegisterId: 55,
      lines: sale.lines,
      cashReceived: 50,
    });
    expect(again.outbox.clientOperationId).toBe(sale.clientOperationId);
    const pending = await listOutbox(scope, ['pending']);
    expect(pending.filter((o) => o.operationType === 'SALE_CREATE')).toHaveLength(1);
  });

  it('applyPushResults confirma venta y libera stock reservado', async () => {
    await seedCatalogAndCash();
    const { sale } = await persistSaleCreate(scope, {
      cashRegisterId: 55,
      lines: [
        {
          businessProductId: 700,
          quantity: 2,
          unitPrice: 12.5,
          baseVersion: 2,
          productName: 'POS Item',
        },
      ],
      cashReceived: 30,
    });

    const db = await openOfflineDb(scope);
    await applyPushResults(db, [
      {
        clientOperationId: sale.clientOperationId,
        status: 'applied',
        serverEntityId: 9001,
        idMappings: [{ entityType: 'sale', localEntityId: sale.localId, serverId: 9001 }],
        server: {
          commercialNumber: 'COM-2-000042',
          totalAmount: 25,
        },
      },
    ]);

    const confirmed = await db.sales.get(sale.localId);
    expect(confirmed?.syncStatus).toBe('confirmed');
    expect(confirmed?.commercialNumber).toBe('COM-2-000042');
    expect(confirmed?.serverSaleId).toBe(9001);

    const out = await db.outbox.get(sale.clientOperationId);
    expect(out?.status).toBe('acked');

    const rows = await listCommercialCatalog(scope);
    expect(rows[0]!.availableStock).toBe(20);

    const { listRecentConfirmedLocalSales, listPendingLocalSales } = await import(
      '@/lib/pos/posSaleOfflineService'
    );
    expect(await listPendingLocalSales(scope)).toHaveLength(0);
    const recent = await listRecentConfirmedLocalSales(scope, 5);
    expect(recent.some((s) => s.commercialNumber === 'COM-2-000042')).toBe(true);
  });

  it('migra pending sessionStorage B2-B sin duplicar', async () => {
    await seedCatalogAndCash();
    const clientOperationId = '11111111-1111-4111-8111-111111111111';
    const localSaleId = '22222222-2222-4222-8222-222222222222';
    savePendingSale({
      clientOperationId,
      localSaleId,
      cashRegisterId: 55,
      businessId: 2,
      deviceId: 'dev-pos-c1c',
      lines: [
        {
          businessProductId: 700,
          quantity: 1,
          unitPrice: 12.5,
          baseVersion: 2,
          productName: 'POS Item',
        },
      ],
      cashReceived: 20,
      createdAt: new Date().toISOString(),
    });

    const migrated = await migrateSessionPendingSale(scope);
    expect(migrated?.clientOperationId).toBe(clientOperationId);
    expect(sessionStorage.getItem('supertienda_pos_pending_sale')).toBeNull();

    const again = await migrateSessionPendingSale(scope);
    expect(again).toBeNull();

    const ops = await listOutbox(scope, ['pending']);
    expect(ops.filter((o) => o.clientOperationId === clientOperationId)).toHaveLength(1);
  });

  it('GET open no extiende leaseExpiresAt', async () => {
    const old = new Date(Date.now() - 60_000).toISOString();
    const exp = new Date(Date.now() + 3_600_000).toISOString();
    await upsertConfirmedCash(scope, {
      id: 77,
      businessId: 2,
      userId: 20,
      deviceId: 'dev-pos-c1c',
      registerNumber: 'REG-77',
      version: 1,
      status: 'OPEN',
      openingAmount: '50',
      currentAmount: '50',
      openingDate: old,
      notes: null,
      leaseId: 'cl_77',
      leaseIssuedAt: old,
      leaseExpiresAt: exp,
      cashLeaseToken: 'dGVzdA.dGVzdA',
    });
    const db = await openOfflineDb(scope);
    await db.cashRegisters.put({
      ...(await db.cashRegisters.get(77))!,
      serverConfirmedAt: old,
    });
    await upsertConfirmedCash(scope, {
      id: 77,
      businessId: 2,
      userId: 20,
      deviceId: 'dev-pos-c1c',
      registerNumber: 'REG-77',
      version: 2,
      status: 'OPEN',
      openingAmount: '50',
      currentAmount: '80',
      openingDate: old,
      notes: null,
      leaseId: 'cl_77',
      leaseIssuedAt: old,
      leaseExpiresAt: new Date(Date.now() + OFFLINE_CASH_AUTH_MAX_MS).toISOString(),
      cashLeaseToken: 'dGVzdA.bmV3',
    });
    const row = await db.cashRegisters.get(77);
    expect(row?.leaseExpiresAt).toBe(exp);
    expect(row?.cashLeaseToken).toBe('dGVzdA.dGVzdA');
    expect(row?.currentAmount).toBe('80');
    expect(row?.version).toBe(2);
  });

  it('rechazo definitivo libera stock visible', async () => {
    await seedCatalogAndCash();
    const { sale } = await persistSaleCreate(scope, {
      cashRegisterId: 55,
      lines: [
        {
          businessProductId: 700,
          quantity: 4,
          unitPrice: 12.5,
          baseVersion: 2,
          productName: 'POS Item',
        },
      ],
      cashReceived: 60,
    });
    expect((await listCommercialCatalog(scope))[0]!.availableStock).toBe(16);

    const db = await openOfflineDb(scope);
    await applyPushResults(db, [
      {
        clientOperationId: sale.clientOperationId,
        status: 'rejected',
        code: 'INSUFFICIENT_STOCK',
        message: 'sin stock',
        retryable: false,
      },
    ]);
    expect((await db.sales.get(sale.localId))?.syncStatus).toBe('rejected');
    expect((await listCommercialCatalog(scope))[0]!.availableStock).toBe(20);
  });

  it('bloquea lease con usuario/empresa/dispositivo incorrectos', async () => {
    const openingDate = new Date().toISOString();
    await upsertConfirmedCash(scope, {
      id: 66,
      businessId: 2,
      userId: 20,
      deviceId: 'dev-pos-c1c',
      registerNumber: 'REG-66',
      version: 1,
      status: 'OPEN',
      openingAmount: '10',
      currentAmount: '10',
      openingDate,
      notes: null,
      leaseId: 'cl_66',
      leaseIssuedAt: openingDate,
      leaseExpiresAt: new Date(Date.now() + 3600_000).toISOString(),
      cashLeaseToken: 'dGVzdA.dGVzdA',
    });
    const db = await openOfflineDb(scope);
    const row = (await db.cashRegisters.get(66))!;

    expect(
      evaluateOfflineCashAuth(createScope(20, 99, 'dev-pos-c1c'), row).ok
    ).toBe(false);
    expect(
      evaluateOfflineCashAuth(createScope(99, 2, 'dev-pos-c1c'), row).ok
    ).toBe(false);
    expect(
      evaluateOfflineCashAuth(createScope(20, 2, 'other-device'), row).ok
    ).toBe(false);
  });

  it('bloquea venta offline con reloj local pasado expiresAt', async () => {
    await seedCatalogAndCash();
    const db = await openOfflineDb(scope);
    const row = (await db.cashRegisters.get(55))!;
    const futureNow = Date.parse(row.leaseExpiresAt!) + 5_000;
    const auth = evaluateOfflineCashAuth(scope, row, futureNow);
    expect(auth.ok).toBe(false);
    if (!auth.ok) expect(auth.code).toBe('LEASE_EXPIRED');
  });

  it('bloquea mutación offline con sesión vencida', async () => {
    await seedCatalogAndCash();
    setSessionExpirations({
      accessExpiresAt: Date.now() - 1_000,
      refreshExpiresAt: Date.now() - 1_000,
    });
    await expect(
      persistSaleCreate(scope, {
        cashRegisterId: 55,
        lines: [
          {
            businessProductId: 700,
            quantity: 1,
            unitPrice: 12.5,
            baseVersion: 2,
            productName: 'POS Item',
          },
        ],
        cashReceived: 20,
      })
    ).rejects.toMatchObject({ code: 'SESSION_BLOCKED' });
  });

  it('rechaza cantidad cero y efectivo insuficiente', async () => {
    await seedCatalogAndCash();
    await expect(
      persistSaleCreate(scope, {
        cashRegisterId: 55,
        lines: [
          {
            businessProductId: 700,
            quantity: 0,
            unitPrice: 12.5,
            baseVersion: 2,
            productName: 'POS Item',
          },
        ],
        cashReceived: 10,
      })
    ).rejects.toMatchObject({ code: 'VALIDATION' });

    await expect(
      persistSaleCreate(scope, {
        cashRegisterId: 55,
        lines: [
          {
            businessProductId: 700,
            quantity: 1,
            unitPrice: 12.5,
            baseVersion: 2,
            productName: 'POS Item',
          },
        ],
        cashReceived: 1,
      })
    ).rejects.toMatchObject({ code: 'VALIDATION' });
  });
});
