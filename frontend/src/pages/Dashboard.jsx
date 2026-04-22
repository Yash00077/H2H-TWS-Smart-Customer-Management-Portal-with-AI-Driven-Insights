import { useEffect, useState } from 'react';
import { getCustomers } from '../api/client';
import { Link } from 'react-router-dom';
import { Users, AlertTriangle, Activity, TrendingUp, TrendingDown, Globe, Award, Zap } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm">
        <p className="font-semibold">{label}</p>
        <p className="text-blue-300">{payload[0].value} customers</p>
      </div>
    );
  }
  return null;
};

const CHURN_COLORS = ['#ef4444', '#f59e0b', '#22c55e'];

function StatCard({ icon: Icon, label, value, sub, gradient, iconBg }) {
  return (
    <div className={`stat-card relative overflow-hidden rounded-xl md:rounded-2xl p-4 md:p-6 ${gradient} text-white cursor-default`}>
      {/* Shimmer overlay */}
      <div className="stat-shimmer" />
      <div className="relative z-10 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-white/70 mb-1 truncate">{label}</p>
          <p className="text-2xl md:text-4xl font-black tracking-tight">{value}</p>
          {sub && <p className="text-[10px] md:text-xs text-white/60 mt-1 md:mt-2 truncate">{sub}</p>}
        </div>
        <div className={`stat-icon p-2 md:p-3 rounded-lg md:rounded-xl ${iconBg} shrink-0 ml-2`}>
          <Icon size={18} className="text-white md:hidden" />
          <Icon size={22} className="text-white hidden md:block" />
        </div>
      </div>
      {/* Decorative circles — animate on hover */}
      <div className="stat-circle-1 absolute -bottom-4 -right-4 w-16 md:w-24 h-16 md:h-24 rounded-full bg-white/10" />
      <div className="stat-circle-2 absolute -bottom-8 -right-8 w-24 md:w-32 h-24 md:h-32 rounded-full bg-white/5" />
      <div className="stat-circle-3 absolute top-2 left-1/3 w-12 md:w-16 h-12 md:h-16 rounded-full bg-white/10" />
    </div>
  );
}

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers().then(res => {
      setCustomers(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const totalCustomers = customers.length;
  const highChurnCount = customers.filter(c => (c.churnRisk?.level || c.churnRisk) === 'High').length;
  const mediumChurnCount = customers.filter(c => (c.churnRisk?.level || c.churnRisk) === 'Medium').length;
  const lowChurnCount = customers.filter(c => (c.churnRisk?.level || c.churnRisk) === 'Low').length;
  const avgHealthScore = customers.reduce((acc, c) => acc + (c.healthScore || 0), 0) / (totalCustomers || 1);
  const highHealthCount = customers.filter(c => (c.healthScore || 0) >= 70).length;

  // Usage distribution
  const usageData = [
    { range: '0–20%', count: customers.filter(c => c.usage <= 20).length },
    { range: '21–40%', count: customers.filter(c => c.usage > 20 && c.usage <= 40).length },
    { range: '41–60%', count: customers.filter(c => c.usage > 40 && c.usage <= 60).length },
    { range: '61–80%', count: customers.filter(c => c.usage > 60 && c.usage <= 80).length },
    { range: '81–100%', count: customers.filter(c => c.usage > 80).length },
  ];

  // Churn risk pie data
  const churnData = [
    { name: 'High Risk', value: highChurnCount },
    { name: 'Medium Risk', value: mediumChurnCount },
    { name: 'Low Risk', value: lowChurnCount },
  ];

  // Top 5 by health score
  const topCustomers = [...customers]
    .sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0))
    .slice(0, 5);

  // At-risk customers
  const atRiskCustomers = [...customers]
    .filter(c => (c.churnRisk?.level || c.churnRisk) === 'High')
    .sort((a, b) => (a.healthScore || 0) - (b.healthScore || 0))
    .slice(0, 4);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5">Real-time customer health &amp; risk metrics</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-green-50 text-green-600 font-semibold px-3 py-1.5 rounded-full border border-green-100">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={Users}
          label="Total Customers"
          value={totalCustomers}
          sub="Across all regions & plans"
          gradient="bg-gradient-to-br from-blue-600 to-blue-700"
          iconBg="bg-blue-500/40"
        />
        <StatCard
          icon={AlertTriangle}
          label="High Churn Risk"
          value={highChurnCount}
          sub={`${((highChurnCount / totalCustomers) * 100).toFixed(0)}% of total`}
          gradient="bg-gradient-to-br from-rose-500 to-rose-700"
          iconBg="bg-rose-400/40"
        />
        <StatCard
          icon={Activity}
          label="Avg Health Score"
          value={avgHealthScore.toFixed(1)}
          sub="Out of 100 points"
          gradient="bg-gradient-to-br from-violet-500 to-violet-700"
          iconBg="bg-violet-400/40"
        />
        <StatCard
          icon={Award}
          label="Healthy Customers"
          value={highHealthCount}
          sub="Score ≥ 70"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          iconBg="bg-emerald-400/40"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Usage area chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Usage Distribution</h3>
              <p className="text-xs text-gray-400 mt-0.5">Customers by usage percentage band</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp size={18} className="text-blue-600" />
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fill="url(#usageGradient)" dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn pie chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Churn Risk</h3>
              <p className="text-xs text-gray-400 mt-0.5">Risk level breakdown</p>
            </div>
            <div className="p-2 bg-rose-50 rounded-lg">
              <Zap size={18} className="text-rose-500" />
            </div>
          </div>
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={churnData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {churnData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHURN_COLORS[index]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
                <Tooltip
                  formatter={(value) => [value, 'Customers']}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Top healthy customers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900">Top Performers</h3>
              <p className="text-xs text-gray-400 mt-0.5">Customers with highest health score</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Award size={18} className="text-emerald-500" />
            </div>
          </div>
          <div className="space-y-3">
            {topCustomers.map((c, i) => (
              <Link key={c.id} to={`/customers/${c.id}`} className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer group">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{c.name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${c.healthScore || 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-8 text-right">
                    {(c.healthScore || 0).toFixed(0)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* At-risk customers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900">At Risk</h3>
              <p className="text-xs text-gray-400 mt-0.5">High churn risk — needs attention</p>
            </div>
            <div className="p-2 bg-rose-50 rounded-lg">
              <TrendingDown size={18} className="text-rose-500" />
            </div>
          </div>
          {atRiskCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-300">
              <AlertTriangle size={32} className="mb-2" />
              <p className="text-sm">No high-risk customers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {atRiskCustomers.map(c => (
                <Link key={c.id} to={`/customers/${c.id}`} className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100 hover:bg-rose-100/60 hover:border-rose-200 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm shrink-0 uppercase">
                    {c.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-rose-700 transition-colors">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.region} · {c.planTier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-rose-600">Score: {(c.healthScore || 0).toFixed(0)}</p>
                    <p className="text-[10px] text-gray-400">NPS: {c.npsScore}/10</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
