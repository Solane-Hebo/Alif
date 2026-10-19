import Link from "next/link";
import {
  ArrowRight,
  ShoppingBag,
  Trophy,
} from "lucide-react";

import { formatMoney } from "@/lib/utils/money";

type TopSellingProduct = {
  rank: number;
  productName: string;
  productSku: string;
  unitsSold: number;
  revenue: number;
  salesCount: number;
};

type TopSellingProductsProps = {
  products: TopSellingProduct[];
  currency: string;
  locale: string;
};

export function TopSellingProducts({
  products,
  currency,
  locale,
}: TopSellingProductsProps) {
  return (
    <section
      className="h-full rounded-xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby="top-selling-heading"
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2
            id="top-selling-heading"
            className="font-semibold text-slate-950"
          >
            Top Selling Products
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Ranked by units sold
          </p>
        </div>

        <Link
          href="/reports"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          View reports

          <ArrowRight
            className="size-4"
            aria-hidden="true"
          />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-emerald-50">
            <ShoppingBag
              className="size-5 text-emerald-700"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 font-medium text-slate-900">
            No sales data yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Top products will appear
            after completed sales.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {products.map((product) => (
            <div
              key={`${product.productSku}-${product.rank}`}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg font-semibold ${
                    product.rank === 1
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {product.rank === 1 ? (
                    <Trophy
                      className="size-5"
                      aria-label="Top selling product"
                    />
                  ) : (
                    <span aria-label={`Rank ${product.rank}`}>
                      {product.rank}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {product.productName}
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    SKU {product.productSku}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-semibold text-slate-900">
                  {product.unitsSold.toLocaleString(
                    locale
                  )}{" "}
                  sold
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatMoney(
                    product.revenue,
                    currency,
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