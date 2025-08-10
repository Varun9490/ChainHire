import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#a78bfa", "#f472b6", "#60a5fa", "#facc15", "#34d399", "#f87171", "#38bdf8", "#818cf8"];

export default function DashboardCharts({ stats, type = "bar", title = "", className = "" }) {
  const chartData = stats?.map((item) => ({
    label: item.label || item.title || item.date || "-",
    value: item.value || item.count || item.amount || 0,
  })) || [];

  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
      </div>
      <div className="w-full flex justify-center items-center">
        {type === "bar" && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#312e81" />
              <XAxis dataKey="label" stroke="#c7d2fe"/>
              <YAxis stroke="#c7d2fe"/>
              <Tooltip contentStyle={{ background: "#18181b", border: "none", borderRadius: 12, color: "#fff" }} />
              <Legend iconType="circle"/>
              <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        {type === "line" && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#312e81" />
              <XAxis dataKey="label" stroke="#c7d2fe"/>
              <YAxis stroke="#c7d2fe"/>
              <Tooltip contentStyle={{ background: "#18181b", border: "none", borderRadius: 12, color: "#fff" }} />
              <Legend iconType="circle"/>
              <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={3} dot={{ r: 6, fill: "#f472b6" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {type === "pie" && (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#a78bfa"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#18181b", border: "none", borderRadius: 12, color: "#fff" }} />
              <Legend iconType="circle"/>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
} 