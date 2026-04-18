import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerDetail } from '../api/client';
import { ArrowLeft, MapPin, Calendar, Activity, Ticket, Monitor, AlertCircle, CheckCircle2 } from 'lucide-react';

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomerDetail(id).then(res => {
      setCustomer(res.data);
      setLoading(false);
    }).catch(() => {
        navigate('/customers');
    });
  }, [id, navigate]);

  if (loading) return <div>Loading...</div>;

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getStatusIcon = (status) => {
    return status === 'Open' ? <AlertCircle size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-green-500" />;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <button onClick={() => navigate('/customers')} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={18} className="mr-2" />
        Back to Customers
      </button>

      {/* Hero Header */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center"><MapPin size={16} className="mr-1.5" /> {customer.region}</span>
            <span className="flex items-center"><Calendar size={16} className="mr-1.5" /> Contract Ends: {customer.contractEndDate}</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold">{customer.planTier}</span>
          </div>
        </div>
        
        <div className={`px-6 py-4 rounded-xl border text-center ${getHealthColor(customer.healthScore)}`}>
          <div className="text-sm font-bold uppercase tracking-wider mb-1">Health Score</div>
          <div className="text-4xl font-black">{customer.healthScore.toFixed(0)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Activity className="mr-2 text-blue-600" size={20} />
              Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500">Usage Efficiency</span>
                  <span className="font-bold">{customer.usage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${customer.usage}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-50">
                <span className="text-sm text-gray-500">NPS Score</span>
                <span className="font-bold text-lg">{customer.npsScore}/10</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-50">
                <span className="text-sm text-gray-500">Last Active</span>
                <span className="font-bold text-gray-900">{customer.lastActiveDays} days ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Monitor className="mr-2 text-blue-600" size={20} />
              Devices
            </h3>
            <div className="space-y-3">
              {customer.devices.length > 0 ? customer.devices.map((d) => (
                <div key={d.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{d.deviceType}</span>
                  <span className="text-sm font-bold text-blue-600">x{d.count}</span>
                </div>
              )) : (
                <p className="text-sm text-gray-400 italic">No devices registered</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tickets */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center">
                <Ticket className="mr-2 text-blue-600" size={20} />
                Support Tickets
              </h3>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{customer.tickets.length} total</span>
            </div>
            <div className="divide-y divide-gray-50">
              {customer.tickets.length > 0 ? customer.tickets.map((t) => (
                <div key={t.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${t.severity === 'High' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>
                      {t.severity === 'High' ? <AlertCircle size={20} /> : <Ticket size={20} />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Ticket #{t.id.slice(0, 4)}</div>
                      <div className="text-xs text-gray-500">Created on {t.createdAt}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${t.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {t.severity}
                    </span>
                    <div className="flex items-center text-sm font-medium">
                      {getStatusIcon(t.status)}
                      <span className="ml-1.5">{t.status}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-gray-400">
                  <p>No support tickets found for this customer.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
