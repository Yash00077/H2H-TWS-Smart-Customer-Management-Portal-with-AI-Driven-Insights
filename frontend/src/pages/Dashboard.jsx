import { useEffect, useState } from 'react';
import { getCustomers } from '../api/client';
import { Users, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers().then(res => {
      setCustomers(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const totalCustomers = customers.length;
  const highChurnCount = customers.filter(c => c.churnRisk === 'High').length;
  const avgHealthScore = customers.reduce((acc, c) => acc + (c.healthScore || 0), 0) / (totalCustomers || 1);

  // Chart data: Distribution of usage
  const chartData = [
    { range: '0-20', count: customers.filter(c => c.usage <= 20).length },
    { range: '21-40', count: customers.filter(c => c.usage > 20 && c.usage <= 40).length },
    { range: '41-60', count: customers.filter(c => c.usage > 40 && c.usage <= 60).length },
    { range: '61-80', count: customers.filter(c => c.usage > 60 && c.usage <= 80).length },
    { range: '81-100', count: customers.filter(c => c.usage > 80).length },
  ];

  const stats = [
    { name: 'Total Customers', value: totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'High Churn Risk', value: highChurnCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    { name: 'Avg Health Score', value: avgHealthScore.toFixed(1), icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center">
          <TrendingUp className="mr-2 text-blue-600" size={20} />
          Usage Distribution
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
