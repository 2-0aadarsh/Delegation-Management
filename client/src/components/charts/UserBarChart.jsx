import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const BAR_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

const UserBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-slate-400 py-8 text-sm">No user workload data yet</p>;
  }

  const chartData = data.map((d) => ({
    name: d.name.split(" ")[0], // First name only to avoid label overlap
    tasks: Number(d.total_tasks),
  }));

  return (
    <div className="h-56 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
            formatter={(val) => [`${val} tasks`, "Assigned"]}
          />
          <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserBarChart;
