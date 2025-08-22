
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, Plus, Search, Edit, Trash2, Printer, Download, BarChart, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Chatbot } from "@/components/Shared/Chatbot";
import { ProjectActions } from "@/components/ProjectManagement/ProjectActions";
import { ProjectsList } from "@/components/ProjectManagement/ProjectsList";
import { SimpleProjectForm } from "@/components/ProjectManagement/SimpleProjectForm";
import { EnhancedProjectForm } from "@/components/ProjectManagement/EnhancedProjectForm";
import { ProjectGanttChart } from "@/components/ProjectManagement/ProjectGanttChart";
import { TaskManagement } from "@/components/ProjectManagement/TaskManagement";
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

const ProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [useEnhancedForm, setUseEnhancedForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setProjects([]);
  }, []);

  const filteredProjects = projects;

  const handleCreateProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      id: Date.now().toString(),
      ...projectData,
    };
    setProjects([...projects, newProject]);
    setShowProjectForm(false);
    setEditingProject(null);
    toast({
      title: "Success",
      description: "Project created successfully",
    });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setUseEnhancedForm(true);
    setShowProjectForm(true);
  };

  const handleUpdateProject = (projectData: Omit<Project, 'id'>) => {
    if (!editingProject) return;
    const updatedProject: Project = {
      ...editingProject,
      ...projectData,
    };
    setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
    setEditingProject(null);
    setShowProjectForm(false);
    toast({
      title: "Success",
      description: "Project updated successfully",
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    toast({
      title: "Success",
      description: "Project deleted successfully",
    });
  };

  const handleFormCancel = () => {
    setShowProjectForm(false);
    setEditingProject(null);
    setUseEnhancedForm(false);
  };

  const handleCreateNew = () => {
    setEditingProject(null);
    setUseEnhancedForm(false);
    setShowProjectForm(true);
  };

  const handleCreateAdvanced = () => {
    setEditingProject(null);
    setUseEnhancedForm(true);
    setShowProjectForm(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Project Management</h1>
            <p className="text-muted-foreground">Track and manage your business projects</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ProjectActions 
              projects={filteredProjects}
              onCreateNew={handleCreateNew}
              type="bulk"
            />
            <Button variant="outline" onClick={handleCreateAdvanced}>
              <Plus className="mr-2 h-4 w-4" />
              Advanced Project
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter(p => p.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R{projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R{projects.reduce((sum, p) => sum + p.spent, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            {showProjectForm && (
              <>
                {useEnhancedForm || editingProject ? (
                  <EnhancedProjectForm
                    onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
                    onCancel={handleFormCancel}
                    initialData={editingProject || undefined}
                  />
                ) : (
                  <SimpleProjectForm
                    onSubmit={handleCreateProject}
                    onCancel={handleFormCancel}
                  />
                )}
              </>
            )}

            <ProjectsList
              projects={filteredProjects}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onCreateNew={handleCreateNew}
            />
          </TabsContent>

          <TabsContent value="gantt" className="space-y-4">
            <ProjectGanttChart projects={filteredProjects} />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            {selectedProjectId ? (
              <TaskManagement 
                projectId={selectedProjectId}
                projectName={projects.find(p => p.id === selectedProjectId)?.name || 'Unknown Project'}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Task Management</CardTitle>
                  <CardDescription>Select a project to manage its tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {projects.map((project) => (
                        <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProjectId(project.id)}>
                          <CardHeader>
                            <CardTitle className="text-base">{project.name}</CardTitle>
                            <CardDescription>{project.client}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Badge variant={
                              project.status === 'active' ? 'default' :
                              project.status === 'completed' ? 'secondary' :
                              project.status === 'planning' ? 'outline' : 'destructive'
                            }>
                              {project.status}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {projects.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No projects available. Create a project first.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            {selectedProjectId && (
              <Button variant="outline" onClick={() => setSelectedProjectId(null)}>
                ← Back to Project Selection
              </Button>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Project Reports
                </CardTitle>
                <CardDescription>
                  Generate comprehensive project reports and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Project reporting features will be implemented here</p>
                  <p className="text-sm text-muted-foreground mt-2">Including budget analysis, time tracking, and performance metrics</p>
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

export default ProjectManagement;
