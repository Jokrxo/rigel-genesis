
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSelector } from '../DeferredTaxCalculator/components/ProjectSelector';
import { ProjectForm } from '../DeferredTaxCalculator/components/ProjectForm';
import { DeferredTaxDashboard } from '../DeferredTaxCalculator/components/DeferredTaxDashboard';
import { useDeferredTaxData } from '../DeferredTaxCalculator/hooks/useDeferredTaxData';
import { DeferredTaxProject } from '../DeferredTaxCalculator/types';

type ViewMode = 'list' | 'create' | 'dashboard';

const DeferredTaxCalculator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProject, setSelectedProject] = useState<DeferredTaxProject | null>(null);
  
  const {
    projects,
    countries,
    loading,
    createProject,
    updateProject,
    deleteProject,
  } = useDeferredTaxData();

  // Handle deep linking to specific project
  const projectIdParam = searchParams.get('projectId');

  useEffect(() => {
    if (projectIdParam && projects.length > 0 && !selectedProject) {
      const found = projects.find(p => p.id === projectIdParam);
      if (found) {
        setSelectedProject(found);
        setViewMode('dashboard');
      }
    } else if (!projectIdParam && viewMode === 'dashboard') {
      // If URL param is removed but we are in dashboard, go back to list
      setSelectedProject(null);
      setViewMode('list');
    }
  }, [projectIdParam, projects, selectedProject, viewMode]);

  const handleCreateProject = async (projectData: Omit<DeferredTaxProject, 'id' | 'created_at' | 'updated_at'>) => {
    const project = await createProject(projectData);
    if (project) {
      setSelectedProject(project as DeferredTaxProject);
      setViewMode('dashboard');
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set("projectId", project.id);
        return newParams;
      });
    }
  };

  const handleSelectProject = (project: DeferredTaxProject) => {
    setSelectedProject(project);
    setViewMode('dashboard');
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set("projectId", project.id);
      return newParams;
    });
  };

  const handleBack = () => {
    setSelectedProject(null);
    setViewMode('list');
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("projectId");
      return newParams;
    });
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <ProjectForm
            countries={countries}
            onSubmit={handleCreateProject}
            onCancel={() => setViewMode('list')}
          />
        );
      
      case 'dashboard':
        return selectedProject ? (
          <DeferredTaxDashboard
            project={selectedProject}
            onBack={handleBack}
          />
        ) : null;
      
      default:
        return (
          <ProjectSelector
            projects={projects}
            onSelectProject={handleSelectProject}
            onCreateProject={() => setViewMode('create')}
            loading={loading}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {viewMode === 'list' && (
        <div>
          <h1 className="text-3xl font-bold mb-2">Deferred Tax Calculator</h1>
          <p className="text-muted-foreground">
            Comprehensive deferred tax calculation and reporting system with multi-country support
          </p>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default DeferredTaxCalculator;
