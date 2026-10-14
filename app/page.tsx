import {
  AlertTriangle,
  Boxes,
  ChartNoAxesCombined,
  Coins,
  DollarSign,
  Package,
  ShoppingCart,
} from "lucide-react";

import { RevenueProfitChart } from "@/components/dashboard/revenue-profit-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

import { getDashboardChart } from "@/lib/services/dashboard/get-dashboard-chart";
import { getDashboardStats } from "@/lib/services/dashboard/get-dashboard-stats";
import { getInventoryStats } from "@/lib/services/dashboard/get-inventory-stats";
import { formatMoney } from "@/lib/utils/money";

export default async function Home() {
  const [stats, chartData, inventoryStats] =
    await Promise.all([
      getDashboardStats(),
      getDashboardChart(),
      getInventoryStats(),
    ]);

  return (
    <DashboardLayout>
      <section aria-labelledby="dashboard-heading">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              id="dashboard-heading"
              className="text-3xl font-bold tracking-tight text-slate-950"
            >
              Dashboard
            </h1>

            <p className="mt-1 text-slate-500">
              Here&apos;s what&apos;s happening with your store.
            </p>
          </div>

          <div className="w-fit rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            All time
          </div>
        </div>

        {/* Sales KPI cards */}
        <div
          className={`mt-8 grid gap-4 sm:grid-cols-2 ${
            stats.canViewFinancials
              ? "xl:grid-cols-4"
              : "xl:grid-cols-2"
          }`}
        >
          <StatCard
            title="Total Revenue"
            value={formatMoney(
              stats.totalRevenue
            )}
            description="Completed sales"
            icon={DollarSign}
          />

          <StatCard
            title="Total Sales"
            value={stats.totalSales.toString()}
            description="Completed sales"
            icon={ShoppingCart}
            iconClassName="text-blue-700"
            iconBackgroundClassName="bg-blue-100"
          />

          {stats.canViewFinancials ? (
            <>
              <StatCard
                title="Total Cost (Purchase Price)"
                value={formatMoney(
                  stats.totalCost
                )}
                description="Cost of completed sales"
                icon={Coins}
                iconClassName="text-violet-700"
                iconBackgroundClassName="bg-violet-100"
              />

              <StatCard
                title="Total Profit"
                value={formatMoney(
                  stats.totalProfit
                )}
                description="Revenue minus cost"
                icon={ChartNoAxesCombined}
                iconClassName="text-orange-700"
                iconBackgroundClassName="bg-orange-100"
              />
            </>
          ) : null}
        </div>

        {/* Inventory KPI cards */}
        <div
          className={`mt-4 grid gap-4 sm:grid-cols-2 ${
            inventoryStats.canViewInventoryValue
              ? "xl:grid-cols-3"
              : "xl:grid-cols-2"
          }`}
        >
          <StatCard
            title="Total Products"
            value={inventoryStats.totalProducts.toString()}
            description="Active products"
            icon={Package}
            iconClassName="text-blue-700"
            iconBackgroundClassName="bg-blue-100"
          />

          <StatCard
            title="Low Stock Items"
            value={inventoryStats.lowStockItems.toString()}
            description="At or below stock threshold"
            icon={AlertTriangle}
            iconClassName="text-amber-700"
            iconBackgroundClassName="bg-amber-100"
          />

          {inventoryStats.canViewInventoryValue ? (
            <StatCard
              title="Inventory Value"
              value={formatMoney(
                inventoryStats.inventoryValue
              )}
              description="Current stock at purchase cost"
              icon={Boxes}
              iconClassName="text-violet-700"
              iconBackgroundClassName="bg-violet-100"
            />
          ) : null}
        </div>

        {/* Revenue / Cost / Profit chart */}
        <div className="mt-6 grid gap-6">
          <RevenueProfitChart
            data={chartData}
          />
        </div>
      </section>
    </DashboardLayout>
  );
}