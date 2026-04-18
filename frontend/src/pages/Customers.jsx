import { useEffect, useState } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../api/client';
import { Trash2, Plus, X, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    company: '',
    region: 'North America',
    planTier: 'Basic',
    npsScore: 5,
    usage: 50,
    lastActiveDays: 0,
    contractEndDate: '2026-12-31'
  });

  const fetchData = () => {
    getCustomers().then(res => setCustomers(res.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createCustomer(newCustomer);
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await deleteCustomer(id);
      fetchData();
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (risk) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Customer</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Company</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Plan</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Health Score</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Churn Risk</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 group">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.region}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{c.company}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">{c.planTier}</span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center space-x-2">
                     <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${c.healthScore > 80 ? 'bg-green-500' : c.healthScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${c.healthScore}%` }}></div>
                     </div>
                     <span className="text-sm font-bold">{c.healthScore.toFixed(0)}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(c.churnRisk)}`}>
                    {c.churnRisk}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <Link to={`/customers/${c.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <ChevronRight size={18} />
                    </Link>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold">Add New Customer</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <input
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Company</label>
                  <input
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newCustomer.company}
                    onChange={(e) => setNewCustomer({...newCustomer, company: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Region</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newCustomer.region}
                    onChange={(e) => setNewCustomer({...newCustomer, region: e.target.value})}
                  >
                    <option>North America</option>
                    <option>Europe</option>
                    <option>Asia Pacific</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Plan Tier</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newCustomer.planTier}
                    onChange={(e) => setNewCustomer({...newCustomer, planTier: e.target.value})}
                  >
                    <option>Basic</option>
                    <option>Pro</option>
                    <option>Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">NPS Score (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newCustomer.npsScore}
                    onChange={(e) => setNewCustomer({...newCustomer, npsScore: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Usage (0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newCustomer.usage}
                    onChange={(e) => setNewCustomer({...newCustomer, usage: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
