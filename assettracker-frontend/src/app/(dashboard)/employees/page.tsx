'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers } from '@/lib/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Users, 
  Briefcase, 
  Mail, 
  Package,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';

export default function EmployeesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fetchData = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const usersRes = await getUsers(user.token);
      setEmployees(usersRes.users || []);
    } catch (error) {
      setToast({ message: 'Failed to load employees', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'admin') {
      // Employees shouldn't see the full directory if restricted
      // But for this project, let's allow it or show a restricted message
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="p-8 space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-600' : 'bg-green-500/10 border-green-500/30 text-green-600'
        }`}>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Directory</h1>
          <p className="text-muted-foreground">Manage staff and view their assigned company assets.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="px-3 py-1">
             <Users className="w-3 h-3 mr-2" /> {employees.length} Total Staff
           </Badge>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email or dept..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Assets</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                            {emp.initials || 'EE'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{emp.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-tight font-bold">ID: EMP-{emp.id.toString().padStart(3, '0')}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        {emp.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{emp.department}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.role === 'admin' ? 'default' : 'secondary'} className="gap-1.5 h-6">
                        {emp.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        <span className="capitalize">{emp.role}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-secondary h-1.5 rounded-full max-w-[60px] overflow-hidden">
                           <div className="bg-blue-500 h-full" style={{ width: `${Math.min(emp.asset_count * 20, 100)}%` }} />
                        </div>
                        <span className="text-sm font-semibold">{emp.asset_count}</span>
                        <Package className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/?search=${emp.name}`)}>
                        View Gear
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="bg-muted/30 border border-dashed rounded-lg p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Need to add a member? Employee records are managed through the central identity system.
        </p>
      </div>
    </div>
  );
}
