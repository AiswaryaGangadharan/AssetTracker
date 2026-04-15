"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getAssets, 
  getDashboard, 
  requestAsset,
  createIssue,
  getRequests
} from '@/lib/api';

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  Monitor, 
  Laptop, 
  Keyboard, 
  HardDrive,
  PlusCircle,
  ShieldAlert,
  Send,
  RefreshCcw
} from 'lucide-react';


export default function EmployeeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [assets, setAssets] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Dialog states
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Form states
  const [requestForm, setRequestForm] = useState({ asset_type: 'Laptop', reason: '' });
  const [issueForm, setIssueForm] = useState({ description: '', severity: 'medium' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, dashboardRes, requestsRes] = await Promise.all([
        getAssets(),
        getDashboard(),
        getRequests()
      ]);
      setAssets(assetsRes.assets || []);
      setStats(dashboardRes.stats || {});
      setRequests(requestsRes.requests || []);
    } catch (error: any) {
      showToast(error.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, authLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestAsset = async () => {
    if (!requestForm.reason.trim()) {
      showToast('Please provide a reason', 'error');
      return;
    }
    try {
      await requestAsset(requestForm);
      showToast('Asset request submitted successfully');
      setRequestDialogOpen(false);
      setRequestForm({ asset_type: 'Laptop', reason: '' });
      fetchData();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleReportIssue = async () => {
    if (!issueForm.description.trim()) {
      showToast('Please provide a description', 'error');
      return;
    }
    try {
      await createIssue({
        asset_id: selectedAsset.id,
        description: issueForm.description,
        severity: issueForm.severity
      });
      showToast('Issue reported successfully');
      setIssueDialogOpen(false);
      setIssueForm({ description: '', severity: 'medium' });
      fetchData();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'laptop': return Laptop;
      case 'monitor': return Monitor;
      case 'keyboard': return Keyboard;
      default: return HardDrive;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-600' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
        }`}>
          <span className="font-medium flex items-center gap-2">
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {toast.message}
          </span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">My Workspace</h1>
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" /> {currentTime}
          </p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => setRequestDialogOpen(true)}>
             <PlusCircle className="w-4 h-4 mr-2" /> Request Asset
           </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">My Gear</CardDescription>
            <CardTitle className="text-3xl font-bold">{assets.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Package className="w-3 h-3 mr-1" /> Assigned company assets
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Package className="w-12 h-12" />
          </div>
        </Card>

        <Card className="relative overflow-hidden border-blue-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Active Requests</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {requests.filter(r => r.status === 'pending').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Send className="w-3 h-3 mr-1 text-blue-500" /> Pending approval
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Usage Status</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Optimal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> System verified
            </div>
          </CardContent>
        </Card>
      </div>


      {/* My Assets Table */}
      <Card className="shadow-none border-none sm:border sm:shadow-sm">
        <CardHeader>
          <CardTitle>Assigned Equipment</CardTitle>
          <CardDescription>Track and report issues for your assigned hardware</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Asset ID</TableHead>
                  <TableHead>Asset Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Support</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No assets are currently assigned to you.
                    </TableCell>
                  </TableRow>
                ) : (
                  assets.map((asset) => {
                    const AssetIcon = getAssetIcon(asset.type);
                    return (
                      <TableRow key={asset.id} className="group">
                        <TableCell className="font-mono text-xs font-bold">{asset.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <AssetIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{asset.name}</span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{asset.type}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize py-0.5 px-2">
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem onClick={() => {
                                setSelectedAsset(asset);
                                setIssueDialogOpen(true);
                              }} className="gap-2 text-amber-600 focus:text-amber-600">
                                <ShieldAlert className="w-4 h-4" /> Report Issue/Damage
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => fetchData()} className="gap-2">
                                <RefreshCcw className="w-4 h-4" /> Refresh Data
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-none sm:border sm:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Asset Requests</CardTitle>
            <CardDescription>History of your hardware requests and their status</CardDescription>
          </div>
          <Badge variant="outline">{requests.length} total</Badge>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                      You haven't requested any assets yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.asset_type}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{req.reason}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            req.status === 'approved' ? 'default' : 
                            req.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                          className="capitalize"
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(req.timestamp).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>


      {/* Dialogs */}
      
      {/* Request Asset Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request New Asset</DialogTitle>
            <DialogDescription>Submit a request for new company hardware.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="req-type">Asset Type</Label>
              <Select value={requestForm.asset_type} onValueChange={(val) => setRequestForm({...requestForm, asset_type: val})}>
                <SelectTrigger id="req-type">
                  <SelectValue placeholder="Select hardware type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Monitor">Monitor</SelectItem>
                  <SelectItem value="Keyboard">Keyboard</SelectItem>
                  <SelectItem value="Mouse">Mouse</SelectItem>
                  <SelectItem value="Headphones">Headphones</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-reason">Business Justification</Label>
              <Textarea 
                id="req-reason" 
                placeholder="e.g., Joining new project, keyboard key broken..." 
                className="min-h-[100px]"
                value={requestForm.reason}
                onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestAsset}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Issue Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Hardware Issue</DialogTitle>
            <DialogDescription>
              Reporting problem for <strong>{selectedAsset?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="issue-desc">Problem Description</Label>
              <Textarea 
                id="issue-desc" 
                placeholder="Describe the damage or maintenance issue..." 
                className="min-h-[100px]"
                value={issueForm.description}
                onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-severity">Severity</Label>
              <Select value={issueForm.severity} onValueChange={(val) => setIssueForm({...issueForm, severity: val})}>
                <SelectTrigger id="issue-severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Still usable)</SelectItem>
                  <SelectItem value="medium">Medium (Impaired)</SelectItem>
                  <SelectItem value="high">High (Broken/Unusable)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReportIssue}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

