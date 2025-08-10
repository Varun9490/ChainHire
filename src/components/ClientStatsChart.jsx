"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const COLORS = ["#10B981", "#FBBF24", "#EF4444"];

export default function ClientStatsChart({ stats }) {
  const barData = stats.map((item) => ({
    name: item.job.title,
    proposals: item.totalProposals,
  }));

  const pieData = [
    { name: "Accepted", value: stats.filter((s) => s.acceptedProposal).length },
    { name: "Pending", value: stats.filter((s) => !s.acceptedProposal).length },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-10">
      {/* Bar Chart: Proposals per Job */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">
          📈 Proposals per Job
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="proposals" fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart: Accepted vs Pending */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">
          🧭 Job Acceptance Ratio
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
