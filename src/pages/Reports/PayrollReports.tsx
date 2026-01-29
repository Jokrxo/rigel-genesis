import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Printer } from "lucide-react";

export default function PayrollReports() {
  const reports = [
    { id: 1, name: "Monthly Payroll Summary", date: "2024-03-31", type: "Summary", status: "Generated" },
    { id: 2, name: "PAYE Declaration (EMP201)", date: "2024-03-31", type: "Tax", status: "Submitted" },
    { id: 3, name: "UIF Declaration", date: "2024-03-31", type: "Compliance", status: "Submitted" },
    { id: 4, name: "Employee Payslips Batch", date: "2024-03-25", type: "Distribution", status: "Sent" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payroll Reports</h1>
                <p className="text-muted-foreground">Access and manage all payroll-related documentation and tax filings.</p>
            </div>
            <Button>
                <FileText className="mr-2 h-4 w-4" /> Generate New Report
            </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Payroll Cost (YTD)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R 450,230.00</div>
                    <p className="text-xs text-muted-foreground">+12% from last year</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">PAYE Liability</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R 85,400.00</div>
                    <p className="text-xs text-muted-foreground">Due by 7th of next month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Full-time</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Report Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.name}</TableCell>
                                <TableCell>{report.date}</TableCell>
                                <TableCell>{report.type}</TableCell>
                                <TableCell>{report.status}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="icon" variant="ghost">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost">
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
