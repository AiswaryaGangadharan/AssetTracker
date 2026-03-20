'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAssets, getDashboard } from '@/lib/api';
import { User } from '@/types/user';

const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
};

const PERMISSIONS = {
  VIEW_DASHBOARD: 'view:dashboard',
  VIEW_ALL_ASSETS: 'view:all_assets',
  VIEW_MY_GEAR: 'view:my_gear',
  MANAGE_USERS: 'manage:users',
  DELETE_ASSET: 'delete:asset',
  CREATE_ASSET: 'create:asset'
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ALL_ASSETS,
    PERMISSIONS.VIEW_MY_GEAR,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.DELETE_ASSET,
    PERMISSIONS.CREATE_ASSET
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_MY_GEAR
  ]
};

// Mock users for testing - replace with API call in production
const MOCK_USERS = {
  [ROLES.ADMIN]: {
    id: 1,
    name: 'Admin User',
    email: 'admin@company.com',
    role: ROLES.ADMIN,
    initials: 'AD'
  },
  [ROLES.EMPLOYEE]: {
    id: 2,
    name: 'John Employee',
    email: 'john@company.com',
    role: ROLES.EMPLOYEE,
    initials: 'JE'
  }
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [toast, setToast] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [quickActionsOpen, setQuickActionsOpen] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [assets, setAssets] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Sync auth user
  useEffect(() => {
    if (user) {
      setCurrentUser({
        id: user.id || 1,
        name: user.name || user.username || 'User',
        role: user.role as any,
        initials: user.initials || 'U',
        email: user.email || ''
      });
    }
  }, [user]);

  // Fetch data on mount
  useEffect(() => {
    if (user?.token) {
      const fetchData = async () => {
        try {
          const [assetsRes, dashboardRes] = await Promise.all([
            getAssets(user.token),
            getDashboard(user.token)
          ]);
          setAssets(assetsRes.assets || []);
          setDashboardStats(dashboardRes.stats || {});
        } catch (error) {
          showToast('Failed to load data', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  // ==========================================
  // RBAC HELPER - Safe for null user
  // ==========================================
  const hasPermission = (permission) => {
    if (!currentUser?.role) return false;
    return ROLE_PERMISSIONS[currentUser.role]?.includes(permission) || false;
  };


  // Toggle role for demo/screenshots
  const toggleRole = () => {
    const newRole = currentUser.role === ROLES.ADMIN ? ROLES.EMPLOYEE : ROLES.ADMIN;
    setCurrentUser(MOCK_USERS[newRole]);
    setSelectedAssets([]);
    showToast(`Switched to ${newRole}`, 'info');
  };

  // Your existing keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setExpandedCard(null);
        setQuickActionsOpen(null);
      }
      if (e.key === '?' && !e.shiftKey) {
        setToast({ message: 'Shortcuts: Ctrl+K (Search), Esc (Close), / (Filter)', type: 'info' });
      }
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const toggleAssetSelection = (id) => {
    setSelectedAssets(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const selectAllAssets = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map(a => a.id));
    }
  };

  const handleQuickAction = (action, assetId) => {
    showToast(`${action} initiated for ${assetId}`);
    setQuickActionsOpen(null);
  };

  const toggleExpandCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const themeClasses = darkMode 
    ? "bg-[#0a0a0f] text-slate-200" 
    : "bg-gray-50 text-gray-900";

  // ==========================================
  // FILTERED NAVIGATION - RBAC for Sidebar
  // ==========================================
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', permission: PERMISSIONS.VIEW_DASHBOARD },
    { id: 'assets', label: 'Assets', icon: 'assets', permission: PERMISSIONS.VIEW_ALL_ASSETS, count: dashboardStats.total_assets || 120 },
    { id: 'employees', label: 'Employees', icon: 'employees', permission: PERMISSIONS.MANAGE_USERS, count: dashboardStats.employees || 25 }
  ].filter(item => hasPermission(item.permission));


  const adminTools = [
    { id: 'create-asset', label: 'Create Asset', icon: 'create', permission: PERMISSIONS.CREATE_ASSET, color: 'text-emerald-400' },
    { id: 'delete-asset', label: 'Delete Asset', icon: 'delete', permission: PERMISSIONS.DELETE_ASSET, color: 'text-rose-400' }
  ].filter(tool => hasPermission(tool.permission));

  // SVG Icons helper
  const getIcon = (name) => {
    const icons = {
      dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
      assets: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
      employees: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      create: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
      delete: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    };
    return icons[name];
  };

  return (
    <div className={`flex min-h-screen ${themeClasses} font-sans selection:bg-indigo-500/30 transition-colors duration-300`}>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl border backdrop-blur-md transform transition-all duration-300 animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
          toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
          'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            {toast.type === 'error' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Command Palette (Ctrl+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[#13131f] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text" 
                placeholder="Search assets, employees, or commands..." 
                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-lg"
                autoFocus
              />
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">ESC to close</span>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">Recent</div>
              {['ThinkPad T14', 'Dell Monitor', 'John Doe', 'Create Asset'].map((item, i) => (
                <button key={i} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR - With RBAC filtering */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 w-72 h-screen flex flex-col border-r ${darkMode ? 'border-white/5 bg-[#0f0f16]/80' : 'border-gray-200 bg-white/80'} backdrop-blur-xl z-50 transition-transform duration-300`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-white/5 flex items-center justify-between">
          <span className="font-bold text-white">Menu</span>
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>AssetTracker</h1>
              <p className="text-xs text-slate-500">Enterprise Edition</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Overview Section - Filtered by RBAC */}
          <div className="mb-6">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Overview</p>
            <ul className="space-y-1">
              {/* Always show Dashboard */}
              <li>
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 transition-all duration-200 hover:translate-x-1">
                  {getIcon('dashboard')}
                  <span className="font-medium">Dashboard</span>
                </a>
              </li>
              
              {/* RBAC filtered navigation */}
              {navigationItems.filter(item => item.id !== 'dashboard').map((item) => (
                <li key={item.id}>
                  <a href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:translate-x-1 group ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                    {getIcon(item.icon)}
                    <span className="font-medium">{item.label}</span>
                    {item.count && (
                      <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{item.count}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Tools - Only visible if hasPermission */}
          {adminTools.length > 0 && (
            <div className="mb-6">
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Admin Tools</p>
              <ul className="space-y-1">
                {adminTools.map((tool) => (
                  <li key={tool.id}>
                    <a href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:translate-x-1 group border border-transparent ${tool.color === 'text-emerald-400' ? 'hover:border-emerald-500/20 hover:bg-emerald-500/10' : 'hover:border-rose-500/20 hover:bg-rose-500/10'} ${darkMode ? 'text-slate-400' : 'text-gray-600'} ${tool.color}`}>
                      {getIcon(tool.icon)}
                      <span className="font-medium">{tool.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* User Profile with Role Switcher */}
        <div className={`p-4 border-t ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
          {/* Role Switcher for Demo/Screenshots */}
          {currentUser && (
            <button
              onClick={toggleRole}
              className={`w-full mb-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${darkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200'}`}
            >
              Switch to {currentUser.role === ROLES.ADMIN ? 'Employee' : 'Admin'} View
            </button>
          )}


          <div className={`flex items-center gap-3 mb-3 p-2 rounded-lg border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
              {currentUser?.initials || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>{currentUser?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{currentUser?.role || 'loading...'}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${darkMode ? 'bg-white/5 hover:bg-white/10 text-slate-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              {darkMode ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Light</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> Dark</>
              )}
            </button>
            <button className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 border group ${darkMode ? 'bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border-white/5 hover:border-rose-500/20' : 'bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border-gray-200 hover:border-rose-200'}`}>
              <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 p-4 lg:p-8 overflow-y-auto ${darkMode ? '' : 'bg-gray-50'}`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <button 
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
          <div className="w-10" />
        </div>

        {/* Header with Search Trigger */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
        <h1 className={`text-3xl font-bold mb-1 tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
            <p className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Welcome back, {currentUser?.name || 'User'} 👋</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSearchOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${darkMode ? 'bg-white/5 border-white/10 hover:border-indigo-500/30 text-slate-400 hover:text-white' : 'bg-white border-gray-200 hover:border-indigo-300 text-gray-600 hover:text-gray-900 shadow-sm'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="text-sm">Search...</span>
              <span className="text-xs opacity-50 ml-2">⌘K</span>
            </button>
            <div className={`w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]`}></div>
          </div>
        </header>

        {/* KPI Cards - Filtered by RBAC */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'Total Assets', value: '120', trend: '+12%', color: 'indigo', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z', permission: PERMISSIONS.VIEW_ALL_ASSETS },
            { title: 'Employees', value: '25', trend: '+3 new', color: 'emerald', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', permission: PERMISSIONS.MANAGE_USERS },
            { title: 'Active Assets', value: '98', trend: '82% active', color: 'amber', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', permission: null }
          ].filter(card => !card.permission || hasPermission(card.permission)).map((card, i) => (
            <div key={i} className="relative group cursor-pointer" onClick={() => showToast(`Viewing ${card.title} details`)}>
              <div className={`absolute inset-0 bg-gradient-to-br from-${card.color}-500/20 to-${card.color === 'indigo' ? 'violet' : card.color === 'emerald' ? 'teal' : 'orange'}-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <div className={`relative p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:-translate-y-1 ${darkMode ? 'bg-[#13131f]/60 border-white/10 hover:border-' + card.color + '-500/30' : 'bg-white border-gray-200 hover:border-' + card.color + '-300 shadow-sm'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${card.color}-500/10 border border-${card.color}-500/20`}>
                    <svg className={`w-6 h-6 text-${card.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} /></svg>
                  </div>
                  <span className={`text-xs font-medium bg-${card.color}-500/10 text-${card.color}-400 px-2 py-1 rounded-full border border-${card.color}-500/20`}>{card.trend}</span>
                </div>
                <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{card.title}</h3>
                <p className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{card.value}</p>
                <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full w-[${i === 0 ? '75' : i === 1 ? '60' : '82'}%] bg-gradient-to-r from-${card.color}-500 to-${card.color === 'indigo' ? 'violet' : card.color === 'emerald' ? 'teal' : 'orange'}-500 rounded-full`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Operations Bar */}
        {selectedAssets.length > 0 && (
          <div className={`mb-6 p-4 rounded-xl border backdrop-blur-md animate-in slide-in-from-top-2 ${darkMode ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{selectedAssets.length} assets selected</span>
                <button 
                  onClick={() => setSelectedAssets([])}
                  className="text-xs text-slate-500 hover:text-slate-300 underline"
                >
                  Clear
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => showToast('Bulk reassignment modal opened')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'}`}
                >
                  Reassign
                </button>
                <button 
                  onClick={() => showToast('Maintenance scheduled for selected assets')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400' : 'bg-amber-100 hover:bg-amber-200 text-amber-700'}`}
                >
                  Maintenance
                </button>
                {hasPermission(PERMISSIONS.DELETE_ASSET) && (
                  <button 
                    onClick={() => {
                      showToast('Assets deleted');
                      setSelectedAssets([]);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400' : 'bg-rose-100 hover:bg-rose-200 text-rose-700'}`}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Assigned Gear */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Assigned Gear</h2>
            <button 
              onClick={() => showToast('Viewing all assets')}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              View All Assets →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assets.map((asset) => (
              <div 
                key={asset.id} 
                className={`group relative overflow-hidden rounded-2xl backdrop-blur-md border transition-all duration-300 ${expandedCard === asset.id ? 'ring-2 ring-indigo-500/50' : ''} ${darkMode ? 'bg-[#13131f]/60 border-white/10 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-lg'}`}
              >
                <div className="absolute top-4 left-4 z-10">
                  <input 
                    type="checkbox" 
                    checked={selectedAssets.includes(asset.id)}
                    onChange={() => toggleAssetSelection(asset.id)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer"
                  />
                </div>

                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-4 pl-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${darkMode ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                        <svg className={`w-6 h-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {editingField === `${asset.id}-name` ? (
                            <input 
                              type="text" 
                              defaultValue={asset.name}
                              className="bg-transparent border-b border-indigo-500 outline-none text-white"
                              onBlur={(e) => {
                                setEditingField(null);
                                showToast('Asset name updated');
                              }}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                              autoFocus
                            />
                          ) : (
                            <span onClick={() => setEditingField(`${asset.id}-name`)} className="cursor-text hover:text-indigo-400 transition-colors border-b border-transparent hover:border-indigo-400/30">
                              {asset.name}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm font-mono text-slate-500">{asset.id}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setQuickActionsOpen(quickActionsOpen === asset.id ? null : asset.id)}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2"/></svg>
                      </button>
                      
                      {quickActionsOpen === asset.id && (
                        <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl z-20 backdrop-blur-md ${darkMode ? 'bg-[#1a1a2e] border-white/10' : 'bg-white border-gray-200'}`}>
                          <button onClick={() => handleQuickAction('Reassign', asset.id)} className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 first:rounded-t-xl ${darkMode ? 'text-slate-300' : 'text-gray-700 hover:bg-gray-50'}`}>Reassign</button>
                          <button onClick={() => handleQuickAction('Schedule Maintenance', asset.id)} className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${darkMode ? 'text-slate-300' : 'text-gray-700 hover:bg-gray-50'}`}>Schedule Maintenance</button>
                          <button onClick={() => handleQuickAction('View History', asset.id)} className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${darkMode ? 'text-slate-300' : 'text-gray-700 hover:bg-gray-50'}`}>View History</button>
                          {hasPermission(PERMISSIONS.DELETE_ASSET) && (
                            <button onClick={() => handleQuickAction('Delete Asset', asset.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-rose-500/10 text-rose-400 last:rounded-b-xl">Delete Asset</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm pl-8">
                    <div className={`flex justify-between ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      <span>Type</span>
                      <span className={darkMode ? 'text-slate-200' : 'text-gray-900'}>{asset.type}</span>
                    </div>
                    <div className={`flex justify-between ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      <span>Assigned</span>
                      <span className={darkMode ? 'text-slate-200' : 'text-gray-900'}>{asset.date}</span>
                    </div>
                    <div className={`flex justify-between ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      <span>Status</span>
                      <span className={asset.status === 'excellent' ? 'text-emerald-400' : 'text-amber-400'}>
                        {asset.status === 'excellent' ? 'Excellent Condition' : 'Needs Maintenance'}
                      </span>
                    </div>
                  </div>

                  {expandedCard === asset.id && (
                    <div className={`mt-4 pt-4 border-t pl-8 animate-in slide-in-from-top-2 ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                      <div className="space-y-3 text-sm">
                        <div className={`flex justify-between ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          <span>Warranty</span>
                          <span className={darkMode ? 'text-slate-200' : 'text-gray-900'}>Valid until Mar 2028</span>
                        </div>
                        <div className={`flex justify-between ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          <span>Last Service</span>
                          <span className={darkMode ? 'text-slate-200' : 'text-gray-900'}>Never</span>
                        </div>
                        <div className={`flex justify-between ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          <span>Purchase Price</span>
                          <span className={darkMode ? 'text-slate-200' : 'text-gray-900'}>$1,299.00</span>
                        </div>
                        <div className="mt-3 p-3 rounded-lg bg-slate-800/50 border border-white/5">
                          <p className="text-xs text-slate-500 mb-1">Notes</p>
                          <p className="text-sm text-slate-300">{asset.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pl-8">
                    <button 
                      onClick={() => toggleExpandCard(asset.id)}
                      className={`flex-1 py-2 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${darkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'}`}
                    >
                      <svg className={`w-4 h-4 transition-transform ${expandedCard === asset.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      {expandedCard === asset.id ? 'Show Less' : 'Details'}
                    </button>
                    <button 
                      onClick={() => showToast(`Issue reported for ${asset.id}`)}
                      className={`flex-1 py-2 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${darkMode ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Assets Table - Admin Only */}
        {hasPermission(PERMISSIONS.VIEW_ALL_ASSETS) && (
          <section className={`rounded-2xl border overflow-hidden backdrop-blur-md ${darkMode ? 'bg-[#13131f]/60 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
              <h2 className={`text-lg font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Assets</h2>
              <div className="flex gap-2">
                <button 
                  onClick={selectAllAssets}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${darkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200'}`}
                >
                  {selectedAssets.length === assets.length ? 'Deselect All' : 'Select All'}
                </button>
                <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${darkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200'}`}>
                  Filter
                </button>
                <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${darkMode ? 'text-slate-400 hover:text-white hover:bg-white/5 border-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200'}`}>
                  Export
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`text-xs font-semibold uppercase tracking-wider border-b ${darkMode ? 'text-slate-500 border-white/5 bg-white/[0.02]' : 'text-gray-500 border-gray-100 bg-gray-50'}`}>
                    <th className="px-6 py-4 font-medium w-8">
                      <input 
                        type="checkbox" 
                        checked={selectedAssets.length === assets.length && assets.length > 0}
                        onChange={selectAllAssets}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 font-medium">Asset Name</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Assignee</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                  {[
                    { name: 'MacBook Pro M3', type: 'Laptop', assignee: 'John Doe', status: 'active', initials: 'JD', color: 'indigo' },
                    { name: 'Dell Monitor U2723QE', type: 'Monitor', assignee: 'Alice Smith', status: 'repair', initials: 'AS', color: 'amber' },
                    { name: 'Logitech MX Keys', type: 'Keyboard', assignee: 'Robert Johnson', status: 'inactive', initials: 'RJ', color: 'rose' }
                  ].map((item, i) => (
                    <tr key={i} className={`hover:bg-white/[0.02] transition-colors group ${selectedAssets.includes(`table-${i}`) ? 'bg-indigo-500/5' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedAssets.includes(`table-${i}`)}
                          onChange={() => toggleAssetSelection(`table-${i}`)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-${item.color}-500/10 flex items-center justify-center border border-${item.color}-500/20`}>
                            <svg className={`w-4 h-4 text-${item.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </div>
                          <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>{item.name}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{item.type}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-medium">{item.initials}</div>
                          <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{item.assignee}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          item.status === 'repair' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-400 animate-pulse' : item.status === 'repair' ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
                          {item.status === 'active' ? 'Active' : item.status === 'repair' ? 'In Repair' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => showToast(`Editing ${item.name}`)}
                          className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className={`p-4 border-t flex items-center justify-between text-sm ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
              <span className={darkMode ? 'text-slate-500' : 'text-gray-500'}>Showing 3 of 120 assets</span>
              <div className="flex gap-2">
                <button className={`px-3 py-1 rounded-lg transition-colors disabled:opacity-50 ${darkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`} disabled>Previous</button>
                <button className={`px-3 py-1 rounded-lg transition-colors ${darkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>Next</button>
              </div>
            </div>
          </section>
        )}

        {/* Employee View - Limited Access Message */}
        {!hasPermission(PERMISSIONS.VIEW_ALL_ASSETS) && (
          <div className={`rounded-2xl border border-dashed overflow-hidden backdrop-blur-md ${darkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-gray-50 border-gray-300'}`}>
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Limited Access</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                You can only view assets assigned to you. Contact an administrator for access to the full inventory.
              </p>
            </div>
          </div>
        )}

        {/* Footer Tip */}
        <div className={`mt-8 p-4 rounded-xl border text-center text-xs ${darkMode ? 'bg-white/[0.02] border-white/5 text-slate-500' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
          <span className="font-medium">Pro Tip:</span> Press <kbd className={`px-2 py-0.5 rounded font-mono text-xs mx-1 ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-700 border border-gray-300'}`}>Ctrl K</kbd> to search, <kbd className={`px-2 py-0.5 rounded font-mono text-xs mx-1 ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-700 border border-gray-300'}`}>?</kbd> for shortcuts, or use the <span className="text-indigo-400">Switch Role</span> button to test RBAC
        </div>

      </main>
    </div>
  );
}