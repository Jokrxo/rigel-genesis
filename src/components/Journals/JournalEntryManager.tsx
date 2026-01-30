import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Trash2, Edit, CheckCircle, AlertTriangle, XCircle, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { journalApi, JournalEntry, JournalLine } from "@/lib/journal-api";
import { format } from "date-fns";

export const JournalEntryManager = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"standard" | "adjustment">("standard");

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await journalApi.getEntries();
      setEntries(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load entries", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEntryRef, setNewEntryRef] = useState("");
  const [newEntryDesc, setNewEntryDesc] = useState("");
  const [newEntryType, setNewEntryType] = useState<"standard" | "adjustment">("standard");
  const [newEntryLines, setNewEntryLines] = useState<JournalLine[]>([
    { id: "1", accountId: "", description: "", debit: 0, credit: 0 },
    { id: "2", accountId: "", description: "", debit: 0, credit: 0 }
  ]);

  const resetForm = () => {
    setEditingId(null);
    setNewEntryDate(new Date().toISOString().split('T')[0]);
    setNewEntryRef("");
    setNewEntryDesc("");
    setNewEntryType(activeTab);
    setNewEntryLines([
      { id: "1", accountId: "", description: "", debit: 0, credit: 0 },
      { id: "2", accountId: "", description: "", debit: 0, credit: 0 }
    ]);
  };

  const handleAddLine = () => {
    setNewEntryLines([...newEntryLines, { 
      id: Date.now().toString(), 
      accountId: "", 
      description: "", 
      debit: 0, 
      credit: 0 
    }]);
  };

  const updateLine = (id: string, field: keyof JournalLine, value: string | number) => {
    setNewEntryLines(lines => lines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const removeLine = (id: string) => {
    if (newEntryLines.length <= 2) return;
    setNewEntryLines(lines => lines.filter(line => line.id !== id));
  };

  const totalDebits = newEntryLines.reduce((sum, line) => sum + Number(line.debit), 0);
  const totalCredits = newEntryLines.reduce((sum, line) => sum + Number(line.credit), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setNewEntryDate(entry.date);
    setNewEntryRef(entry.reference);
    setNewEntryDesc(entry.description);
    setNewEntryType(entry.type || 'standard');
    setNewEntryLines(JSON.parse(JSON.stringify(entry.lines))); // Deep copy
    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    if (!newEntryRef || !newEntryDesc) {
      toast({ title: "Error", description: "Please fill in all header fields", variant: "destructive" });
      return;
    }
    // Drafts don't strictly need to be balanced, but it's good practice. 
    // However, for posting it IS required. Let's allow unbalanced drafts but warn?
    // For now, let's keep the balance requirement for simplicity, or relax it for drafts?
    // Implementation choice: Allow unbalanced drafts.
    
    if (totalDebits === 0 && totalCredits === 0) {
       toast({ title: "Error", description: "Journal entry cannot be empty", variant: "destructive" });
       return;
    }

    try {
      const entryData = {
        date: newEntryDate,
        reference: newEntryRef,
        description: newEntryDesc,
        type: newEntryType,
        lines: newEntryLines
      };

      if (editingId) {
        await journalApi.updateEntry(editingId, entryData);
        toast({ title: "Success", description: "Journal entry updated" });
      } else {
        await journalApi.createEntry(entryData);
        toast({ title: "Success", description: "Journal entry created as draft" });
      }

      await loadEntries();
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save entry";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await journalApi.deleteEntry(id);
      toast({ title: "Success", description: "Entry deleted" });
      loadEntries();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete entry", variant: "destructive" });
    }
  };

  const handlePost = async (id: string) => {
    if (!confirm("Are you sure you want to POST this entry? This action cannot be undone.")) return;
    try {
      await journalApi.postEntry(id);
      toast({ title: "Success", description: "Entry posted successfully" });
      loadEntries();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to post entry", variant: "destructive" });
    }
  };

  const handleApprove = async (id: string) => {
     try {
      await journalApi.updateEntry(id, { approvalStatus: 'approved' });
      toast({ title: "Success", description: "Entry approved" });
      loadEntries();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to approve entry", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
     try {
      await journalApi.updateEntry(id, { approvalStatus: 'rejected' });
      toast({ title: "Success", description: "Entry rejected" });
      loadEntries();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to reject entry", variant: "destructive" });
    }
  };

  const handleView = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsViewOpen(true);
  };

  const filteredEntries = entries.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.reference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = (e.type || 'standard') === activeTab;
      return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="standard" className="w-full" onValueChange={(v) => setActiveTab(v as 'standard' | 'adjustment')}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="standard">Standard Operations</TabsTrigger>
            <TabsTrigger value="adjustment">Year-End Adjustments</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search journals..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> New Entry</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Journal Entry" : "Create Journal Entry"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={newEntryDate} onChange={(e) => setNewEntryDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Reference</Label>
                      <Input placeholder="e.g. JE-2024-002" value={newEntryRef} onChange={(e) => setNewEntryRef(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <Label>Type</Label>
                       <Select value={newEntryType} onValueChange={(v: "standard" | "adjustment") => setNewEntryType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="adjustment">Adjustment</SelectItem>
                        </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input placeholder="Description" value={newEntryDesc} onChange={(e) => setNewEntryDesc(e.target.value)} />
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Account</TableHead>
                          <TableHead>Description (Line)</TableHead>
                          <TableHead className="w-[120px] text-right">Debit</TableHead>
                          <TableHead className="w-[120px] text-right">Credit</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newEntryLines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>
                              <Select 
                                value={line.accountId} 
                                onValueChange={(val) => updateLine(line.id, 'accountId', val)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Account" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1000">1000 - Cash</SelectItem>
                                  <SelectItem value="1100">1100 - Accounts Receivable</SelectItem>
                                  <SelectItem value="1500">1500 - Accumulated Depreciation</SelectItem>
                                  <SelectItem value="2000">2000 - Accounts Payable</SelectItem>
                                  <SelectItem value="3000">3000 - Share Capital</SelectItem>
                                  <SelectItem value="4000">4000 - Sales Revenue</SelectItem>
                                  <SelectItem value="5000">5000 - Cost of Goods Sold</SelectItem>
                                  <SelectItem value="6000">6000 - Operating Expenses</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={line.description} 
                                onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                                placeholder="Line description"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                value={line.debit} 
                                onChange={(e) => updateLine(line.id, 'debit', Number(e.target.value))}
                                className="text-right"
                                disabled={line.credit > 0}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                value={line.credit} 
                                onChange={(e) => updateLine(line.id, 'credit', Number(e.target.value))}
                                className="text-right"
                                disabled={line.debit > 0}
                              />
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => removeLine(line.id)} disabled={newEntryLines.length <= 2}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4 flex justify-between items-center">
                      <Button variant="outline" size="sm" onClick={handleAddLine}><Plus className="mr-2 h-4 w-4" /> Add Line</Button>
                      <div className="flex gap-4 text-sm font-medium">
                        <span className="text-muted-foreground">
                          Total Debits: {totalDebits.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">
                          Total Credits: {totalCredits.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                            {isBalanced ? (
                                <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" /> Balanced
                                </span>
                            ) : (
                                <span className="text-red-600 flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4" /> Unbalanced ({Math.abs(totalDebits - totalCredits).toFixed(2)})
                                </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave}>
                        {editingId ? "Update Entry" : "Save as Draft"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.date), "dd MMM yyyy")}</TableCell>
                  <TableCell className="font-mono">{entry.reference}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={entry.type === 'adjustment' ? 'outline' : 'outline'} 
                      className={entry.type === 'adjustment' ? 'border-amber-500 text-amber-600 bg-amber-50' : ''}
                    >
                      {entry.type === 'adjustment' ? 'Year-End Adj' : 'Standard'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'}>
                      {entry.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {entry.approvalStatus && (
                         <Badge variant={entry.approvalStatus === 'approved' ? 'default' : entry.approvalStatus === 'rejected' ? 'destructive' : 'outline'}>
                            {entry.approvalStatus.toUpperCase()}
                         </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.lines.reduce((sum, l) => sum + Number(l.debit), 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleView(entry)} title="View">
                            <Eye className="h-4 w-4" />
                        </Button>
                        
                        {/* Approval Flow */}
                        {entry.approvalStatus === 'pending' && entry.status === 'draft' && (
                           <>
                             <Button variant="ghost" size="icon" onClick={() => handleApprove(entry.id)} title="Approve">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                             </Button>
                             <Button variant="ghost" size="icon" onClick={() => handleReject(entry.id)} title="Reject">
                                <XCircle className="h-4 w-4 text-red-600" />
                             </Button>
                           </>
                        )}

                        {entry.status === 'draft' && (
                            <>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} title="Edit">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                {entry.approvalStatus === 'approved' && (
                                    <Button variant="ghost" size="icon" onClick={() => handlePost(entry.id)} title="Post">
                                        <FileText className="h-4 w-4 text-green-600" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} title="Delete">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEntries.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No {activeTab} entries found. Create one to get started.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Journal Entry Details</DialogTitle>
            </DialogHeader>
            {selectedEntry && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded-lg bg-muted/20">
                        <div>
                            <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wide">Reference</span>
                            <span className="font-mono text-base">{selectedEntry.reference}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wide">Date</span>
                            <span className="text-base">{format(new Date(selectedEntry.date), "PPP")}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wide">Description</span>
                            <span className="text-base">{selectedEntry.description}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wide">Type</span>
                            <Badge variant="outline">{selectedEntry.type || 'Standard'}</Badge>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wide">Status</span> 
                            <Badge variant={selectedEntry.status === 'posted' ? 'default' : 'secondary'}>
                                {selectedEntry.status.toUpperCase()}
                            </Badge>
                        </div>
                         {selectedEntry.approvalStatus && (
                             <div>
                                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wide">Approval</span> 
                                <Badge variant={selectedEntry.approvalStatus === 'approved' ? 'default' : selectedEntry.approvalStatus === 'rejected' ? 'destructive' : 'outline'}>
                                    {selectedEntry.approvalStatus.toUpperCase()}
                                </Badge>
                             </div>
                         )}
                         {/* Audit Trail Info */}
                         <div className="col-span-2 grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                            <div>
                                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wide">Created At</span>
                                <span className="text-xs text-muted-foreground">{selectedEntry.created_at ? format(new Date(selectedEntry.created_at), "PPP p") : 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wide">Last Updated</span>
                                <span className="text-xs text-muted-foreground">{selectedEntry.updated_at ? format(new Date(selectedEntry.updated_at), "PPP p") : 'N/A'}</span>
                            </div>
                         </div>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedEntry.lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell className="font-mono">{line.accountId}</TableCell>
                                    <TableCell>{line.description}</TableCell>
                                    <TableCell className="text-right">{line.debit > 0 ? Number(line.debit).toFixed(2) : '-'}</TableCell>
                                    <TableCell className="text-right">{line.credit > 0 ? Number(line.credit).toFixed(2) : '-'}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="font-bold bg-muted/50">
                                <TableCell colSpan={2} className="text-right">Totals</TableCell>
                                <TableCell className="text-right border-t-2 border-foreground">
                                    {selectedEntry.lines.reduce((sum, l) => sum + Number(l.debit), 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right border-t-2 border-foreground">
                                    {selectedEntry.lines.reduce((sum, l) => sum + Number(l.credit), 0).toFixed(2)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
