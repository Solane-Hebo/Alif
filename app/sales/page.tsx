import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SaleForm } from "@/components/sales/sale-form";
import { SalesHistory } from "@/components/sales/sales-history";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getSaleProducts } from "@/lib/services/sales/get-sale-products";
import { getSales } from "@/lib/services/sales/get-sales";
import { requireUser } from "@/lib/auth/guards";

export default async function SalesPage() {
  const user = await requireUser();

  const [products, sales] =
    await Promise.all([
      getSaleProducts(),
      getSales(),
    ]);

  const canManageSales =
    user.role === "ADMIN";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Sales
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Register sales and review sales
            history.
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>
              Register sale
            </CardTitle>
          </CardHeader>

          <CardContent>
            <SaleForm
              products={products}
            />
          </CardContent>
        </Card>

        <section
          className="space-y-4"
          aria-labelledby="sales-history-heading"
        >
          <div>
            <h2
              id="sales-history-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Sales history
            </h2>

            <p className="text-sm text-slate-500">
              {sales.length}{" "}
              {sales.length === 1
                ? "sale"
                : "sales"}
            </p>
          </div>

          <SalesHistory
          sales={sales}
          canManageSales={canManageSales}
/>
        </section>
      </div>
    </DashboardLayout>
  );
}