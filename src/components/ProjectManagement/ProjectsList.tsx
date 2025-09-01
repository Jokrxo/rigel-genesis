import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Search, Filter } from "lucide-react";
import { ProjectActions } from "./ProjectActions";

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

interface ProjectsListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onView?: (project: Project) => void;
  onCreateNew: () => void;
}

export const ProjectsList = ({ 
  projects, 
  onEdit, 
  onDelete, 
  onView, 
  onCreateNew 
}: ProjectsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [managerFilter, setManagerFilter] = useState<string>("all");

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesManager = managerFilter === "all" || project.manager === managerFilter;
    
    return matchesSearch && matchesStatus && matchesManager;
  });

  const getStatusVariant = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'planning': return 'outline';
      case 'on-hold': return 'destructive';
      default: return 'outline';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'text-success';
    if (progress < 70) return 'text-warning';
    if (progress < 90) return 'text-accent';
    return 'text-destructive';
  };

  const uniqueManagers = Array.from(new Set(projects.map(p => p.manager))).sort();

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Projects List</h2>
          <p className="text-sm text-muted-foreground">
            {filteredProjects.length} of {projects.length} projects
          </p>
        </div>
        <ProjectActions 
          projects={filteredProjects}
          onCreateNew={onCreateNew}
          type="bulk"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <Select value={managerFilter} onValueChange={setManagerFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Managers</SelectItem>
              {uniqueManagers.map(manager => (
                <SelectItem key={manager} value={manager}>{manager}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Projects ({filteredProjects.length})
          </CardTitle>
          <CardDescription>
            Manage your business projects and track their progress
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table id="projects-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || managerFilter !== "all" 
                        ? "No projects match your filters" 
                        : "No projects found. Create your first project!"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => {
                    const progress = Math.round((project.spent / project.budget) * 100);
                    const startDate = new Date(project.startDate);
                    const endDate = new Date(project.endDate);
                    const today = new Date();
                    const isOverdue = today > endDate && project.status !== 'completed';
                    
                    return (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {project.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{project.client}</TableCell>
                        <TableCell>{project.manager}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(project.status)}>
                            {project.status}
                          </Badge>
                          {isOverdue && (
                            <Badge variant="destructive" className="ml-1 text-xs">
                              Overdue
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{startDate.toLocaleDateString()}</div>
                            <div className="text-muted-foreground">
                              to {endDate.toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>R{project.budget.toLocaleString()}</div>
                            <div className="text-muted-foreground">
                              Spent: R{project.spent.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${getProgressColor(progress)}`}>
                              {progress}%
                            </span>
                            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  progress < 30 ? 'bg-success' :
                                  progress < 70 ? 'bg-warning' :
                                  progress < 90 ? 'bg-accent' : 'bg-destructive'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <ProjectActions 
                            project={project}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onView={onView}
                            type="single"
                          />
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
    </div>
  );
};