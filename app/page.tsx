import {
  ChartNoAxesCombined,
  Coins,
  DollarSign,
  ShoppingCart,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RevenueProfitChart } from "@/components/dashboard/revenue-profit-chart";

export default function Home() {
  return (
    <DashboardLayout>
      <section aria-labelledby="dashboard-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              id="dashboard-heading"
              className="text-3xl font-bold tracking-tight text-slate-950"
            >
              Dashboard
            </h1>

            <p className="mt-1 text-slate-500">
              Here&apos;s what&apos;s happening with your store today.
            </p>
          </div>

          <button
            type="button"
            className="w-fit rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
          >
            Last 30 days
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value="$12,450"
            change="↑ 12%"
            description="vs. previous period"
            icon={DollarSign}
          />

          <StatCard
            title="Total Sales"
            value="342"
            change="↑ 8%"
            description="vs. previous period"
            icon={ShoppingCart}
            iconClassName="text-blue-700"
            iconBackgroundClassName="bg-blue-100"
          />

          <StatCard
            title="Total Cost (Purchase Price)"
            value="$7,230"
            change="↑ 10%"
            description="vs. previous period"
            icon={Coins}
            iconClassName="text-violet-700"
            iconBackgroundClassName="bg-violet-100"
          />

          <StatCard
            title="Total Profit"
            value="$5,220"
            change="↑ 15%"
            description="vs. previous period"
            icon={ChartNoAxesCombined}
            iconClassName="text-orange-700"
            iconBackgroundClassName="bg-orange-100"
          />
        </div>
        <div className="mt-6 grid gap-6">
          <RevenueProfitChart />
        </div>
      </section>
    </DashboardLayout>
  );
}