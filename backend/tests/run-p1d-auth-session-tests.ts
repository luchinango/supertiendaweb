/**
 * P1-D — pruebas de contrato JWT (sin DB / sin HTTP).
 * Ejecutar: npx ts-node --transpile-only tests/run-p1d-auth-session-tests.ts
 */
import assert from 'assert';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

type JwtTokenType = 'access' | 'refresh';

interface TokenPayload {
  userId: number;
  username: string;
  businessId: number;
  role: string;
  tokenType: JwtTokenType;
}

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

function sign(payload: TokenPayload, expiresIn: string | number): string {
  return jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

function verify(token: string, expected: JwtTokenType): TokenPayload {
  const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as TokenPayload;
  if (decoded.tokenType !== expected) {
    throw new Error(
      expected === 'refresh'
        ? 'Se requiere un refresh token válido'
        : 'Se requiere un access token válido'
    );
  }
  return decoded;
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

const base = {
  userId: 1,
  username: 'admin_a',
  businessId: 1,
  role: 'ADMIN',
};

test('access y refresh tienen tokenType distinto', () => {
  const access = sign({ ...base, tokenType: 'access' }, '1h');
  const refresh = sign({ ...base, tokenType: 'refresh' }, '7d');
  assert.notStrictEqual(access, refresh);
  assert.strictEqual(verify(access, 'access').tokenType, 'access');
  assert.strictEqual(verify(refresh, 'refresh').tokenType, 'refresh');
});

test('access token no sirve como refresh', () => {
  const access = sign({ ...base, tokenType: 'access' }, '1h');
  assert.throws(() => verify(access, 'refresh'), /refresh token/);
});

test('refresh token no sirve como access', () => {
  const refresh = sign({ ...base, tokenType: 'refresh' }, '7d');
  assert.throws(() => verify(refresh, 'access'), /access token/);
});

test('token manipulado (firma inválida) se rechaza', () => {
  const access = sign({ ...base, tokenType: 'access' }, '1h');
  const tampered = access.slice(0, -4) + 'xxxx';
  assert.throws(() => verify(tampered, 'access'));
});

test('token expirado se rechaza', () => {
  const expired = sign({ ...base, tokenType: 'refresh' }, -10);
  assert.throws(() => verify(expired, 'refresh'), (err: unknown) => err instanceof jwt.TokenExpiredError);
});

test('claim businessId no se confunde entre empresas en payload firmado', () => {
  const a = sign({ ...base, businessId: 1, tokenType: 'access' }, '1h');
  const b = sign({ ...base, businessId: 2, tokenType: 'access' }, '1h');
  assert.strictEqual(verify(a, 'access').businessId, 1);
  assert.strictEqual(verify(b, 'access').businessId, 2);
  assert.notStrictEqual(a, b);
});

console.log(`\nResultado P1-D auth session: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
