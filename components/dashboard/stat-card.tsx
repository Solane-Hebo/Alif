import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  change?: string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  iconBackgroundClassName?: string;
};

export function StatCard({
  title,
  value,
  change,
  description,
  icon: Icon,
  iconClassName = "text-emerald-700",
  iconBackgroundClassName = "bg-emerald-100",
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>

        <div
          className={`flex size-10 items-center justify-center rounded-lg ${iconBackgroundClassName}`}
          aria-hidden="true"
        >
          <Icon
            className={`size-5 ${iconClassName}`}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-slate-950">
          {value}
        </div>

        {(change || description) ? (
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
            {change ? (
              <span className="font-medium text-emerald-700">
                {change}
              </span>
            ) : null}

            {description ? (
              <span className="text-slate-500">
                {description}
              </span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}