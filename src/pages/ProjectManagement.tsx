
import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, Plus, BarChart } from "lucide-react";
import { Chatbot } from "@/components/Shared/Chatbot";
import { ProjectActions } from "@/components/ProjectManagement/ProjectActions";
import { ProjectsList } from "@/components/ProjectManagement/ProjectsList";
import { SimpleProjectForm } from "@/components/ProjectManagement/SimpleProjectForm";
import { EnhancedProjectForm } from "@/components/ProjectManagement/EnhancedProjectForm";
import { ProjectGanttChart } from "@/components/ProjectManagement/ProjectGanttChart";
import { TaskManagement } from "@/components/ProjectManagement/TaskManagement";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { auditLogger } from "@/lib/audit-logger";
import { PermissionGuard } from "@/components/Shared/PermissionGuard";

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProjects: Project[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        client: p.client || '',
        startDate: p.start_date,
        endDate: p.end_date,
        budget: Number(p.budget || 0),
        spent: Number(p.spent || 0),
        status: p.status as Project['status'],
        manager: p.manager || '',
      }));

      setProjects(mappedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects;

  const handleCreateProject = async (projectData: Omit<Project, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) throw new Error('Company not found');

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          company_id: profile.company_id,
          name: projectData.name,
          description: projectData.description,
          client: projectData.client,
          start_date: projectData.startDate,
          end_date: projectData.endDate,
          budget: projectData.budget,
          spent: projectData.spent,
          status: projectData.status,
          manager: projectData.manager,
        }])
        .select()
        .single();

      if (error) throw error;

      await auditLogger.log({
        action: 'CREATE_PROJECT',
        entityType: 'project',
        entityId: data.id,
        details: { name: data.name, budget: data.budget }
      });

      toast({
        title: "Success",
        description: "Project created successfully",
      });
      fetchProjects();
      setShowProjectForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setUseEnhancedForm(true);
    setShowProjectForm(true);
  };

  const handleUpdateProject = async (projectData: Omit<Project, 'id'>) => {
    if (!editingProject) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: projectData.name,
          description: projectData.description,
          client: projectData.client,
          start_date: projectData.startDate,
          end_date: projectData.endDate,
          budget: projectData.budget,
          spent: projectData.spent,
          status: projectData.status,
          manager: projectData.manager,
        })
        .eq('id', editingProject.id);

      if (error) throw error;

      await auditLogger.log({
        action: 'UPDATE_PROJECT',
        entityType: 'project',
        entityId: editingProject.id,
        details: { updates: projectData }
      });

      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      fetchProjects();
      setEditingProject(null);
      setShowProjectForm(false);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      await auditLogger.log({
        action: 'DELETE_PROJECT',
        entityType: 'project',
        entityId: projectId,
        details: {}
      });

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
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
            <PermissionGuard action="create" resource="projects">
              <Button variant="outline" onClick={handleCreateAdvanced}>
                <Plus className="mr-2 h-4 w-4" />
                Advanced Project
              </Button>
            </PermissionGuard>
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
