"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SupportedCalendar } from "@/lib/utils/date-format";
import { formatMoney } from "@/lib/utils/money";

type ChartItem = {
  date: string;
  revenue: number;
  canViewFinancials: boolean;
  cost?: number;
  profit?: number;
};

type RevenueProfitChartProps = {
  data: ChartItem[];
  currency: string;
  locale: string;
  calendar: SupportedCalendar;
};

function formatChartDate(
  value: string,
  locale: string,
  calendar: SupportedCalendar
) {
  const date = new Date(
    `${value}T12:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const resolvedLocale =
    new Intl.Locale(locale, {
      calendar,
    }).toString();

  return new Intl.DateTimeFormat(
    resolvedLocale,
    {
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

export function RevenueProfitChart({
  data,
  currency,
  locale,
  calendar,
}: RevenueProfitChartProps) {
  const canViewFinancials =
    data[0]?.canViewFinancials === true;

  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Revenue
          {canViewFinancials
            ? ", Cost & Profit"
            : ""}
        </h2>

        <div className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-slate-500">
            No completed sales yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {canViewFinancials
            ? "Revenue, Cost & Profit"
            : "Revenue"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Completed sales over time.
        </p>
      </div>

      <div
        className="mt-6 h-[320px] w-full"
        aria-hidden="true"
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                formatChartDate(
                  String(value),
                  locale,
                  calendar
                )
              }
            />

            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat(
                  locale,
                  {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }
                ).format(
                  Number(value) / 100
                )
              }
            />

            <Tooltip
              labelFormatter={(value) =>
                formatChartDate(
                  String(value),
                  locale,
                  calendar
                )
              }
              formatter={(
                value,
                name
              ) => [
                formatMoney(
                  Number(value),
                  currency,
                  locale
                ),
                String(name),
              ]}
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="currentColor"
              strokeWidth={2}
              dot={false}
            />

            {canViewFinancials ? (
              <>
                <Line
                  type="monotone"
                  dataKey="cost"
                  name="Cost"
                  stroke="currentColor"
                  strokeWidth={2}
                  dot={false}
                />

                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="currentColor"
                  strokeWidth={2}
                  dot={false}
                />
              </>
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible text alternative */}
      <div className="sr-only">
        <h3>Chart data</h3>

        <ul>
          {data.map((item) => (
            <li key={item.date}>
              {formatChartDate(
                item.date,
                locale,
                calendar
              )}
              : Revenue{" "}
              {formatMoney(
                item.revenue,
                currency,
                locale
              )}

              {item.canViewFinancials
                ? `, Cost ${formatMoney(
                    item.cost ?? 0,
                    currency,
                    locale
                  )}, Profit ${formatMoney(
                    item.profit ?? 0,
                    currency,
                    locale
                  )}`
                : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}