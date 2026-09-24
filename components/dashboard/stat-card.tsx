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
  change: string;
  description: string;
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
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-slate-500">
            {title}
          </CardTitle>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBackgroundClassName}`}
          aria-hidden="true"
        >
          <Icon className={`h-5 w-5 ${iconClassName}`} />
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-2xl font-bold tracking-tight text-slate-950">
          {value}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
            {change}
          </span>

          <span className="text-slate-500">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}