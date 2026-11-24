"use client";

import dynamic from "next/dynamic";
import type { VendaMes } from "@/lib/data/types";

const SalesChart = dynamic(() => import("@/components/app/SalesChart"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
});

export function SalesChartLazy({ data }: { data: VendaMes[] }) {
  return <SalesChart data={data} />;
}
