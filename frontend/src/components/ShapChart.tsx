import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from "recharts";
import type { ShapDriver } from "@/lib/api";

export default function ShapChart({ drivers }: { drivers: ShapDriver[] }) {
  const data = [...drivers]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .map((d) => ({ name: d.feature, value: d.shap_value, direction: d.direction }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <XAxis type="number" tick={{ fontSize: 11, fill: "#888780" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={160}
          tick={{ fontSize: 12, fill: "#3d3d3a" }}
          axisLine={false}
          tickLine={false}
        />
        <ReferenceLine x={0} stroke="#D3D1C7" strokeWidth={1} />
        <Tooltip
          formatter={(v: number) => [v.toFixed(4), "SHAP value"]}
          contentStyle={{
            fontSize: 12,
            border: "0.5px solid #D3D1C7",
            borderRadius: 8,
            background: "#fff",
            boxShadow: "none",
          }}
        />
        <Bar dataKey="value" radius={[0, 3, 3, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.direction === "malicious" ? "#185FA5" : "#E24B4A"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
