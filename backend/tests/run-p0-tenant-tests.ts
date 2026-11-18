/**
 * Pruebas P0 de aislamiento multiempresa (sin Jest / sin DB).
 * Ejecutar: npx ts-node --transpile-only tests/run-p0-tenant-tests.ts
 */
import assert from 'assert';
import { Request } from 'express';
import { ForbiddenError, UnauthorizedError } from '../src/errors';
import { requireAuthUser, resolveBusinessId } from '../src/helpers/tenantContext';
import { requirePlatformUser } from '../src/helpers/platformAuth';

function mockRequest(user?: Record<string, unknown>): Request {
  return { user } as unknown as Request;
}

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${name}`);
    console.error(error);
  }
}

test('requireAuthUser rechaza sin usuario', () => {
  assert.throws(() => requireAuthUser(mockRequest(undefined)), UnauthorizedError);
});

test('requireAuthUser rechaza sin businessId', () => {
  assert.throws(
    () => requireAuthUser(mockRequest({ userId: 10, username: 'a', role: 'ADMIN' })),
    UnauthorizedError
  );
});

test('requireAuthUser normaliza usuario', () => {
  const user = requireAuthUser(
    mockRequest({ userId: 10, businessId: 7, username: 'caja', role: 'EMPLOYEE' })
  );
  assert.strictEqual(user.businessId, 7);
  assert.strictEqual(user.userId, 10);
});

test('resolveBusinessId usa JWT', () => {
  const id = resolveBusinessId(
    mockRequest({ userId: 1, businessId: 42, username: 'u', role: 'ADMIN' })
  );
  assert.strictEqual(id, 42);
});

test('resolveBusinessId acepta query coincidente', () => {
  const id = resolveBusinessId(
    mockRequest({ userId: 1, businessId: 42, username: 'u', role: 'ADMIN' }),
    42
  );
  assert.strictEqual(id, 42);
});

test('resolveBusinessId bloquea acceso cruzado', () => {
  assert.throws(
    () =>
      resolveBusinessId(
        mockRequest({ userId: 1, businessId: 42, username: 'u', role: 'ADMIN' }),
        99
      ),
    ForbiddenError
  );
});

test('resolveBusinessId no cae a businessId=1', () => {
  assert.throws(
    () => resolveBusinessId(mockRequest({ userId: 1, username: 'u', role: 'ADMIN' })),
    UnauthorizedError
  );
});

test('purchase-orders: query businessId ajeno → Forbidden', () => {
  assert.throws(
    () =>
      resolveBusinessId(
        mockRequest({ userId: 5, businessId: 10, username: 'caja', role: 'ADMIN' }),
        99
      ),
    ForbiddenError
  );
});

test('purchase-orders: path businessId debe coincidir con JWT', () => {
  const id = resolveBusinessId(
    mockRequest({ userId: 5, businessId: 10, username: 'caja', role: 'ADMIN' }),
    10
  );
  assert.strictEqual(id, 10);
  assert.throws(
    () =>
      resolveBusinessId(
        mockRequest({ userId: 5, businessId: 10, username: 'caja', role: 'ADMIN' }),
        11
      ),
    ForbiddenError
  );
});

test('purchase-orders: body businessId ajeno en create → Forbidden', () => {
  assert.throws(
    () =>
      resolveBusinessId(
        mockRequest({ userId: 5, businessId: 10, username: 'caja', role: 'ADMIN' }),
        77
      ),
    ForbiddenError
  );
});

test('purchase-orders: listado usa JWT sin businessId de cliente', () => {
  const id = resolveBusinessId(
    mockRequest({ userId: 5, businessId: 10, username: 'caja', role: 'ADMIN' }),
    undefined
  );
  assert.strictEqual(id, 10);
});

test('requireAuthUser rechaza PLATFORM_ADMIN en rutas tenant', () => {
  assert.throws(
    () =>
      requireAuthUser(
        mockRequest({ userId: 9, businessId: null as unknown as number, username: 'plat', role: 'PLATFORM_ADMIN' })
      ),
    ForbiddenError
  );
});

test('requirePlatformUser acepta PLATFORM_ADMIN sin businessId', () => {
  const user = requirePlatformUser(
    mockRequest({ userId: 9, businessId: null as unknown as number, username: 'plat', role: 'PLATFORM_ADMIN' })
  );
  assert.strictEqual(user.role, 'PLATFORM_ADMIN');
  assert.strictEqual(user.businessId, null);
});

test('requirePlatformUser rechaza ADMIN de empresa', () => {
  assert.throws(
    () =>
      requirePlatformUser(
        mockRequest({ userId: 1, businessId: 1, username: 'admin_a', role: 'ADMIN' })
      ),
    ForbiddenError
  );
});

console.log(`\nResultado P0 tenant: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
