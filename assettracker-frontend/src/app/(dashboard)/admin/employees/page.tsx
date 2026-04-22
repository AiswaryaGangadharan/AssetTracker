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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

      <div className="bg-card rounded-xl border-2 shadow-sm overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed m-4">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No employees found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold py-4 pl-6">Member</TableHead>
                <TableHead className="font-bold">Contact Info</TableHead>
                <TableHead className="font-bold">Role & Dept</TableHead>
                <TableHead className="font-bold text-center">Gear Count</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="group transition-colors hover:bg-indigo-50/30">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                        {emp.initials || emp.name.charAt(0)}
                      </div>
                      <span className="font-bold text-lg tracking-tight uppercase group-hover:text-indigo-600 transition-colors">
                        {emp.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      {emp.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium capitalize">
                      <Briefcase className="w-4 h-4 text-indigo-400" />
                      {emp.department || 'General'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-bold border border-indigo-100">
                      <span>{emp.asset_count || 0}</span>
                      <Package className="w-4 h-4" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold px-3 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> {emp.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="font-bold border-2 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all h-9"
                      onClick={() => router.push(`/?search=${emp.name}`)}
                    >
                      View Gear
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
