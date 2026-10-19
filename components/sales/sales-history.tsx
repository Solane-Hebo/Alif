import { VoidSaleButton } from "@/components/sales/void-sale-button";
import { formatMoney } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/date-format";

type SaleItem = {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  salePrice: number;
  revenue: number;
  status: string;
  soldByName: string;
  createdAt: string;

  canViewFinancials: boolean;

  purchasePriceAtSale?: number;
  cost?: number;
  profit?: number;
};

type SalesHistoryProps = {
  sales: SaleItem[];
  canManageSales: boolean;
  currency: string;
  locale: string;
  timezone: string;
  calendar: "gregory" | "ethiopic";
};

export function SalesHistory({
  sales,
  canManageSales,
  currency,
  locale,
  timezone,
  calendar,
}: SalesHistoryProps) {
  if (sales.length === 0) {
    return (
      <div className="rounded-xl border bg-white px-4 py-10 text-center text-sm text-slate-500">
        No sales registered yet.
      </div>
    );
  }

  const canViewFinancials =
    sales[0]?.canViewFinancials === true;

 function formatSaleDate(
  value: string
) {
  return formatDateTime(
    value,
    {
      locale,
      timezone,
      calendar,
    }
  );
}
  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto rounded-xl border bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 font-semibold"
              >
                Product
              </th>

              <th
                scope="col"
                className="px-4 py-3 font-semibold"
              >
                Sold by
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-right font-semibold"
              >
                Qty
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-right font-semibold"
              >
                Sale price
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-right font-semibold"
              >
                Revenue
              </th>

              {canViewFinancials ? (
                <>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-semibold"
                  >
                    Cost
                  </th>

                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-semibold"
                  >
                    Profit
                  </th>
                </>
              ) : null}

              <th
                scope="col"
                className="px-4 py-3 font-semibold"
              >
                Status
              </th>

              <th
                scope="col"
                className="px-4 py-3 font-semibold"
              >
                Date
              </th>

              {canManageSales ? (
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold"
                >
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody className="divide-y">
            {sales.map((sale) => (
              <tr key={sale.id}>
                {/* Product */}
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">
                    {sale.productName}
                  </div>

                  <div className="text-xs text-slate-500">
                    {sale.productSku}
                  </div>
                </td>

                {/* Sold by */}
                <td className="px-4 py-3 text-slate-600">
                  {sale.soldByName}
                </td>

                {/* Quantity */}
                <td className="px-4 py-3 text-right">
                  {sale.quantity.toLocaleString(
                    locale
                  )}
                </td>

                {/* Sale price */}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {formatMoney(
                    sale.salePrice,
                    currency,
                    locale
                  )}
                </td>

                {/* Revenue */}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {formatMoney(
                    sale.revenue,
                    currency,
                    locale
                  )}
                </td>

                {/* ADMIN-only financial data */}
                {sale.canViewFinancials ? (
                  <>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {formatMoney(
                        sale.cost ?? 0,
                        currency,
                        locale
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-emerald-700">
                      {formatMoney(
                        sale.profit ?? 0,
                        currency,
                        locale
                      )}
                    </td>
                  </>
                ) : null}

                {/* Status */}
                <td className="px-4 py-3">
                  {sale.status ===
                  "COMPLETED" ? (
                    <span className="whitespace-nowrap rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      Completed
                    </span>
                  ) : (
                    <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      Voided
                    </span>
                  )}
                </td>

                {/* Date */}
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatSaleDate(
                    sale.createdAt
                  )}
                </td>

                {/* ADMIN-only actions */}
                {canManageSales ? (
                  <td className="px-4 py-3">
                    {sale.status ===
                    "COMPLETED" ? (
                      <VoidSaleButton
                        saleId={sale.id}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">
                        —
                      </span>
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="grid gap-3 md:hidden">
        {sales.map((sale) => (
          <article
            key={sale.id}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-slate-900">
                  {sale.productName}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  SKU: {sale.productSku}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Sold by{" "}
                  {sale.soldByName}
                </p>
              </div>

              {sale.status ===
              "COMPLETED" ? (
                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                  Completed
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  Voided
                </span>
              )}
            </div>

            {/* Sale information */}
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">
                  Quantity
                </dt>

                <dd className="mt-1 font-medium text-slate-900">
                  {sale.quantity.toLocaleString(
                    locale
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">
                  Sale price
                </dt>

                <dd className="mt-1 font-medium text-slate-900">
                  {formatMoney(
                    sale.salePrice,
                    currency,
                    locale
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">
                  Revenue
                </dt>

                <dd className="mt-1 font-medium text-slate-900">
                  {formatMoney(
                    sale.revenue,
                    currency,
                    locale
                  )}
                </dd>
              </div>

              {/* ADMIN-only cost */}
              {sale.canViewFinancials ? (
                <div>
                  <dt className="text-xs text-slate-500">
                    Cost
                  </dt>

                  <dd className="mt-1 font-medium text-slate-900">
                    {formatMoney(
                      sale.cost ?? 0,
                      currency,
                      locale
                    )}
                  </dd>
                </div>
              ) : null}
            </dl>

            {/* ADMIN-only profit */}
            {sale.canViewFinancials ? (
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-sm text-slate-500">
                  Profit
                </span>

                <span className="font-semibold text-emerald-700">
                  {formatMoney(
                    sale.profit ?? 0,
                    currency,
                    locale
                  )}
                </span>
              </div>
            ) : null}

            {/* Date */}
            <div className="mt-4 border-t pt-3 text-xs text-slate-500">
              {formatSaleDate(
                sale.createdAt
              )}
            </div>

            {/* ADMIN-only actions */}
            {canManageSales &&
            sale.status ===
              "COMPLETED" ? (
              <div className="mt-4 border-t pt-3">
                <VoidSaleButton
                  saleId={sale.id}
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}