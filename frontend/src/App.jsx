import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import AIChat from './pages/AIChat';
import { LayoutDashboard, Users, MessageSquare, Menu, X } from 'lucide-react';
import { useState } from 'react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'AI Insights', path: '/ai-chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className={`bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-bold truncate">SmartPortal</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {isSidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {navItems.find(item => item.path === location.pathname)?.name || 'Detail View'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              Y
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/ai-chat" element={<AIChat />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
