"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getAssets, 
  getDashboard, 
  deleteAsset, 
  createAsset, 
  assignAsset, 
  revokeAsset,
  getUsers,
  getAssetActivity
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
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  Clock, 
  Monitor, 
  Laptop, 
  Keyboard, 
  HardDrive,
  RefreshCcw,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';


export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [assets, setAssets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assetHistory, setAssetHistory] = useState<any[]>([]);

  // Form states
  const [newAsset, setNewAsset] = useState({ name: '', type: 'Laptop', notes: '' });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, dashboardRes, usersRes] = await Promise.all([
        getAssets(),
        getDashboard(),
        getUsers()
      ]);
      setAssets(assetsRes.assets || []);
      setStats(dashboardRes.stats || {});
      setEmployees(usersRes.users || []);
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
    if (user?.role !== 'admin') {
      router.push('/employee');
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

  const handleAddAsset = async () => {
    try {
      await createAsset(newAsset);
      showToast('Asset added successfully');
      setAddDialogOpen(false);
      setNewAsset({ name: '', type: 'Laptop', notes: '' });
      fetchData();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleAssignAsset = async () => {
    if (!selectedEmployeeId) {
      showToast('Please select an employee', 'error');
      return;
    }
    try {
      await assignAsset(selectedAsset.id, { user_id: parseInt(selectedEmployeeId) });
      showToast('Asset assigned successfully');
      setAssignDialogOpen(false);
      setSelectedEmployeeId("");
      fetchData();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleRevokeAsset = async (assetId: string) => {
    try {
      await revokeAsset(assetId);
      showToast('Asset status reset to available');
      fetchData();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleViewHistory = async (assetId: string) => {
      setSelectedAsset(assets.find(a => a.id === assetId));
      setHistoryDialogOpen(true);
      try {
          // Note: Backend might need a specific history endpoint, using activity for now
          // If activity is not assignment history, we might need a separate endpoint.
          // For now let's assume getAssetActivity returns relevant logs.
          // const history = await getAssetActivity(assetId);
          // setAssetHistory(history || []);
          setAssetHistory([]); // Placeholder if endpoint not ready
      } catch (e) {
          setAssetHistory([]);
      }
  };

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.assignee_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
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
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" /> {currentTime}
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={fetchData} className="hidden sm:flex">
             <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
           </Button>
           <Button onClick={() => setAddDialogOpen(true)}>
             <Plus className="w-4 h-4 mr-2" /> Add Asset
           </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Total Inventory</CardDescription>
            <CardTitle className="text-3xl font-bold">{stats.total_assets || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Package className="w-3 h-3 mr-1" /> All registered assets
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Package className="w-12 h-12" />
          </div>
        </Card>

        <Card className="relative overflow-hidden border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Deployed</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.assigned_assets || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> Currently with staff
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-500">
            <Users className="w-12 h-12" />
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Active Staff</CardDescription>
            <CardTitle className="text-3xl font-bold">{stats.total_employees || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="w-3 h-3 mr-1" /> Registered employees
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-amber-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Maintenance</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.maintenance_assets || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Wrench className="w-3 h-3 mr-1 text-amber-500" /> Repairs in progress
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-3 opacity-10 text-amber-500">
            <Wrench className="w-12 h-12" />
          </div>
        </Card>
      </div>

      {/* Asset Table Card */}
      <Card className="shadow-none border-none sm:border sm:shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div>
            <CardTitle>Asset Inventory</CardTitle>
            <CardDescription>Manage, track, and assign company hardware</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by name, ID or user..." 
              className="pl-9 bg-muted/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Asset Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Assignee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No assets found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((asset) => {
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
                          <Badge variant={
                            asset.status === 'available' ? 'outline' : 
                            asset.status === 'assigned' ? 'default' : 
                            'destructive'
                          } className="capitalize py-0.5 px-2">
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {asset.assignee_name && asset.assignee_name !== "Unassigned" ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                {asset.assignee_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                              </div>
                              <span className="text-sm font-medium">{asset.assignee_name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">--</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleViewHistory(asset.id)} className="gap-2">
                                <Clock className="w-4 h-4" /> View History
                              </DropdownMenuItem>
                              {asset.status === 'available' ? (
                                <DropdownMenuItem onClick={() => {
                                  setSelectedAsset(asset);
                                  setAssignDialogOpen(true);
                                }} className="gap-2">
                                  <Users className="w-4 h-4" /> Assign Asset
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleRevokeAsset(asset.id)} className="gap-2 text-amber-600">
                                  <RefreshCcw className="w-4 h-4" /> Revoke/Return
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => {
                                if (confirm('Are you sure you want to delete this asset?')) {
                                  deleteAsset(asset.id).then(() => {
                                    showToast('Asset deleted');
                                    fetchData();
                                  });
                                }
                              }} className="gap-2 text-destructive font-medium focus:text-destructive">
                                <Trash2 className="w-4 h-4" /> Delete Asset
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

      {/* Dialogs */}
      
      {/* Add Asset Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>Enter details for the new company hardware.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="asset-name">Asset Name</Label>
              <Input 
                id="asset-name" 
                placeholder="e.g., MacBook Pro 14-inch" 
                value={newAsset.name}
                onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-type">Asset Type</Label>
              <Select value={newAsset.type} onValueChange={(val) => setNewAsset({...newAsset, type: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Monitor">Monitor</SelectItem>
                  <SelectItem value="Keyboard">Keyboard</SelectItem>
                  <SelectItem value="Mouse">Mouse</SelectItem>
                  <SelectItem value="Headphones">Headphones</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-notes">Notes (Optional)</Label>
              <Input 
                id="asset-notes" 
                placeholder="Serial number, specs, etc." 
                value={newAsset.notes}
                onChange={(e) => setNewAsset({...newAsset, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAsset}>Register Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Asset Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Asset</DialogTitle>
            <DialogDescription>
              Assign <strong>{selectedAsset?.name}</strong> to an employee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Employee</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose staff member..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.role === 'employee').map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} ({employee.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignAsset}>Confirm Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Asset History: {selectedAsset?.id}</DialogTitle>
            <DialogDescription>Full lifecycle audit for {selectedAsset?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-6">
               <div className="flex gap-4 items-start relative pb-6 border-l-2 border-muted ml-3 pl-6">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle2 className="w-2 h-2 text-primary-foreground" />
                 </div>
                 <div className="space-y-1">
                   <p className="text-sm font-bold">Asset Created</p>
                   <p className="text-xs text-muted-foreground">Original registration in system</p>
                 </div>
               </div>
               {selectedAsset?.assignee_name && selectedAsset.assignee_name !== "Unassigned" && (
                 <div className="flex gap-4 items-start relative pb-6 border-l-2 border-muted ml-3 pl-6">
                   <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Users className="w-2 h-2 text-white" />
                   </div>
                   <div className="space-y-1">
                     <p className="text-sm font-bold capitalize">Assigned to {selectedAsset.assignee_name}</p>
                     <p className="text-xs text-muted-foreground">Current deployment active</p>
                   </div>
                 </div>
               )}
               <p className="text-center py-4 text-xs text-muted-foreground italic border-t border-dashed">
                 End of visualized audit log.
               </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

