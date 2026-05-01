"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatPrice } from "@/lib/utils";

interface PriceComparisonChartProps {
  askingPrice: number;
  predictedPrice: number;
}

export default function PriceComparisonChart({ askingPrice, predictedPrice }: PriceComparisonChartProps) {
  const data = [
    { name: "Asking Price", price: askingPrice, fill: "#94a3b8" }, // slate-400
    { name: "AI Predicted", price: predictedPrice, fill: "#3b82f6" }, // blue-500
  ];

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
          barSize={32}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
            width={90}
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-sm font-semibold shadow-lg">
                    {formatPrice(payload[0].value as number)}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="price" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
