import { redirect } from "next/navigation";
import { DateTime } from "luxon";

import {
  Banknote,
  ChartNoAxesCombined,
  CircleDollarSign,
  Percent,
  ReceiptText,
  ShoppingCart,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReportsDateFilter } from "@/components/reports/reports-date-filter";
import { SalesReportChart } from "@/components/reports/sales-report-chart";

import { getTenantContext } from "@/lib/auth/tenant";
import { getOrganizationSettings } from "@/lib/services/organizations/get-organization-settings";
import { getSalesReport } from "@/lib/services/reports/get-sales-report";
import { getDateRangeInTimezone } from "@/lib/utils/date-range";
import { formatMoney } from "@/lib/utils/money";

type ReportsPageProps = {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
};

function getDefaultDates(
  timezone: string
) {
  const now =
    DateTime.now().setZone(timezone);

  const to = now.toISODate();

  const from = now
    .minus({
      days: 29,
    })
    .toISODate();

  if (!to || !from) {
    return null;
  }

  return {
    from,
    to,
  };
}

export default async function ReportsPage({
  searchParams,
}: ReportsPageProps) {
  const user =
    await getTenantContext();

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const organization =
    await getOrganizationSettings();

  if (!organization) {
    redirect("/");
  }

  const params = await searchParams;

  const defaults = getDefaultDates(
    organization.timezone
  );

  if (!defaults) {
    redirect("/");
  }

  const fromValue =
    params.from ?? defaults.from;

  const toValue =
    params.to ?? defaults.to;

  const dateRange =
    getDateRangeInTimezone(
      fromValue,
      toValue,
      organization.timezone
    );

  if (!dateRange) {
    redirect("/reports");
  }

  const { from, to } = dateRange;

  const result =
    await getSalesReport({
      from,
      to,
      timezone:
        organization.timezone,
    });

  if (!result.success) {
    redirect("/");
  }

  const { summary } = result;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Analyze sales, revenue,
            costs and profitability.
          </p>
        </div>

        <ReportsDateFilter
          fromValue={fromValue}
          toValue={toValue}
          calendar={
            organization.calendar
          }
          locale={
            organization.locale
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Revenue"
            value={formatMoney(
              summary.revenue,
              organization.currency,
              organization.locale
            )}
            icon={CircleDollarSign}
          />

          <StatCard
            title="Cost"
            value={formatMoney(
              summary.cost,
              organization.currency,
              organization.locale
            )}
            icon={ReceiptText}
          />

          <StatCard
            title="Profit"
            value={formatMoney(
              summary.profit,
              organization.currency,
              organization.locale
            )}
            icon={Banknote}
          />

          <StatCard
            title="Profit Margin"
            value={`${summary.profitMargin.toFixed(
              1
            )}%`}
            icon={Percent}
          />

          <StatCard
            title="Total Sales"
            value={summary.totalSales.toLocaleString(
              organization.locale
            )}
            icon={ShoppingCart}
          />

          <StatCard
            title="Units Sold"
            value={summary.unitsSold.toLocaleString(
              organization.locale
            )}
            icon={
              ChartNoAxesCombined
            }
          />
        </div>

        <SalesReportChart
          data={result.chart}
          currency={
            organization.currency
          }
          locale={
            organization.locale
          }
          calendar={
            organization.calendar
          }
        />
      </div>
    </DashboardLayout>
  );
}