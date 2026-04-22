import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import AIChat from './pages/AIChat';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthContext } from './context/AuthContext';
import { LayoutDashboard, Users, MessageSquare, Menu, X, LogOut } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Track viewport size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    handleResize(); // init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'AI Insights', path: '/ai-chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex relative">
      {/* Mobile backdrop overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300 z-50
          ${isMobile
            ? `fixed inset-y-0 left-0 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : isSidebarOpen ? 'w-64' : 'w-20'
          }
        `}
      >
        <div className="p-6 flex items-center justify-between">
          {(isSidebarOpen || isMobile) && <h1 className="text-xl font-bold truncate">SmartPortal</h1>}
          {!isMobile && (
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-800 rounded">
              <X size={20} />
            </button>
          )}
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
              {(isSidebarOpen || isMobile) && <span className="ml-3 font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            {(isSidebarOpen || isMobile) && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 h-14 md:h-16 flex items-center px-4 md:px-8 justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
                <Menu size={20} className="text-gray-600" />
              </button>
            )}
            <h2 className="text-base md:text-lg font-semibold text-gray-800 truncate">
              {navItems.find(item => item.path === location.pathname)?.name || 'Detail View'}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name || 'User'}</span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase shrink-0">
              {user?.name?.[0] || 'Y'}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/ai-chat" element={<AIChat />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
