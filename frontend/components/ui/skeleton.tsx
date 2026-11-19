import { cn } from '@/lib/utils';

/** Placeholder de carga — solo presentación. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200/80', className)}
      data-testid="skeleton"
      {...props}
    />
  );
}

export function CatalogGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 xl:grid-cols-4"
      data-testid="catalog-grid-skeleton"
      aria-busy="true"
      aria-label="Cargando catálogo"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-md border bg-[#fafafa] p-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="mt-2 h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function TableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-3" data-testid="table-rows-skeleton" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
