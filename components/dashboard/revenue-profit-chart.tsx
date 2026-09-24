"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const chartData = [
  { date: "Apr 1", revenue: 620, cost: 400, profit: 220 },
  { date: "Apr 5", revenue: 900, cost: 620, profit: 280 },
  { date: "Apr 10", revenue: 1120, cost: 700, profit: 420 },
  { date: "Apr 15", revenue: 950, cost: 610, profit: 340 },
  { date: "Apr 20", revenue: 1380, cost: 850, profit: 530 },
  { date: "Apr 25", revenue: 1700, cost: 1020, profit: 680 },
  { date: "Apr 30", revenue: 1510, cost: 980, profit: 530 },
];

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function RevenueProfitChart() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Revenue, Cost & Profit</CardTitle>

          <div
            className="flex flex-wrap gap-4 text-xs text-slate-600"
            aria-label="Chart legend"
          >
            <LegendItem colorClass="bg-emerald-500" label="Revenue" />
            <LegendItem colorClass="bg-red-500" label="Cost" />
            <LegendItem colorClass="bg-blue-500" label="Profit" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div
          className="h-[320px] w-full"
          role="img"
          aria-label="Line chart showing revenue, cost and profit over time"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tickFormatter={(value: number) =>
                  moneyFormatter.format(value)
                }
                tickLine={false}
                axisLine={false}
                width={70}
              />

              <Tooltip
                formatter={(value) => [
                  moneyFormatter.format(Number(value)),
                ]}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />

              <Line
                type="monotone"
                dataKey="cost"
                name="Cost"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />

              <Line
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Accessible text alternative for screen readers */}
        <div className="sr-only">
          Revenue, cost and profit performance for the selected period.
          Revenue ranges from 620 to 1,700 dollars. Cost ranges from
          400 to 1,020 dollars. Profit ranges from 220 to 680 dollars.
        </div>
      </CardContent>
    </Card>
  );
}

type LegendItemProps = {
  colorClass: string;
  label: string;
};

function LegendItem({ colorClass, label }: LegendItemProps) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${colorClass}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}