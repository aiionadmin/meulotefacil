"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { VendaMes } from "@/lib/data/types";
import { formatCurrency } from "@/lib/utils";

export default function SalesChart({ data }: { data: VendaMes[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="mlfOrange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F7821E" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#F7821E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd2" />
          <XAxis dataKey="mes" tick={{ fill: "#5c5878", fontSize: 12 }} />
          <YAxis tick={{ fill: "#5c5878", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "#FFF6EC",
              border: "1px solid #e8dfd2",
              borderRadius: 8,
            }}
            formatter={(value, name) =>
              name === "receita"
                ? [formatCurrency(Number(value)), "Receita"]
                : [value, "Vendas"]
            }
          />
          <Area
            type="monotone"
            dataKey="receita"
            stroke="#F7821E"
            fill="url(#mlfOrange)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
