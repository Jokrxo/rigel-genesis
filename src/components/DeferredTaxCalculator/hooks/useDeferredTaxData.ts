import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeferredTaxProject, DeferredTaxCategory, TaxLossCarryForward, Country } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useDeferredTaxData = () => {
  const [projects, setProjects] = useState<DeferredTaxProject[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCountries = useCallback(async () => {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching countries:', error);
      toast({
        title: "Error",
        description: "Failed to load countries",
        variant: "destructive",
      });
      return;
    }

    setCountries(data || []);
  }, [toast]);

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('deferred_tax_projects')
      .select(`
        *,
        country:countries(*)
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
      return;
    }

    setProjects((data || []) as DeferredTaxProject[]);
  }, [toast]);

  const createProject = async (projectData: Omit<DeferredTaxProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to create a project",
        variant: "destructive",
      });
      return null;
    }

    const { data, error } = await supabase
      .from('deferred_tax_projects')
      .insert({
        ...projectData,
        user_id: user.id,
      })
      .select(`
        *,
        country:countries(*)
      `)
      .single();

    if (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Success",
      description: "Project created successfully",
    });

    await fetchProjects();
    return data as DeferredTaxProject;
  };

  const updateProject = async (id: string, updates: Partial<DeferredTaxProject>) => {
    const { error } = await supabase
      .from('deferred_tax_projects')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Project updated successfully",
    });

    await fetchProjects();
    return true;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('deferred_tax_projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Project deleted successfully",
    });

    await fetchProjects();
    return true;
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchCountries(), fetchProjects()]);
      setLoading(false);
    };

    initializeData();
  }, [fetchCountries, fetchProjects]);

  return {
    projects,
    countries,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects,
  };
};