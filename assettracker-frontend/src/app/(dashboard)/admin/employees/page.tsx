"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers } from '@/lib/api';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Users, 
  Mail, 
  Package,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from 'lucide-react';

export default function AdminEmployeesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await getUsers();
      setEmployees(usersRes.users || []);
    } catch (error) {
      console.error("Failed to load employees", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      router.push('/');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Employee Directory</h1>
          <p className="text-muted-foreground text-lg">Manage and view assigned assets for your team.</p>
        </div>
        <Badge variant="secondary" className="px-4 py-1 text-sm font-medium h-fit">
          <Users className="w-4 h-4 mr-2 text-indigo-500" /> {employees.length} Members
        </Badge>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Search by name or email..." 
          className="pl-10 h-12 text-md shadow-sm border-2 focus-visible:ring-indigo-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No employees found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria.</p>
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <Card key={emp.id} className="group overflow-hidden border-2 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-foreground group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                      {emp.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded text-sm">
                        <Mail className="w-4 h-4" /> {emp.email}
                      </span>
                      <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded text-sm capitalize">
                        <Briefcase className="w-4 h-4" /> {emp.department}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-center md:text-right">
                      <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-1">Assigned Assets</p>
                      <div className="flex items-center justify-center md:justify-end gap-2">
                        <span className="text-2xl font-black text-indigo-600">{emp.asset_count}</span>
                        <Package className="w-5 h-5 text-indigo-500" />
                      </div>
                    </div>

                    <div className="text-center md:text-right min-w-[100px]">
                      <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-1">Status</p>
                      <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold px-3 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> {emp.status || 'Active'}
                      </Badge>
                    </div>

                    <Button 
                      variant="outline" 
                      className="font-bold border-2 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                      onClick={() => router.push(`/?search=${emp.name}`)}
                    >
                      View Gear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
