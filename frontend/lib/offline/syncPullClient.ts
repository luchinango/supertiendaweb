import type { SyncPullResponse, TenantScope } from './types';
import { OfflineStorageError } from './types';

export type PullTransport = (args: {
  scope: TenantScope;
  accessToken: string;
  cursor?: string;
  limit?: number;
  streams?: string;
}) => Promise<SyncPullResponse>;

function assertPullShape(body: SyncPullResponse): void {
  if (!body || typeof body !== 'object') {
    throw new OfflineStorageError('Respuesta pull inválida', 'NETWORK');
  }
  if (typeof body.cursor !== 'string' || typeof body.snapshotAt !== 'string') {
    throw new OfflineStorageError('pull sin cursor/snapshotAt', 'NETWORK');
  }
  if (typeof body.hasMore !== 'boolean' || !Array.isArray(body.changes)) {
    throw new OfflineStorageError('pull sin hasMore/changes', 'NETWORK');
  }
  for (const ch of body.changes) {
    if (
      !ch ||
      (ch.stream !== 'catalog' && ch.stream !== 'stock') ||
      (ch.entityType !== 'product' &&
        ch.entityType !== 'category' &&
        ch.entityType !== 'businessProduct') ||
      typeof ch.serverId !== 'number' ||
      typeof ch.version !== 'number' ||
      typeof ch.updatedAt !== 'string' ||
      typeof ch.deleted !== 'boolean'
    ) {
      throw new OfflineStorageError('change[] con forma inesperada', 'NETWORK');
    }
  }
}

/** Transport HTTP real GET /sync/pull */
export function createBrowserPullTransport(apiBase?: string): PullTransport {
  const base =
    apiBase ||
    (typeof process !== 'undefined' && process.env['NEXT_PUBLIC_API_URL']) ||
    '';

  return async ({ scope, accessToken, cursor, limit, streams }) => {
    const qs = new URLSearchParams();
    if (cursor) qs.set('cursor', cursor);
    if (limit != null) qs.set('limit', String(limit));
    qs.set('streams', streams || 'catalog,stock');
    const url = `${base}/sync/pull?${qs.toString()}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Device-Id': scope.deviceId,
        },
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new OfflineStorageError(`pull_http_${res.status}:${text.slice(0, 200)}`, 'NETWORK');
      }
      const body = (await res.json()) as SyncPullResponse;
      assertPullShape(body);
      return body;
    } finally {
      clearTimeout(timer);
    }
  };
}

/**
 * Descarga todas las páginas de un snapshot (hasta hasMore=false).
 * Persistir cursor entre páginas es responsabilidad del caller (orquestador).
 */
export async function pullAllPages(opts: {
  scope: TenantScope;
  accessToken: string;
  transport: PullTransport;
  /** Cursor persistido de sesión incompleta; vacío = nuevo snapshot */
  startCursor?: string;
  limit?: number;
  streams?: string;
  maxPages?: number;
  onPage?: (page: SyncPullResponse, pageIndex: number) => Promise<void> | void;
}): Promise<{ pages: SyncPullResponse[]; last: SyncPullResponse | null }> {
  const pages: SyncPullResponse[] = [];
  let cursor = opts.startCursor || '';
  const maxPages = opts.maxPages ?? 500;

  for (let i = 0; i < maxPages; i++) {
    const page = await opts.transport({
      scope: opts.scope,
      accessToken: opts.accessToken,
      cursor: cursor || undefined,
      limit: opts.limit ?? 50,
      streams: opts.streams,
    });
    pages.push(page);
    if (opts.onPage) await opts.onPage(page, i);
    cursor = page.cursor;
    if (!page.hasMore) break;
  }

  return { pages, last: pages.length ? pages[pages.length - 1]! : null };
}
