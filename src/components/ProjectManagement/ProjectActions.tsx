import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Calendar, 
  DollarSign, 
  Users,
  Printer,
  Download,
  Plus
} from "lucide-react";
import { printTable, exportToCSV, exportToJSON } from "@/utils/printExportUtils";

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

interface ProjectActionsProps {
  project?: Project;
  projects?: Project[];
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onView?: (project: Project) => void;
  onCreateNew?: () => void;
  type?: 'single' | 'bulk';
}

export const ProjectActions = ({ 
  project, 
  projects = [], 
  onEdit, 
  onDelete, 
  onView, 
  onCreateNew,
  type = 'single' 
}: ProjectActionsProps) => {
  
  const handlePrint = () => {
    printTable('projects-table', 'Projects List');
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Client', 'Status', 'Budget', 'Spent', 'Manager', 'Start Date', 'End Date'];
    exportToCSV(projects, 'projects', headers);
  };

  const handleExportJSON = () => {
    exportToJSON(projects, 'projects');
  };

  // Bulk actions for multiple projects
  if (type === 'bulk') {
    return (
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
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>
    );
  }

  // Single project actions
  if (!project) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {onView && (
          <DropdownMenuItem onClick={() => onView(project)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(project)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Project
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Calendar className="mr-2 h-4 w-4" />
          View Timeline
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Users className="mr-2 h-4 w-4" />
          Manage Tasks
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DollarSign className="mr-2 h-4 w-4" />
          Budget Report
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {onDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(project.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Project
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};