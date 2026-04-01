'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAssets, getDashboard } from '@/lib/api';
import { User } from '@/types/user';
import { useTheme } from 'next-themes';

// ==========================================
// SHADCN UI IMPORTS
// ==========================================
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Separator } from '@/components/ui/separator';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

// ==========================================
// LUCIDE ICONS (Shadcn standard)
// ==========================================
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  Sun, 
  Moon, 
  LogOut, 
  MoreVertical, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  X,
  Command,
  Monitor,
  Laptop,
  Keyboard,
  HardDrive
} from 'lucide-react';

// ==========================================
// RBAC CONSTANTS
// ==========================================
const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
} as const;

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

// ==========================================
// ICON HELPER
// ==========================================
const getAssetIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'laptop': return Laptop;
    case 'monitor': return Monitor;
    case 'keyboard': return Keyboard;
    default: return HardDrive;
  }
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [quickActionsOpen, setQuickActionsOpen] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Sync auth user
  useEffect(() => {
    if (user) {
      setCurrentUser({
        id: user.id || 1,
        name: user.name || 'User',
        role: user.role as any,
        initials: user.initials || 'U',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const token = user?.token;
    if (token) {
      const fetchData = async () => {
        try {
          const [assetsRes, dashboardRes] = await Promise.all([
            getAssets(token),
            getDashboard(token)
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
  }, [user, authLoading, router]);

  // ==========================================
  // RBAC HELPER
  // ==========================================
  const hasPermission = (permission: string) => {
    if (!currentUser?.role) return false;
    return ROLE_PERMISSIONS[currentUser.role]?.includes(permission) || false;
  };

  // Toggle role for demo (preserves user identity)
  const toggleRole = () => {
    if (!currentUser) return;
    const newRole = currentUser.role === ROLES.ADMIN ? ROLES.EMPLOYEE : ROLES.ADMIN;
    setCurrentUser({ ...currentUser, role: newRole });
    setSelectedAssets([]);
    showToast(`Switched to ${newRole}`, 'info');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setExpandedCard(null);
        setQuickActionsOpen(null);
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

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // ==========================================
  // ASSET OPERATIONS
  // ==========================================
  const toggleAssetSelection = (id: string) => {
    setSelectedAssets(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const selectAllAssets = () => {
    if (selectedAssets.length === visibleAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(visibleAssets.map(a => a.id));
    }
  };

  const handleQuickAction = (action: string, assetId: string) => {
    showToast(`${action} initiated for ${assetId}`);
    setQuickActionsOpen(null);
  };

  const toggleExpandCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  // ==========================================
  // FILTERED ASSETS (RBAC) - KEY REQUIREMENT
  // ==========================================
  const visibleAssets = currentUser?.role === ROLES.EMPLOYEE
    ? assets.filter(asset => asset.assigned_to === currentUser.id)
    : assets;

  // ==========================================
  // ROLE-BASED STATS
  // ==========================================
  const getKpiStats = () => {
    if (currentUser?.role === ROLES.EMPLOYEE) {
      return [
        { 
          title: 'My Assets', 
          value: visibleAssets.length.toString(), 
          trend: `${visibleAssets.filter((a: any) => a.status === 'active').length} active`, 
          color: 'blue',
          icon: Package,
          progress: visibleAssets.length > 0 ? 100 : 0
        },
        { 
          title: 'Department Assets', 
          value: dashboardStats.department_assets?.toString() || '0', 
          trend: 'Shared pool', 
          color: 'amber',
          icon: Users,
          progress: 60
        },
        { 
          title: 'Active Items', 
          value: visibleAssets.filter((a: any) => a.status === 'active').length.toString(), 
          trend: `${Math.round((visibleAssets.filter((a: any) => a.status === 'active').length / (visibleAssets.length || 1)) * 100)}% operational`, 
          color: 'emerald',
          icon: CheckCircle2,
          progress: Math.round((visibleAssets.filter((a: any) => a.status === 'active').length / (visibleAssets.length || 1)) * 100)
        }
      ];
    }
    
    // Admin stats
    return [
      { 
        title: 'Total Assets', 
        value: dashboardStats.total_assets?.toString() || assets.length.toString() || '0', 
        trend: '+12%', 
        color: 'indigo',
        icon: Package,
        progress: 75
      },
      { 
        title: 'Employees', 
        value: dashboardStats.employees?.toString() || '0', 
        trend: '+3 new', 
        color: 'emerald',
        icon: Users,
        progress: 60
      },
      { 
        title: 'Active Assets', 
        value: dashboardStats.active_assets?.toString() || assets.filter((a: any) => a.status === 'active').length.toString() || '0', 
        trend: `${Math.round(((dashboardStats.active_assets || assets.filter((a: any) => a.status === 'active').length) / (dashboardStats.total_assets || assets.length || 1)) * 100)}% active`, 
        color: 'amber',
        icon: CheckCircle2,
        progress: Math.round(((dashboardStats.active_assets || assets.filter((a: any) => a.status === 'active').length) / (dashboardStats.total_assets || assets.length || 1)) * 100)
      }
    ];
  };

  const kpiStats = getKpiStats();

  // ==========================================
  // NAVIGATION ITEMS (RBAC FILTERED)
  // ==========================================
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.VIEW_DASHBOARD },
    { id: 'assets', label: 'All Assets', icon: Package, permission: PERMISSIONS.VIEW_ALL_ASSETS, count: dashboardStats.total_assets || assets.length },
    { id: 'employees', label: 'Employees', icon: Users, permission: PERMISSIONS.MANAGE_USERS, count: dashboardStats.employees }
  ].filter(item => hasPermission(item.permission));

  const adminTools = [
    { id: 'create-asset', label: 'Create Asset', icon: Plus, permission: PERMISSIONS.CREATE_ASSET, variant: 'default' as const },
    { id: 'delete-asset', label: 'Delete Asset', icon: Trash2, permission: PERMISSIONS.DELETE_ASSET, variant: 'destructive' as const }
  ].filter(tool => hasPermission(tool.permission));

  // ==========================================
  // RENDER
  // ==========================================
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-72 border-r bg-card p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="h-px bg-border my-2" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <main className="flex-1 p-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400' :
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' :
          'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'error' && <X className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Command Palette */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4 bg-black/60" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-2xl bg-card rounded-lg border shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search assets, employees, or commands..." 
                className="flex-1 border-0 focus-visible:ring-0"
                autoFocus
              />
              <Badge variant="secondary">ESC to close</Badge>
            </div>
            <div className="max-h-96 p-2 overflow-y-auto">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Recent</div>
              {['ThinkPad T14', 'Dell Monitor', 'John Doe', 'Create Asset'].map((item, i) => (
                <button key={i} className="w-full text-left px-3 py-2.5 rounded-md hover:bg-accent text-sm transition-colors flex items-center gap-3">
                  <Command className="w-4 h-4 text-muted-foreground" />
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 w-72 h-screen flex flex-col border-r bg-card z-50 transition-transform duration-300`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b flex items-center justify-between">
          <span className="font-bold">Menu</span>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AssetTracker</h1>
              <p className="text-xs text-muted-foreground">Enterprise Edition</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Overview Section */}
          <div className="mb-6">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Overview</p>
            <div className="space-y-1">
              <Button variant="secondary" className="w-full justify-start gap-3">
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Button>
              {/* Close ScrollArea replacement */}
              
              {navigationItems.filter(item => item.id !== 'dashboard').map((item) => (
                <Button key={item.id} variant="ghost" className="w-full justify-start gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.count !== undefined && (
                    <Badge variant="secondary" className="ml-auto">{item.count}</Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Admin Tools */}
          {adminTools.length > 0 && (
            <div className="mb-6">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Admin Tools</p>
              <div className="space-y-1">
                {adminTools.map((tool) => (
                  <Button 
                    key={tool.id} 
                    variant={tool.variant === 'destructive' ? 'ghost' : 'ghost'}
                    className={`w-full justify-start gap-3 ${tool.variant === 'destructive' ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950' : ''}`}
                  >
                    <tool.icon className="w-5 h-5" />
                    <span className="font-medium">{tool.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t">
          {/* Role Switcher for Demo */}
          {currentUser && (
            <Button
              onClick={toggleRole}
              variant="outline"
              size="sm"
              className="w-full mb-3 text-xs"
            >
              Switch to {currentUser.role === ROLES.ADMIN ? 'Employee' : 'Admin'} View
            </Button>
          )}

          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-accent/50">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-xs">
                {currentUser?.initials || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{currentUser?.role || 'loading...'}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex-1"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <LayoutDashboard className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="w-10" />
        </div>

        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {currentUser?.name || 'User'} 👋</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => setSearchOpen(true)}
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search...</span>
              <Badge variant="secondary" className="ml-2">⌘K</Badge>
            </Button>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </header>

        {/* KPI Cards - Role Based */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {kpiStats.map((card, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => showToast(`Viewing ${card.title} details`)}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className={`p-2 rounded-lg bg-${card.color}-500/10`}>
                  <card.icon className={`w-6 h-6 text-${card.color}-500`} />
                </div>
                <Badge variant="outline">{card.trend}</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription>{card.title}</CardDescription>
                <CardTitle className="text-3xl">{card.value}</CardTitle>
                <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${card.color}-500 rounded-full`}
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bulk Operations Bar */}
        {selectedAssets.length > 0 && (
          <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{selectedAssets.length} assets selected</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedAssets([])}>
                    Clear
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => showToast('Bulk reassignment modal opened')}>
                    Reassign
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => showToast('Maintenance scheduled')}>
                    Maintenance
                  </Button>
                  {hasPermission(PERMISSIONS.DELETE_ASSET) && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        showToast('Assets deleted');
                        setSelectedAssets([]);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assets Section - Title based on role */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold tracking-tight">
              {currentUser?.role === ROLES.ADMIN ? 'All Assets' : 'My Assigned Gear'}
            </h2>
            <Button variant="ghost" className="text-sm text-blue-600" onClick={() => showToast('Viewing all assets')}>
              View All Assets →
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleAssets.length === 0 ? (
              <Card className="col-span-2 p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
                <p className="text-muted-foreground">
                  {currentUser?.role === ROLES.EMPLOYEE 
                    ? "You don't have any assets assigned to you yet."
                    : "No assets in the system. Create one to get started."
                  }
                </p>
              </Card>
            ) : (
              visibleAssets.map((asset: any) => {
                const AssetIcon = getAssetIcon(asset.type);
                return (
                  <Card 
                    key={asset.id} 
                    className={`relative overflow-hidden transition-all ${expandedCard === asset.id ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
<input type="checkbox" 
                            checked={selectedAssets.includes(asset.id)}
                            onChange={() => toggleAssetSelection(asset.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-300"
                          />
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                            <AssetIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {editingField === `${asset.id}-name` ? (
                                <Input 
                                  defaultValue={asset.name}
                                  className="h-8 w-48"
                                  onBlur={() => {
                                    setEditingField(null);
                                    showToast('Asset name updated');
                                  }}
                                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                                  autoFocus
                                />
                              ) : (
                                <span 
                                  onClick={() => setEditingField(`${asset.id}-name`)} 
                                  className="cursor-pointer hover:text-blue-600"
                                >
                                  {asset.name}
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription className="font-mono">{asset.id}</CardDescription>
                          </div>
                        </div>
                        
                        <DropdownMenu open={quickActionsOpen === asset.id} onOpenChange={(open) => setQuickActionsOpen(open ? asset.id : null)}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleQuickAction('Reassign', asset.id)}>
                              Reassign
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction('Schedule Maintenance', asset.id)}>
                              Schedule Maintenance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction('View History', asset.id)}>
                              View History
                            </DropdownMenuItem>
                            {hasPermission(PERMISSIONS.DELETE_ASSET) && (
                              <DropdownMenuItem 
                                onClick={() => handleQuickAction('Delete Asset', asset.id)}
                                className="text-red-600"
                              >
                                Delete Asset
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span>{asset.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assigned</span>
                        <span>{asset.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={asset.status === 'excellent' ? 'default' : 'secondary'}>
                          {asset.status === 'excellent' ? 'Excellent' : 'Needs Maintenance'}
                        </Badge>
                      </div>
                    </CardContent>

                    {expandedCard === asset.id && (
                      <CardContent className="border-t pt-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Warranty</span>
                            <span>Valid until Mar 2028</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Service</span>
                            <span>Never</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Purchase Price</span>
                            <span>$1,299.00</span>
                          </div>
                          {asset.notes && (
                            <div className="mt-3 p-3 rounded-lg bg-muted">
                              <p className="text-xs text-muted-foreground mb-1">Notes</p>
                              <p className="text-sm">{asset.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}

                    <CardFooter className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => toggleExpandCard(asset.id)}
                      >
                        {expandedCard === asset.id ? (
                          <><ChevronUp className="w-4 h-4 mr-2" /> Show Less</>
                        ) : (
                          <><ChevronDown className="w-4 h-4 mr-2" /> Details</>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => showToast(`Issue reported for ${asset.id}`)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Report
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        {/* All Assets Table - Admin Only */}
        {hasPermission(PERMISSIONS.VIEW_ALL_ASSETS) && (
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Recent Assets</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllAssets}>
                  {selectedAssets.length === visibleAssets.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button variant="outline" size="sm">Filter</Button>
                <Button variant="outline" size="sm">Export</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <Checkbox 
                        checked={selectedAssets.length === visibleAssets.length && visibleAssets.length > 0}
                        onCheckedChange={selectAllAssets}
                      />
                    </TableHead>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No assets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleAssets.slice(0, 10).map((asset: any) => {
                      const AssetIcon = getAssetIcon(asset.type);
                      return (
                        <TableRow 
                          key={asset.id}
                          className={selectedAssets.includes(asset.id) ? 'bg-blue-500/5' : ''}
                        >
                          <TableCell>
                            <Checkbox 
                              checked={selectedAssets.includes(asset.id)}
                              onCheckedChange={() => toggleAssetSelection(asset.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                                <AssetIcon className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="font-medium">{asset.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{asset.type}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs bg-slate-700 text-white">
                                  {asset.assignee_initials || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">{asset.assignee_name || 'Unassigned'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={asset.status === 'active' ? 'default' : asset.status === 'repair' ? 'secondary' : 'outline'}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${asset.status === 'active' ? 'bg-green-500' : asset.status === 'repair' ? 'bg-amber-500' : 'bg-red-500'}`} />
                              {asset.status === 'active' ? 'Active' : asset.status === 'repair' ? 'In Repair' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => showToast(`Editing ${asset.name}`)}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {Math.min(visibleAssets.length, 10)} of {visibleAssets.length} assets</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardFooter>
          </Card>
        )}

        {/* Employee View - Limited Access Message */}
        {!hasPermission(PERMISSIONS.VIEW_ALL_ASSETS) && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Limited Access</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You can only view assets assigned to you. Contact an administrator for access to the full inventory.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer Tip */}
        <div className="mt-8 p-4 rounded-lg bg-muted text-center text-xs text-muted-foreground">
          <span className="font-medium">Pro Tip:</span> Press <kbd className="px-2 py-0.5 rounded bg-background border font-mono">Ctrl K</kbd> to search, or use the <span className="text-blue-600">Switch Role</span> button to test RBAC
        </div>

      </main>
    </div>
  );
}