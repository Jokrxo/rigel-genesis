
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSelector } from '../DeferredTaxCalculator/components/ProjectSelector';
import { ProjectForm } from '../DeferredTaxCalculator/components/ProjectForm';
import { DeferredTaxDashboard } from '../DeferredTaxCalculator/components/DeferredTaxDashboard';
import { useDeferredTaxData } from '../DeferredTaxCalculator/hooks/useDeferredTaxData';
import { DeferredTaxProject } from '../DeferredTaxCalculator/types';

type ViewMode = 'list' | 'create' | 'dashboard';

const DeferredTaxCalculator = () => {
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

  const handleCreateProject = async (projectData: any) => {
    const project = await createProject(projectData);
    if (project) {
      setSelectedProject(project as DeferredTaxProject);
      setViewMode('dashboard');
    }
  };

  const handleSelectProject = (project: DeferredTaxProject) => {
    setSelectedProject(project);
    setViewMode('dashboard');
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
            onBack={() => {
              setSelectedProject(null);
              setViewMode('list');
            }}
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
