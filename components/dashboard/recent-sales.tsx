import Link from "next/link";
import {
  ArrowRight,
  ShoppingCart,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  formatDateTime,
  type SupportedCalendar,
} from "@/lib/utils/date-format";
import { formatMoney } from "@/lib/utils/money";

type RecentSale = {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  revenue: number;
  status: string;
  soldByName: string;
  createdAt: string;

  canViewFinancials: boolean;

  cost?: number;
  profit?: number;
};

type RecentSalesProps = {
  sales: RecentSale[];
  currency: string;
  locale: string;
  timezone: string;
  calendar: SupportedCalendar;
};

export function RecentSales({
  sales,
  currency,
  locale,
  timezone,
  calendar,
}: RecentSalesProps) {
  return (
    <section
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby="recent-sales-heading"
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2
            id="recent-sales-heading"
            className="font-semibold text-slate-950"
          >
            Recent Sales
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest sales activity
          </p>
        </div>

        <Link
          href="/sales"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          View all

          <ArrowRight
            className="size-4"
            aria-hidden="true"
          />
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-emerald-50">
            <ShoppingCart
              className="size-5 text-emerald-700"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 font-medium text-slate-900">
            No sales yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Recent sales will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-slate-900">
                    {sale.productName}
                  </p>

                  <Badge
                    variant={
                      sale.status ===
                      "COMPLETED"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {sale.status ===
                    "COMPLETED"
                      ? "Completed"
                      : "Voided"}
                  </Badge>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {sale.productSku}
                  {" · "}
                  Qty{" "}
                  {sale.quantity.toLocaleString(
                    locale
                  )}
                  {" · "}
                  {sale.soldByName}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {formatDateTime(
                    sale.createdAt,
                    {
                      locale,
                      timezone,
                      calendar,
                    }
                  )}
                </p>
              </div>

              <div className="shrink-0 sm:text-right">
                <p className="font-semibold text-slate-900">
                  {formatMoney(
                    sale.revenue,
                    currency,
                    locale
                  )}
                </p>

                {sale.canViewFinancials &&
                sale.profit !==
                  undefined ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Profit{" "}
                    {formatMoney(
                      sale.profit,
                      currency,
                      locale
                    )}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}