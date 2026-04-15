'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIssues, resolveIssue } from '@/lib/api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Clock,
  History
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function IssuesPage() {
  const { user, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fetchIssues = async () => {
    try {
      const res = await getIssues();
      setIssues(res.issues || []);
    } catch (error) {
      console.error("Failed to fetch issues", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchIssues();
    }
  }, [user, authLoading]);

  const handleResolve = async (id: string) => {
    try {
      await resolveIssue(id);
      setToast({ message: 'Issue marked as resolved', type: 'success' });
      fetchIssues();
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to resolve issue', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const filteredIssues = issues.filter(issue => 
    issue.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-600' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
        }`}>
          <span className="font-medium flex items-center gap-2">
            {toast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {toast.message}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Maintenance & Issues</h1>
        <p className="text-muted-foreground">Monitor reported hardware issues and track resolution progress.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by asset, user or description..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repair Log</CardTitle>
          <CardDescription>
            {filteredIssues.length} incident(s) registered in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No issues reported</h3>
              <p className="text-muted-foreground">System health is currently nominal.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{issue.asset_name}</TableCell>
                    <TableCell>{issue.user_name}</TableCell>
                    <TableCell className="max-w-xs">{issue.description}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          issue.severity === 'high' ? 'border-red-500 text-red-600 bg-red-50' : 
                          issue.severity === 'medium' ? 'border-amber-500 text-amber-600 bg-amber-50' : 
                          'border-blue-500 text-blue-600 bg-blue-50'
                        }
                      >
                        {issue.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(issue.timestamp).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={issue.status === 'resolved' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {issue.status}
                      </Badge>
                    </TableCell>
                    {user?.role === 'admin' && (
                      <TableCell className="text-right">
                        {issue.status === 'open' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8"
                            onClick={() => handleResolve(issue.id)}
                          >
                            <Wrench className="w-3.5 h-3.5 mr-1.5" />
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
