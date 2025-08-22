
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Plus, DollarSign, Printer, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { printTable, exportToCSV, exportToJSON } from "@/utils/printExportUtils";
import { Chatbot } from "@/components/Shared/Chatbot";

interface Investment {
  id: string;
  investmentNumber: string;
  name: string;
  type: string;
  provider: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  units: number;
  status: string;
}

interface InvestmentTransaction {
  id: string;
  investmentId: string;
  date: string;
  type: string;
  units: number;
  pricePerUnit: number;
  totalAmount: number;
  fees: number;
  description: string;
}

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>([]);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<string>("");
  const [investmentForm, setInvestmentForm] = useState({
    name: "",
    type: "",
    provider: "",
    purchaseDate: "",
    purchasePrice: "",
    units: "",
  });
  const [transactionForm, setTransactionForm] = useState({
    investmentId: "",
    date: "",
    type: "",
    units: "",
    pricePerUnit: "",
    fees: "",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInvestments();
    fetchTransactions();
  }, []);

  const fetchInvestments = () => {
    // TODO: Replace with actual API call
    setInvestments([]);
  };

  const fetchTransactions = () => {
    // TODO: Replace with actual API call
    setTransactions([]);
  };

  const handleInvestmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvestment: Investment = {
      id: Date.now().toString(),
      investmentNumber: `INV-${String(investments.length + 1).padStart(3, '0')}`,
      name: investmentForm.name,
      type: investmentForm.type,
      provider: investmentForm.provider,
      purchaseDate: investmentForm.purchaseDate,
      purchasePrice: parseFloat(investmentForm.purchasePrice),
      currentValue: parseFloat(investmentForm.purchasePrice),
      units: parseFloat(investmentForm.units),
      status: "active",
    };
    
    setInvestments([...investments, newInvestment]);
    setInvestmentForm({
      name: "",
      type: "",
      provider: "",
      purchaseDate: "",
      purchasePrice: "",
      units: "",
    });
    setShowInvestmentForm(false);
    
    toast({
      title: "Success",
      description: "Investment added successfully",
    });
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: InvestmentTransaction = {
      id: Date.now().toString(),
      investmentId: transactionForm.investmentId,
      date: transactionForm.date,
      type: transactionForm.type,
      units: parseFloat(transactionForm.units),
      pricePerUnit: parseFloat(transactionForm.pricePerUnit),
      totalAmount: parseFloat(transactionForm.units) * parseFloat(transactionForm.pricePerUnit),
      fees: parseFloat(transactionForm.fees) || 0,
      description: transactionForm.description,
    };
    
    setTransactions([...transactions, newTransaction]);
    setTransactionForm({
      investmentId: "",
      date: "",
      type: "",
      units: "",
      pricePerUnit: "",
      fees: "",
      description: "",
    });
    setShowTransactionForm(false);
    
    toast({
      title: "Success",
      description: "Transaction added successfully",
    });
  };

  const getFilteredTransactions = () => {
    if (!selectedInvestment) return transactions;
    return transactions.filter(t => t.investmentId === selectedInvestment);
  };

  const getTotalPortfolioValue = () => {
    return investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  };

  const getTotalGainLoss = () => {
    return investments.reduce((sum, inv) => sum + (inv.currentValue - inv.purchasePrice), 0);
  };

  const handlePrint = () => {
    printTable('investments-table', 'Investment Register');
  };

  const handleExportCSV = () => {
    const headers = ['Investment #', 'Name', 'Type', 'Provider', 'Purchase Price', 'Current Value', 'Gain/Loss'];
    exportToCSV(investments, 'investments_register', headers);
  };

  const handleExportJSON = () => {
    exportToJSON(investments, 'investments_register');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Investment Management</h1>
            <p className="text-muted-foreground">Track investments, transactions, and portfolio performance</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{getTotalPortfolioValue().toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTotalGainLoss() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R{getTotalGainLoss().toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investments.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="register" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="register">Investment Register</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowInvestmentForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Investment
              </Button>
            </div>

            {showInvestmentForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInvestmentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Investment Name</Label>
                      <Input
                        id="name"
                        value={investmentForm.name}
                        onChange={(e) => setInvestmentForm({...investmentForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select onValueChange={(value) => setInvestmentForm({...investmentForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ETF">ETF</SelectItem>
                          <SelectItem value="Unit Trust">Unit Trust</SelectItem>
                          <SelectItem value="Shares">Shares</SelectItem>
                          <SelectItem value="Bonds">Bonds</SelectItem>
                          <SelectItem value="Property">Property</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provider">Provider</Label>
                      <Input
                        id="provider"
                        value={investmentForm.provider}
                        onChange={(e) => setInvestmentForm({...investmentForm, provider: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchaseDate">Purchase Date</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={investmentForm.purchaseDate}
                        onChange={(e) => setInvestmentForm({...investmentForm, purchaseDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchasePrice">Purchase Price (R)</Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        step="0.01"
                        value={investmentForm.purchasePrice}
                        onChange={(e) => setInvestmentForm({...investmentForm, purchasePrice: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="units">Units</Label>
                      <Input
                        id="units"
                        type="number"
                        step="0.01"
                        value={investmentForm.units}
                        onChange={(e) => setInvestmentForm({...investmentForm, units: e.target.value})}
                        required
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Button type="submit">Add Investment</Button>
                      <Button type="button" variant="outline" onClick={() => setShowInvestmentForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Investment Register</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table id="investments-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Investment #</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Purchase Price</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Gain/Loss</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {investments.map((investment) => {
                        const gainLoss = investment.currentValue - investment.purchasePrice;
                        const gainLossPercentage = ((gainLoss / investment.purchasePrice) * 100).toFixed(2);
                        return (
                          <TableRow key={investment.id}>
                            <TableCell className="font-mono">{investment.investmentNumber}</TableCell>
                            <TableCell className="font-medium">{investment.name}</TableCell>
                            <TableCell>{investment.type}</TableCell>
                            <TableCell>{investment.provider}</TableCell>
                            <TableCell>R{investment.purchasePrice.toLocaleString()}</TableCell>
                            <TableCell>R{investment.currentValue.toLocaleString()}</TableCell>
                            <TableCell>{investment.units.toLocaleString()}</TableCell>
                            <TableCell className={gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                              R{gainLoss.toLocaleString()} ({gainLossPercentage}%)
                            </TableCell>
                            <TableCell>
                              <Badge variant={investment.status === "active" ? "default" : "secondary"}>
                                {investment.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex justify-between items-center">
              <Select value={selectedInvestment} onValueChange={setSelectedInvestment}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by investment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Investments</SelectItem>
                  {investments.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowTransactionForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </div>

            {showTransactionForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTransactionSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="investmentId">Investment</Label>
                      <Select onValueChange={(value) => setTransactionForm({...transactionForm, investmentId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select investment" />
                        </SelectTrigger>
                        <SelectContent>
                          {investments.map((inv) => (
                            <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transactionType">Transaction Type</Label>
                      <Select onValueChange={(value) => setTransactionForm({...transactionForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Buy</SelectItem>
                          <SelectItem value="sell">Sell</SelectItem>
                          <SelectItem value="dividend">Dividend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transactionDate">Date</Label>
                      <Input
                        id="transactionDate"
                        type="date"
                        value={transactionForm.date}
                        onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transactionUnits">Units</Label>
                      <Input
                        id="transactionUnits"
                        type="number"
                        step="0.01"
                        value={transactionForm.units}
                        onChange={(e) => setTransactionForm({...transactionForm, units: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerUnit">Price per Unit (R)</Label>
                      <Input
                        id="pricePerUnit"
                        type="number"
                        step="0.01"
                        value={transactionForm.pricePerUnit}
                        onChange={(e) => setTransactionForm({...transactionForm, pricePerUnit: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fees">Fees (R)</Label>
                      <Input
                        id="fees"
                        type="number"
                        step="0.01"
                        value={transactionForm.fees}
                        onChange={(e) => setTransactionForm({...transactionForm, fees: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Button type="submit">Add Transaction</Button>
                      <Button type="button" variant="outline" onClick={() => setShowTransactionForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Investment Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Investment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Price/Unit</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Fees</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredTransactions().map((transaction) => {
                        const investment = investments.find(inv => inv.id === transaction.investmentId);
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>{investment?.name || 'Unknown'}</TableCell>
                            <TableCell>
                              <Badge variant={
                                transaction.type === 'buy' ? 'default' : 
                                transaction.type === 'sell' ? 'destructive' : 'secondary'
                              }>
                                {transaction.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.units.toLocaleString()}</TableCell>
                            <TableCell>R{transaction.pricePerUnit.toFixed(2)}</TableCell>
                            <TableCell>R{transaction.totalAmount.toLocaleString()}</TableCell>
                            <TableCell>R{transaction.fees.toFixed(2)}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Summary Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Portfolio Breakdown by Type</h4>
                    {['ETF', 'Unit Trust', 'Shares', 'Bonds', 'Property'].map(type => {
                      const typeInvestments = investments.filter(inv => inv.type === type);
                      const typeValue = typeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
                      const percentage = ((typeValue / getTotalPortfolioValue()) * 100).toFixed(1);
                      return typeInvestments.length > 0 ? (
                        <div key={type} className="flex justify-between py-1">
                          <span>{type}:</span>
                          <span>R{typeValue.toLocaleString()} ({percentage}%)</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Top Performers</h4>
                    {investments
                      .sort((a, b) => (b.currentValue - b.purchasePrice) - (a.currentValue - a.purchasePrice))
                      .slice(0, 3)
                      .map(inv => {
                        const gain = inv.currentValue - inv.purchasePrice;
                        const percentage = ((gain / inv.purchasePrice) * 100).toFixed(1);
                        return (
                          <div key={inv.id} className="flex justify-between py-1">
                            <span>{inv.name}:</span>
                            <span className="text-green-600">+{percentage}%</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default Investments;
