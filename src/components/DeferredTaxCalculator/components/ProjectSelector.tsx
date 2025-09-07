import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Globe } from "lucide-react";
import { DeferredTaxProject } from '../types';

interface ProjectSelectorProps {
  projects: DeferredTaxProject[];
  onSelectProject: (project: DeferredTaxProject) => void;
  onCreateProject: () => void;
  loading: boolean;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  onSelectProject,
  onCreateProject,
  loading,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'final': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Deferred Tax Projects</h2>
          <p className="text-muted-foreground">Select an existing project or create a new one</p>
        </div>
        <Button onClick={onCreateProject} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground mb-4">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects found</p>
              <p className="text-sm">Create your first deferred tax project to get started</p>
            </div>
            <Button onClick={onCreateProject} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Create First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader 
                className="pb-3"
                onClick={() => onSelectProject(project)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {project.country?.name || 'Unknown Country'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Tax Year {project.tax_year}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className={getStatusColor(project.status)}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                    {project.multi_entity && (
                      <Badge variant="outline">Multi-Entity</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-muted-foreground">
                  <p>Currency: {project.reporting_currency}</p>
                  <p>Last updated: {new Date(project.updated_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};