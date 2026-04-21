'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createAsset,
  getAssets, 
  deleteAsset, 
  assignAsset, 
  revokeAsset, 
  getAssetActivity 
} from '@/lib/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Laptop, 
  Monitor, 
  Keyboard, 
  HardDrive,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';

const getAssetIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'laptop': return Laptop;
    case 'monitor': return Monitor;
    case 'keyboard': return Keyboard;
    default: return HardDrive;
  }
};

export default function AssetsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  // Dialog States
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<string | null>(null);
  const [assetHistory, setAssetHistory] = useState<any[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', type: 'Laptop' });

  const fetchData = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const assetsRes = await getAssets();
      setAssets(assetsRes.assets || []);
    } catch (error) {

      showToast('Failed to load assets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (action: string, assetId: string, payload?: any) => {
    const token = user?.token;
    if (!token) return;

    try {
      if (action === 'Delete') {
        setAssetToDelete(assetId);
        setDeleteConfirmOpen(true);
        return;
      } else if (action === 'Confirm Delete') {
        await deleteAsset(assetId);
        showToast(`Asset deleted`);
        setDeleteConfirmOpen(false);
      } else if (action === 'View History') {
        const historyRes = await getAssetActivity(assetId);
        setAssetHistory(historyRes.logs || []);
        setSelectedAssetForHistory(assetId);
        setHistoryDialogOpen(true);
        return;
      } else if (action === 'Revoke') {
        await revokeAsset(assetId);
        showToast('Asset status updated');
      }
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Operation failed', 'error');
    }
  };

  const handleAddAsset = async () => {
    if (!newAsset.name) return showToast('Name is required', 'error');
    try {
      await createAsset(newAsset);
      showToast('Asset added successfully', 'success');
      setAddAssetOpen(false);
      setNewAsset({ name: '', type: 'Laptop' });
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to add asset', 'error');
    }
  };

  const visibleAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         asset.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-600' :
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-600' :
          'bg-blue-500/10 border-blue-500/30 text-blue-600'
        }`}>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets Management</h1>
          <p className="text-muted-foreground">Inventory of all company technological assets.</p>
        </div>
        <Button className="gap-2" onClick={() => setAddAssetOpen(true)}>
          <Plus className="w-4 h-4" /> Add Asset
        </Button>
      </header>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search assets..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl self-stretch border">
          {['all', 'assigned', 'available', 'maintenance'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'secondary' : 'ghost'}
              size="sm"
              className="capitalize text-xs h-8 px-4"
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset ID</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                    No assets found.
                  </TableCell>
                </TableRow>
              ) : (
                visibleAssets.map((asset) => {
                  const AssetIcon = getAssetIcon(asset.type);
                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-mono text-xs">{asset.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                            <AssetIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{asset.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{asset.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-[8px]">{asset.assignee_initials || '?'}</AvatarFallback>
                          </Avatar>
                          {asset.assignee_name || 'Unassigned'}
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
                            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAction('View History', asset.id)}>View History</DropdownMenuItem>
                            {user?.role === 'admin' && (
                              <>
                                <DropdownMenuItem onClick={() => handleAction('Revoke', asset.id)}>Revoke Status</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleAction('Delete', asset.id)}>Delete</DropdownMenuItem>
                              </>
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
      </Card>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activity: {selectedAssetForHistory}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {assetHistory.map((log) => (
              <div key={log.id} className="flex flex-col gap-1 border-b pb-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold">{log.action}</span>
                  <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-sm">{log.notes}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Are you sure?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Deleting asset {assetToDelete} is permanent.</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleAction('Confirm Delete', assetToDelete!)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Asset Dialog */}
      <Dialog open={addAssetOpen} onOpenChange={setAddAssetOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Asset</DialogTitle></DialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="MacBook Pro" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})}>
                <option value="Laptop">Laptop</option>
                <option value="Monitor">Monitor</option>
                <option value="Keyboard">Keyboard</option>
                <option value="Tablet">Tablet</option>
                <option value="Printer">Printer</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setAddAssetOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAsset}>Add Asset</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
