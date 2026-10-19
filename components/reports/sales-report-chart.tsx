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

type SalesReportChartProps = {
  data: {
    date: string;
    revenue: number;
    cost: number;
    profit: number;
  }[];
  currency: string;
  locale: string;
  calendar: SupportedCalendar;
};

function formatReportDate(
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

  try {
    const resolvedLocale =
      new Intl.Locale(locale, {
        calendar,
      }).toString();

    return new Intl.DateTimeFormat(
      resolvedLocale,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    ).format(date);
  } catch {
    return value;
  }
}

export function SalesReportChart({
  data,
  currency,
  locale,
  calendar,
}: SalesReportChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-xl border bg-white p-6">
        <p className="text-sm text-slate-500">
          No sales data for the selected period.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Revenue, Cost & Profit
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Financial performance during the selected period.
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
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
              fontSize={12}
              tickFormatter={(value) =>
                formatReportDate(
                  String(value),
                  locale,
                  calendar
                )
              }
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) =>
                formatMoney(
                  Number(value),
                  currency,
                  locale
                )
              }
            />

            <Tooltip
              labelFormatter={(value) =>
                formatReportDate(
                  String(value),
                  locale,
                  calendar
                )
              }
              formatter={(value) =>
                formatMoney(
                  Number(value),
                  currency,
                  locale
                )
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#059669"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="cost"
              name="Cost"
              stroke="#64748b"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="sr-only">
        <h3>Financial report data</h3>

        <ul>
          {data.map((item) => (
            <li key={item.date}>
              {formatReportDate(
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
              , Cost{" "}
              {formatMoney(
                item.cost,
                currency,
                locale
              )}
              , Profit{" "}
              {formatMoney(
                item.profit,
                currency,
                locale
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}