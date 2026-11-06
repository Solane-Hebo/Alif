import {
  BrainCircuit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AIChat } from "@/components/ai/ai-chat";
import { requireUser } from "@/lib/auth/guards";

export default async function AIAssistantPage() {
  const user = await requireUser();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6 pb-8">
        {/* Page header */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-linear-to-br from-white via-indigo-50/60 to-blue-50 p-6 shadow-sm sm:p-8">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              {/* AI icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
                <BrainCircuit className="h-7 w-7 text-white" />
              </div>

              {/* Title */}
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-100/70 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Workspace
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  ALIF AI Assistant
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                  Your intelligent business companion.
                  Explore sales insights, monitor inventory,
                  and get helpful guidance in one place.
                </p>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-200 bg-white/80 px-3 py-2 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>

              <span className="text-xs font-semibold text-emerald-700">
                Ready to assist
              </span>
            </div>
          </div>

          {/* Footer badges */}
          <div className="relative mt-6 flex flex-wrap items-center gap-3 border-t border-indigo-100 pt-5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Role-based access
            </div>

            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Business insights
            </div>

            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <BrainCircuit className="h-4 w-4 text-blue-600" />
              Smart assistance
            </div>
          </div>
        </div>

        {/* Chat section */}
        <section
          aria-label="AI Assistant chat"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <AIChat />
        </section>

        {/* Footer */}
        <div className="flex flex-col gap-2 px-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            ALIF AI Assistant · Your business, simplified.
          </p>

          <p>
            Signed in as{" "}
            <span className="font-semibold text-slate-600">
              {user.role}
            </span>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}