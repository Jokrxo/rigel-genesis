import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, Users, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  manager: string;
}

interface EnhancedProjectFormProps {
  onSubmit: (project: Omit<Project, 'id'>) => void;
  onCancel: () => void;
  initialData?: Project;
}

export const EnhancedProjectForm = ({ onSubmit, onCancel, initialData }: EnhancedProjectFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    client: initialData?.client || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    budget: initialData?.budget?.toString() || '',
    spent: initialData?.spent?.toString() || '0',
    status: initialData?.status || 'planning' as const,
    manager: initialData?.manager || '',
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    const budget = parseFloat(formData.budget);
    const spent = parseFloat(formData.spent);

    if (spent > budget) {
      toast({
        title: "Invalid Budget",
        description: "Amount spent cannot exceed budget",
        variant: "destructive",
      });
      return;
    }

    const project: Omit<Project, 'id'> = {
      name: formData.name,
      description: formData.description,
      client: formData.client,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget,
      spent,
      status: formData.status,
      manager: formData.manager,
    };

    onSubmit(project);
  };

  const calculateProgress = () => {
    const budget = parseFloat(formData.budget) || 0;
    const spent = parseFloat(formData.spent) || 0;
    return budget > 0 ? Math.round((spent / budget) * 100) : 0;
  };

  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRemainingBudget = () => {
    const budget = parseFloat(formData.budget) || 0;
    const spent = parseFloat(formData.spent) || 0;
    return budget - spent;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Project' : 'Create New Project'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Project Manager</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'planning' | 'active' | 'completed' | 'on-hold') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            {formData.startDate && formData.endDate && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Project Duration: <Badge variant="outline">{calculateDuration()} days</Badge>
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Budget & Finance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget & Finance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Total Budget (R)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spent">Amount Spent (R)</Label>
                <Input
                  id="spent"
                  type="number"
                  step="0.01"
                  value={formData.spent}
                  onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
                />
              </div>
            </div>
            {formData.budget && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Budget Progress:</span>
                  <Badge variant={calculateProgress() > 90 ? "destructive" : "outline"}>
                    {calculateProgress()}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Remaining Budget:</span>
                  <span className="font-medium">R{getRemainingBudget().toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit">{initialData ? 'Update Project' : 'Create Project'}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};