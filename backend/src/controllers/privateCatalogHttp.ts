import { ValidationError } from '../errors';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function requireIdempotencyKey(headerValue?: string): string {
  const key = headerValue?.trim();
  if (!key || !UUID_RE.test(key)) {
    throw new ValidationError(
      'Header Idempotency-Key UUID es obligatorio',
      'INVALID_IDEMPOTENCY_KEY'
    );
  }
  return key;
}

export function readCommercialDeviceId(headerValue?: string): string {
  const v = headerValue?.trim();
  if (!v) return 'commercial-http';
  if (v.length > 64) {
    throw new ValidationError('X-Device-Id excede 64 caracteres');
  }
  return v;
}
