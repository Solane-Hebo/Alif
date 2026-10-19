import { formatMoney } from "@/lib/utils/money";

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  status:
    | "IN_STOCK"
    | "LOW_STOCK"
    | "OUT_OF_STOCK";
  canViewFinancials: boolean;
  inventoryValue?: number;
};

type InventoryTableProps = {
  products: InventoryItem[];
  currency: string;
  locale: string;
};

export function InventoryTable({
  products,
  currency,
  locale,
}: InventoryTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border bg-white px-4 py-10 text-center text-sm text-slate-500">
        No active products found.
      </div>
    );
  }

  const canViewFinancials =
    products[0]?.canViewFinancials ===
    true;

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold">
              Product
            </th>

            <th className="px-4 py-3 text-right font-semibold">
              Stock
            </th>

            <th className="px-4 py-3 text-right font-semibold">
              Low stock at
            </th>

            <th className="px-4 py-3 font-semibold">
              Status
            </th>

            {canViewFinancials ? (
              <th className="px-4 py-3 text-right font-semibold">
                Inventory value
              </th>
            ) : null}
          </tr>
        </thead>

        <tbody className="divide-y">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">
                  {product.name}
                </div>

                <div className="text-xs text-slate-500">
                  {product.sku}
                </div>
              </td>

              <td className="px-4 py-3 text-right font-medium">
                {product.stockQuantity}
              </td>

              <td className="px-4 py-3 text-right text-slate-600">
                {product.lowStockThreshold}
              </td>

              <td className="px-4 py-3">
                {product.status ===
                "OUT_OF_STOCK" ? (
                  <span className="whitespace-nowrap rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                    Out of stock
                  </span>
                ) : product.status ===
                  "LOW_STOCK" ? (
                  <span className="whitespace-nowrap rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                    Low stock
                  </span>
                ) : (
                  <span className="whitespace-nowrap rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                    In stock
                  </span>
                )}
              </td>

              {product.canViewFinancials ? (
                <td className="px-4 py-3 text-right font-medium">
                  {formatMoney(
                    product.inventoryValue ??
                      0,
                    currency,
                    locale
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}