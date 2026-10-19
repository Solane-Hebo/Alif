import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  PackageCheck,
} from "lucide-react";

type LowStockProduct = {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
};

type LowStockProductsProps = {
  products: LowStockProduct[];
  locale: string;
};

export function LowStockProducts({
  products,
  locale,
}: LowStockProductsProps) {
  return (
    <section
      className="h-full rounded-xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby="low-stock-heading"
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2
            id="low-stock-heading"
            className="font-semibold text-slate-950"
          >
            Low Stock
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Products that need attention
          </p>
        </div>

        <Link
          href="/inventory"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          View inventory

          <ArrowRight
            className="size-4"
            aria-hidden="true"
          />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-emerald-50">
            <PackageCheck
              className="size-5 text-emerald-700"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 font-medium text-slate-900">
            Stock levels look good
          </p>

          <p className="mt-1 text-sm text-slate-500">
            No products are currently
            at or below their low-stock
            threshold.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                  <AlertTriangle
                    className="size-5 text-amber-700"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {product.name}
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    SKU {product.sku}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-semibold text-amber-700">
                  {product.stockQuantity.toLocaleString(
                    locale
                  )}{" "}
                  in stock
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Threshold{" "}
                  {product.lowStockThreshold.toLocaleString(
                    locale
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}