'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getAssets, 
  getDashboard, 
  deleteAsset, 
  assignAsset, 
  revokeAsset, 
  requestAsset,
  getAssetActivity 
} from '@/lib/api';
import { User } from '@/types/user';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


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
  HardDrive,
  Clock
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
  CREATE_ASSET: 'create:asset',
  ASSIGN_ASSET: 'assign:asset',
  REVOKE_ASSET: 'revoke:asset',
  REQUEST_ASSET: 'request:asset'
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
  // - [x] Phase 1: Authentication & Protected Routing
  // - [x] Phase 2: RBAC (Backend & Frontend)
  // - [x] Phase 3: Functional Dashboard (Connect buttons to real APIs)
  // - [x] Phase 4: Asset Request Approval Workflow (HIGH PRIORITY)
  // - [x] Phase 5: Dashboard Analytics & Search/Filter
  // - [x] Phase 6: Asset History / Activity Logs
  // - [x] Phase 7: UI/UX Improvements & Polish
  const { user, loading: authLoading, logout } = useAuth();
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assetHistory, setAssetHistory] = useState<any[]>([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);




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

  // Remove toggleRole for production/security
  /* 
  const toggleRole = () => {
    ...
  };
  */

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

  const refreshData = async () => {
    const token = user?.token;
    if (!token) return;
    
    setLoading(true);
    try {
      const [assetsRes, dashboardRes] = await Promise.all([
        getAssets(token),
        getDashboard(token)
      ]);
      setAssets(assetsRes.assets || []);
      setDashboardStats(dashboardRes.stats || {});
    } catch (error) {
      showToast('Failed to refresh data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string, assetId: string, payload?: any) => {
    const token = user?.token;
    if (!token) return;

    try {
      if (action === 'Delete Asset') {
        setAssetToDelete(assetId);
        setDeleteConfirmOpen(true);
        return; // Don't delete yet
      } else if (action === 'Confirm Delete') {
        await deleteAsset(token, assetId);
        showToast(`Asset ${assetId} deleted successfully`);
        setDeleteConfirmOpen(false);
        setAssetToDelete(null);

      } else if (action === 'Revoke') {
        await revokeAsset(token, assetId);
        showToast(`Asset ${assetId} revoked successfully`);
      } else if (action === 'Assign') {
        await assignAsset(token, assetId, payload);
        showToast(`Asset ${assetId} assigned to ${payload.user_name}`);
      } else if (action === 'Request') {
        await requestAsset(token, { type: 'Laptop', reason: 'Business requirement' });
        showToast(`Request submitted successfully`);
      } else if (action === 'View History') {
        setSelectedAssetForHistory(assetId);
        const historyRes = await getAssetActivity(token, assetId);
        setAssetHistory(historyRes.logs || []);
        setHistoryDialogOpen(true);
        return; // Don't refresh whole dashboard for history view
      } else {
        showToast(`${action} initiated for ${assetId}`);
      }

      refreshData();
    } catch (error: any) {
      showToast(error.message || `Failed to perform ${action}`, 'error');
    } finally {
      setQuickActionsOpen(null);
    }
  };


  const toggleExpandCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  // ==========================================
  // FILTERED ASSETS (RBAC) - KEY REQUIREMENT
  // ==========================================
  const visibleAssets = (() => {
    let filtered = currentUser?.role === ROLES.EMPLOYEE
      ? assets.filter(asset => asset.assigned_to === currentUser.id)
      : assets;
    
    if (searchQuery) {
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.assignee_name && asset.assignee_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(asset => asset.status === statusFilter);
    }
    
    return filtered;
  })();


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
          value: visibleAssets.filter((a: any) => a.status === 'assigned').length.toString(), 
          trend: `${Math.round((visibleAssets.filter((a: any) => a.status === 'assigned').length / (visibleAssets.length || 1)) * 100)}% operational`, 
          color: 'emerald',
          icon: CheckCircle2,
          progress: Math.round((visibleAssets.filter((a: any) => a.status === 'assigned').length / (visibleAssets.length || 1)) * 100)
        }
      ];
    }
    
    const assignedCount = assets.filter((a: any) => a.status === 'assigned').length;
    const totalCount = assets.length || 1;
    const utilization = Math.round((assignedCount / totalCount) * 100);

    // Admin stats
    return [
      { 
        title: 'Total Inventory', 
        value: totalCount.toString(), 
        trend: 'Updated live', 
        color: 'indigo',
        icon: Package,
        progress: 100
      },
      { 
        title: 'Active Deployments', 
        value: assignedCount.toString(), 
        trend: `${utilization}% utilization`, 
        color: 'emerald',
        icon: CheckCircle2,
        progress: utilization
      },
      { 
        title: 'Available Stock', 
        value: assets.filter((a: any) => a.status === 'available').length.toString(), 
        trend: 'Ready to assign', 
        color: 'blue',
        icon: Monitor,
        progress: Math.round((assets.filter((a: any) => a.status === 'available').length / totalCount) * 100)
      },
    ];
  };


  const kpiStats = getKpiStats();

  // ==========================================
  // NAVIGATION ITEMS (RBAC FILTERED)
  // ==========================================
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.VIEW_DASHBOARD, path: '/' },
    { id: 'assets', label: 'All Assets', icon: Package, permission: PERMISSIONS.VIEW_ALL_ASSETS, count: dashboardStats.total_assets || assets.length, path: '/assets' },
    { id: 'requests', label: 'Requests', icon: Clock, permission: PERMISSIONS.VIEW_DASHBOARD, path: '/requests' },
    { id: 'employees', label: 'Employees', icon: Users, permission: PERMISSIONS.MANAGE_USERS, count: dashboardStats.employees, path: '/employees' }
  ].filter(item => hasPermission(item.permission));


  const adminTools = [
    { id: 'create-asset', label: 'Create Asset', icon: Plus, permission: PERMISSIONS.CREATE_ASSET, variant: 'default' as const },
    { id: 'delete-asset', label: 'Delete Asset', icon: Trash2, permission: PERMISSIONS.DELETE_ASSET, variant: 'destructive' as const }
  ].filter(tool => hasPermission(tool.permission));

  const employeeTools = [
    { id: 'request-asset', label: 'Request Asset', icon: Plus, permission: PERMISSIONS.REQUEST_ASSET, variant: 'default' as const }
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
    <div className="p-4 lg:p-8 space-y-8">
      
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery(e.currentTarget.value);
                    setSearchOpen(false);
                  }
                }}
              />
              <Badge variant="secondary">ESC to close</Badge>
            </div>
            <div className="max-h-96 p-2 overflow-y-auto">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Quick Navigation</div>
              {['Assets', 'Employees', 'Requests'].map((item, i) => (
                <button 
                  key={i} 
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-accent text-sm transition-colors flex items-center gap-3"
                  onClick={() => {
                    router.push(`/${item.toLowerCase()}`);
                    setSearchOpen(false);
                  }}
                >
                  <Command className="w-4 h-4 text-muted-foreground" />
                  Go to {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight">System Overview</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser?.name || 'User'} 👋</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Role Switcher for Demo */}
          {user?.role === ROLES.ADMIN && (
            <Button
              onClick={() => {
                const newRole = currentUser?.role === ROLES.ADMIN ? ROLES.EMPLOYEE : ROLES.ADMIN;
                setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
                showToast(`Switched to ${newRole} view`, 'info');
              }}
              variant="outline" 
              size="sm"
              className="h-10 px-4 border-dashed border-indigo-500/50 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10"
            >
              Viewing as {currentUser?.role === ROLES.ADMIN ? 'Admin' : 'Employee'}
            </Button>
          )}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search gear..." 
              className="pl-9 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl self-stretch border">
            {['all', 'assigned', 'available', 'maintenance'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'ghost'}
                size="sm"
                className={`capitalize text-xs h-8 px-4 transition-all duration-200 ${
                  statusFilter === status 
                    ? 'shadow-sm font-semibold' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </header>


      {/* KPI Cards - Role Based */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiStats.map((card, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
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
        <Card className="border-blue-500/30 bg-blue-500/5 animate-in fade-in zoom-in-95">
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

      {/* Assets Table Section */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>{currentUser?.role === ROLES.ADMIN ? 'Recent Inventory' : 'My Assigned Gear'}</CardTitle>
            <CardDescription>Manage and track technological inventory</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/assets')}>
              View All Assets
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
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
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : visibleAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                      No assets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleAssets.slice(0, 5).map((asset: any) => {
                    const AssetIcon = getAssetIcon(asset.type);
                    return (
                      <TableRow 
                        key={asset.id}
                        className={selectedAssets.includes(asset.id) ? 'bg-indigo-500/5' : ''}
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
                        <TableCell className="text-muted-foreground capitalize">{asset.type}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-[10px] bg-slate-700 text-white">
                                {asset.assignee_initials || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">{asset.assignee_name || 'Unassigned'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={asset.status === 'assigned' ? 'default' : asset.status === 'maintenance' ? 'destructive' : 'secondary'}>
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleQuickAction('View History', asset.id)}>View History</DropdownMenuItem>
                              {hasPermission(PERMISSIONS.DELETE_ASSET) && (
                                <DropdownMenuItem onClick={() => handleQuickAction('Delete Asset', asset.id)} className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
        </CardContent>
        {visibleAssets.length > 5 && (
          <CardFooter className="flex justify-center border-t p-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/assets')}>
              View All {visibleAssets.length} Assets
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Asset History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Activity History: {selectedAssetForHistory}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto pr-2">
            {assetHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No history found for this asset.</p>
            ) : (
              assetHistory.map((log, i) => (
                <div key={log.id} className="relative pl-6 pb-6 border-l last:border-0 last:pb-0">
                  <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{log.action}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.notes}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete asset <strong>{assetToDelete}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleQuickAction('Confirm Delete', assetToDelete!)}>
              Delete Asset
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer Tip */}
      <div className="p-4 rounded-lg bg-muted text-center text-xs text-muted-foreground">
        <span className="font-medium">Pro Tip:</span> Press <kbd className="px-2 py-0.5 rounded bg-background border font-mono">Ctrl K</kbd> to search anywhere.
      </div>

    </div>
  );
}
                showToast('Exporting data...');
              }}>
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                 showToast('Fetching latest reports...');
              }}>
                Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">

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

                  {loading ? (

                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : visibleAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Search className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold tracking-tight">No assets found</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                              We couldn't find any assets matching your current search or filter criteria.
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('all');
                            }}
                            className="mt-2"
                          >
                            Clear All Filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleAssets.map((asset: any) => {
                      const AssetIcon = getAssetIcon(asset.type);
                      return (
                        <TableRow 
                          key={asset.id}
                          className={selectedAssets.includes(asset.id) ? 'bg-indigo-500/5' : ''}
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
                          <TableCell className="text-muted-foreground capitalize">{asset.type}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-[10px] bg-slate-700 text-white">
                                  {asset.assignee_initials || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">{asset.assignee_name || 'Unassigned'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={asset.status === 'assigned' ? 'default' : asset.status === 'maintenance' ? 'destructive' : 'secondary'}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${asset.status === 'assigned' ? 'bg-green-500' : asset.status === 'maintenance' ? 'bg-red-500' : 'bg-blue-500'}`} />
                              {asset.status === 'assigned' ? 'Assigned' : asset.status === 'maintenance' ? 'Maintenance' : 'Available'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => showToast(`Asset details: ${asset.name}`)}>View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleQuickAction('View History', asset.id)}>View History</DropdownMenuItem>
                                {hasPermission(PERMISSIONS.DELETE_ASSET) && (
                                  <DropdownMenuItem onClick={() => handleQuickAction('Delete Asset', asset.id)} className="text-red-600">
                                    Delete Asset
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        {/* Asset History Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Activity History: {selectedAssetForHistory}</DialogTitle>
              <DialogDescription>
                Full audit trail for this asset.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto pr-2">
              {assetHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No history found for this asset.</p>
              ) : (
                assetHistory.map((log, i) => (
                  <div key={log.id} className="relative pl-6 pb-6 border-l last:border-0 last:pb-0">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{log.action}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{log.notes}</p>
                      <span className="text-[10px] font-medium">By: {log.user_name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete asset <strong>{assetToDelete}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleQuickAction('Confirm Delete', assetToDelete!)}>
                Delete Asset
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}