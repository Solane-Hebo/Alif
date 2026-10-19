import { InventoryTable } from "@/components/inventory/inventory-table";
import { ReceiveStockForm } from "@/components/inventory/receive-stock-form";
import { StockAdjustmentForm } from "@/components/inventory/stock-adjustment-form";
import { StockMovementHistory } from "@/components/inventory/stock-movement-history";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

import { requireUser } from "@/lib/auth/guards";
import { getInventory } from "@/lib/services/inventory/get-inventory";
import { getStockMovements } from "@/lib/services/inventory/get-stock-movements";
import { getOrganizationSettings } from "@/lib/services/organizations/get-organization-settings";

export default async function InventoryPage() {
  const user = await requireUser();

  const [
    products,
    movements,
    organization,
  ] = await Promise.all([
    getInventory(),
    getStockMovements(),
    getOrganizationSettings(),
  ]);

  if (!organization) {
    return null;
  }

  const isAdmin =
    user.role === "ADMIN";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor current stock and
            inventory movements.
          </p>
        </div>

        {/* Receive stock */}
        <section
          aria-labelledby="receive-stock-heading"
        >
          <h2
            id="receive-stock-heading"
            className="sr-only"
          >
            Receive stock
          </h2>

          <ReceiveStockForm
            products={products.map(
              (product) => ({
                id: product.id,
                name: product.name,
                sku: product.sku,
                barcode:
                  product.barcode,
                stockQuantity:
                  product.stockQuantity,
              })
            )}
          />
        </section>

        {/* ADMIN stock adjustment */}
        {isAdmin ? (
          <section
            aria-labelledby="stock-adjustment-heading"
          >
            <h2
              id="stock-adjustment-heading"
              className="sr-only"
            >
              Stock adjustment
            </h2>

            <StockAdjustmentForm
              products={products.map(
                (product) => ({
                  id: product.id,
                  name: product.name,
                  sku: product.sku,
                  barcode:
                    product.barcode,
                  stockQuantity:
                    product.stockQuantity,
                })
              )}
            />
          </section>
        ) : null}

        {/* Current inventory */}
        <section
          className="space-y-4"
          aria-labelledby="current-inventory-heading"
        >
          <div>
            <h2
              id="current-inventory-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Current inventory
            </h2>

            <p className="text-sm text-slate-500">
              {products.length} active{" "}
              {products.length === 1
                ? "product"
                : "products"}
            </p>
          </div>

          <InventoryTable
            products={products}
            currency={
              organization.currency
            }
            locale={
              organization.locale
            }
          />
        </section>

        {/* Stock movement history */}
        <section
          className="space-y-4"
          aria-labelledby="movement-history-heading"
        >
          <div>
            <h2
              id="movement-history-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Stock movement history
            </h2>

            <p className="text-sm text-slate-500">
              Latest inventory changes.
            </p>
          </div>

          <StockMovementHistory
  movements={movements}
  locale={organization.locale}
  timezone={organization.timezone}
  calendar={organization.calendar}
/>
        </section>
      </div>
    </DashboardLayout>
  );
}