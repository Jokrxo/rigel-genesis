
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  grossSalary: number;
  taxNumber: string;
  bankAccount: string;
  status: string;
}

interface ViewEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const ViewEmployeeDialog = ({
  open,
  onClose,
  employee,
}: ViewEmployeeDialogProps) => {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>
            Viewing details for {employee.firstName} {employee.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Employee #</Label>
                  <div className="col-span-2 font-mono">{employee.employeeNumber}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Name</Label>
                  <div className="col-span-2 font-medium">
                    {employee.firstName} {employee.lastName}
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="col-span-2">{employee.email}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Phone</Label>
                  <div className="col-span-2">{employee.phone}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Employment Details</h3>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Position</Label>
                  <div className="col-span-2">{employee.position}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Department</Label>
                  <div className="col-span-2">{employee.department}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Hire Date</Label>
                  <div className="col-span-2">{employee.hireDate}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="col-span-2">
                    <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                      {employee.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Financial Information</h3>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Gross Salary</Label>
                <div className="col-span-2">
                  R{employee.grossSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Tax Number</Label>
                <div className="col-span-2">{employee.taxNumber}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Bank Account</Label>
                <div className="col-span-2 font-mono">{employee.bankAccount}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
