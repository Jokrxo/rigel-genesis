import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PermissionGuard } from "@/components/Shared/PermissionGuard";
import { useCustomers, useCustomerAging, useSalesDocuments, useReceipts } from "@/hooks/useSalesData";
import { CustomerStatement } from "@/components/Sales/CustomerStatement";
import { 
  ArrowLeft, 
  FileText, 
  Receipt, 
  CreditCard, 
  FilePlus,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  DollarSign
} from "lucide-react";
import { PAYMENT_TERMS_LABELS } from "@/types/sales";

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomerById, loading } = useCustomers();
  const aging = useCustomerAging(id || '');
  const { documents: invoices } = useSalesDocuments('invoice');
  const { documents: quotations } = useSalesDocuments('quotation');
  const { receipts } = useReceipts();

  const customer = id ? getCustomerById(id) : undefined;

  const customerInvoices = invoices.filter(inv => inv.customer_id === id);
  const customerQuotations = quotations.filter(q => q.customer_id === id);
  const customerReceipts = receipts.filter(r => r.customer_id === id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const totalOutstanding = aging.current + aging.days_30 + aging.days_60 + aging.days_90_plus;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading customer...</div>
        </div>
      </MainLayout>
    );
  }

  if (!customer) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <h2 className="text-xl font-semibold">Customer not found</h2>
          <Button variant="outline" onClick={() => navigate('/sales/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/sales/customers')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{customer.name}</h1>
                <Badge variant={customer.is_active ? "default" : "secondary"}>
                  {customer.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-muted-foreground font-mono">{customer.customer_code}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <PermissionGuard action="create" resource="quotes">
              <Button variant="outline" onClick={() => navigate(`/sales/quotations?customer=${id}`)}>
                <FilePlus className="h-4 w-4 mr-2" />
                New Quotation
              </Button>
            </PermissionGuard>
            <PermissionGuard action="create" resource="invoices">
              <Button variant="outline" onClick={() => navigate(`/sales/invoices?customer=${id}`)}>
                <FileText className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </PermissionGuard>
            <PermissionGuard action="create" resource="receipts">
              <Button onClick={() => navigate(`/sales/receipts?customer=${id}`)}>
                <Receipt className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </PermissionGuard>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Statement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {customer && (
                  <CustomerStatement 
                    customerId={customer.id} 
                    customerName={customer.name}
                    customerCode={customer.customer_code}
                    address={`${customer.billing_address.street}, ${customer.billing_address.city}`}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Credit Limit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(customer.credit_limit)}</div>
              <p className="text-sm text-muted-foreground">
                Available: {formatCurrency(Math.max(0, customer.credit_limit - totalOutstanding))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerInvoices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Payment Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{PAYMENT_TERMS_LABELS[customer.payment_terms]}</div>
            </CardContent>
          </Card>
        </div>

        {/* Aging Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Aging Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground">Current</div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(aging.current)}</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground">30 Days</div>
                <div className="text-xl font-bold text-yellow-600">{formatCurrency(aging.days_30)}</div>
              </div>
              <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground">60 Days</div>
                <div className="text-xl font-bold text-orange-600">{formatCurrency(aging.days_60)}</div>
              </div>
              <div className="text-center p-4 bg-red-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground">90+ Days</div>
                <div className="text-xl font-bold text-red-600">{formatCurrency(aging.days_90_plus)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({customerInvoices.length})</TabsTrigger>
            <TabsTrigger value="quotations">Quotations ({customerQuotations.length})</TabsTrigger>
            <TabsTrigger value="payments">Payments ({customerReceipts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customer.contact_person && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.contact_person}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                      {customer.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${customer.phone}`} className="hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                  {customer.mobile && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.mobile} (Mobile)</span>
                    </div>
                  )}
                  {customer.tax_number && (
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>VAT: {customer.tax_number}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Billing Address</h4>
                    <div className="text-muted-foreground">
                      {customer.billing_address.street}<br />
                      {customer.billing_address.city}, {customer.billing_address.province}<br />
                      {customer.billing_address.postal_code}<br />
                      {customer.billing_address.country}
                    </div>
                  </div>
                  {!customer.shipping_same_as_billing && customer.shipping_address && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
                      <div className="text-muted-foreground">
                        {customer.shipping_address.street}<br />
                        {customer.shipping_address.city}, {customer.shipping_address.province}<br />
                        {customer.shipping_address.postal_code}<br />
                        {customer.shipping_address.country}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {customer.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardContent className="pt-6">
                {customerInvoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No invoices found for this customer
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerInvoices.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div>
                          <span className="font-mono">{inv.document_number}</span>
                          <span className="text-muted-foreground ml-4">{new Date(inv.document_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge>{inv.status}</Badge>
                          <span className="font-medium">{formatCurrency(inv.grand_total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotations">
            <Card>
              <CardContent className="pt-6">
                {customerQuotations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No quotations found for this customer
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerQuotations.map(q => (
                      <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div>
                          <span className="font-mono">{q.document_number}</span>
                          <span className="text-muted-foreground ml-4">{new Date(q.document_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge>{q.status}</Badge>
                          <span className="font-medium">{formatCurrency(q.grand_total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardContent className="pt-6">
                {customerReceipts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No payments found for this customer
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerReceipts.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div>
                          <span className="font-mono">{r.receipt_number}</span>
                          <span className="text-muted-foreground ml-4">{new Date(r.receipt_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{r.payment_method}</Badge>
                          <span className="font-medium">{formatCurrency(r.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CustomerDetail;