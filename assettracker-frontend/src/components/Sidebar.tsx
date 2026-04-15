'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboard } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Clock, 
  LogOut, 
  Sun, 
  Moon, 
  X,
  Plus,
  Trash2,
  Menu,
  Wrench
} from 'lucide-react';


const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
} as const;

const PERMISSIONS = {
  VIEW_DASHBOARD: 'view:dashboard',
  VIEW_ALL_ASSETS: 'view:all_assets',
  MANAGE_USERS: 'manage:users',
  CREATE_ASSET: 'create:asset',
  DELETE_ASSET: 'delete:asset',
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ALL_ASSETS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.CREATE_ASSET,
    PERMISSIONS.DELETE_ASSET
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_DASHBOARD,
  ]
};

export function Sidebar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    if (user) {
      getDashboard().then(res => setStats(res.stats || {}));
    }
  }, [user]);

  const hasPermission = (permission: string) => {
    const role = user?.role as keyof typeof ROLE_PERMISSIONS;
    return ROLE_PERMISSIONS[role]?.includes(permission) || false;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', permission: PERMISSIONS.VIEW_DASHBOARD },
    { id: 'assets', label: 'All Assets', icon: Package, path: '/assets', permission: PERMISSIONS.VIEW_ALL_ASSETS },
    { id: 'requests', label: 'Requests', icon: Clock, path: '/requests', permission: PERMISSIONS.VIEW_DASHBOARD },
    { id: 'issues', label: 'Issues / Reports', icon: Wrench, path: '/issues', permission: PERMISSIONS.MANAGE_USERS },
    { id: 'employees', label: 'Employees', icon: Users, path: '/admin/employees', permission: PERMISSIONS.MANAGE_USERS },


  ].filter(item => {
      if (user?.role === 'employee' && (item.id === 'assets' || item.id === 'employees')) return false;
      return hasPermission(item.permission);
  });


  return (
    <>
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 w-72 h-screen flex flex-col border-r bg-card z-50 transition-transform duration-300`}>
        <div className="lg:hidden p-4 border-b flex items-center justify-between">
          <span className="font-bold">Menu</span>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

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

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Overview</p>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Button 
                  key={item.id} 
                  variant={pathname === item.path ? "secondary" : "ghost"} 
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    router.push(item.path);
                    if (window.innerWidth < 1024) setOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-accent/50">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-slate-700 text-white text-xs">
                {user?.initials || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user?.role || 'Guest'}</p>
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
            <Button variant="outline" size="sm" className="flex-1" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
