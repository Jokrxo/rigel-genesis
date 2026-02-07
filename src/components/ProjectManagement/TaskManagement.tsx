
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { auditLogger } from "@/lib/audit-logger";
import { PermissionGuard } from "@/components/Shared/PermissionGuard";

interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  assignee: string;
  startDate: string;
  endDate: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  actualHours: number;
}

interface TaskManagementProps {
  projectId: string;
  projectName: string;
}

export const TaskManagement = ({ projectId, projectName }: TaskManagementProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    assignee: '',
    startDate: '',
    endDate: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    estimatedHours: '',
  });
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedTasks: Task[] = (data || []).map(t => ({
        id: t.id,
        projectId: t.project_id,
        name: t.name,
        description: t.description || '',
        assignee: t.assignee || '',
        startDate: t.start_date,
        endDate: t.end_date,
        status: t.status as Task['status'],
        priority: t.priority as Task['priority'],
        estimatedHours: Number(t.estimated_hours || 0),
        actualHours: Number(t.actual_hours || 0),
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('project_tasks')
          .update({
            name: taskForm.name,
            description: taskForm.description,
            assignee: taskForm.assignee,
            start_date: taskForm.startDate,
            end_date: taskForm.endDate,
            status: taskForm.status,
            priority: taskForm.priority,
            estimated_hours: parseFloat(taskForm.estimatedHours) || 0,
          })
          .eq('id', editingTask.id);

        if (error) throw error;

        await auditLogger.log({
          action: 'UPDATE_TASK',
          entityType: 'project_task',
          entityId: editingTask.id,
          details: { updates: taskForm }
        });

        toast({ title: "Task updated successfully" });
      } else {
        const { data, error } = await supabase
          .from('project_tasks')
          .insert([{
            project_id: projectId,
            name: taskForm.name,
            description: taskForm.description,
            assignee: taskForm.assignee,
            start_date: taskForm.startDate,
            end_date: taskForm.endDate,
            status: taskForm.status,
            priority: taskForm.priority,
            estimated_hours: parseFloat(taskForm.estimatedHours) || 0,
            actual_hours: 0,
          }])
          .select()
          .single();

        if (error) throw error;

        await auditLogger.log({
          action: 'CREATE_TASK',
          entityType: 'project_task',
          entityId: data.id,
          details: { name: data.name, project_id: projectId }
        });

        toast({ title: "Task created successfully" });
      }

      fetchTasks();
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTaskForm({
      name: '',
      description: '',
      assignee: '',
      startDate: '',
      endDate: '',
      status: 'todo',
      priority: 'medium',
      estimatedHours: '',
    });
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      name: task.name,
      description: task.description,
      assignee: task.assignee,
      startDate: task.startDate,
      endDate: task.endDate,
      status: task.status,
      priority: task.priority,
      estimatedHours: task.estimatedHours.toString(),
    });
    setShowTaskForm(true);
  };

  const handleDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      await auditLogger.log({
        action: 'DELETE_TASK',
        entityType: 'project_task',
        entityId: taskId,
        details: {}
      });

      toast({ title: "Task deleted successfully" });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      await auditLogger.log({
        action: 'UPDATE_TASK_STATUS',
        entityType: 'project_task',
        entityId: taskId,
        details: { status: newStatus }
      });

      toast({ title: "Task status updated" });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'default';
      case 'in-progress': return 'default';
      case 'review': return 'secondary';
      case 'completed': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Tasks for {projectName}</h3>
          <p className="text-sm text-muted-foreground">{tasks.length} tasks</p>
        </div>
        <PermissionGuard action="create" resource="projects">
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </PermissionGuard>
      </div>

      {showTaskForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskName">Task Name</Label>
                  <Input
                    id="taskName"
                    value={taskForm.name}
                    onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Input
                    id="assignee"
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskStartDate">Start Date</Label>
                  <Input
                    id="taskStartDate"
                    type="date"
                    value={taskForm.startDate}
                    onChange={(e) => setTaskForm({ ...taskForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskEndDate">End Date</Label>
                  <Input
                    id="taskEndDate"
                    type="date"
                    value={taskForm.endDate}
                    onChange={(e) => setTaskForm({ ...taskForm, endDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskStatus">Status</Label>
                  <Select value={taskForm.status} onValueChange={(value: 'todo' | 'in-progress' | 'review' | 'completed') => setTaskForm({ ...taskForm, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskPriority">Priority</Label>
                  <Select value={taskForm.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setTaskForm({ ...taskForm, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    step="0.5"
                    value={taskForm.estimatedHours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskDescription">Description</Label>
                <Textarea
                  id="taskDescription"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingTask ? 'Update Task' : 'Create Task'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Est. Hours</TableHead>
                  <TableHead>Actual Hours</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">Loading tasks...</TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">No tasks found</TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.name}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground">{task.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell>
                        <Select value={task.status} onValueChange={(value: 'todo' | 'in-progress' | 'review' | 'completed') => handleStatusChange(task.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(task.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(task.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{task.estimatedHours}h</TableCell>
                      <TableCell>{task.actualHours}h</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <PermissionGuard action="edit" resource="projects">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard action="delete" resource="projects">
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
