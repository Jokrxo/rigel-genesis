import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface Task {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  status: string;
}

interface ProjectGanttChartProps {
  projects: Project[];
}

export const ProjectGanttChart = ({ projects }: ProjectGanttChartProps) => {
  const tasks: Task[] = useMemo(() => {
    return projects.map(project => ({
      id: project.id,
      name: project.name,
      start: new Date(project.startDate),
      end: new Date(project.endDate),
      progress: Math.round((project.spent / project.budget) * 100),
      status: project.status,
    }));
  }, [projects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'planning': return 'bg-yellow-500';
      case 'on-hold': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDateRange = () => {
    if (tasks.length === 0) return { start: new Date(), end: new Date() };
    
    const startDates = tasks.map(task => task.start);
    const endDates = tasks.map(task => task.end);
    
    return {
      start: new Date(Math.min(...startDates.map(d => d.getTime()))),
      end: new Date(Math.max(...endDates.map(d => d.getTime())))
    };
  };

  const { start: rangeStart, end: rangeEnd } = getDateRange();
  const totalDays = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));

  const getTaskPosition = (task: Task) => {
    const taskStart = Math.max(0, Math.ceil((task.start.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)));
    const taskDuration = Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      left: (taskStart / totalDays) * 100,
      width: (taskDuration / totalDays) * 100
    };
  };

  const generateTimelineHeaders = () => {
    const headers = [];
    const current = new Date(rangeStart);
    
    while (current <= rangeEnd) {
      headers.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    
    return headers;
  };

  const timelineHeaders = generateTimelineHeaders();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline (Gantt Chart)</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No projects to display
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline Header */}
            <div className="flex border-b pb-2">
              <div className="w-64 font-semibold">Project</div>
              <div className="flex-1 relative">
                <div className="flex justify-between text-xs text-muted-foreground">
                  {timelineHeaders.map((date, index) => (
                    <div key={index} className="text-center">
                      {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Rows */}
            <div className="space-y-3">
              {tasks.map((task) => {
                const position = getTaskPosition(task);
                
                return (
                  <div key={task.id} className="flex items-center">
                    <div className="w-64 pr-4">
                      <div className="font-medium text-sm">{task.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          task.status === 'active' ? 'default' :
                          task.status === 'completed' ? 'secondary' :
                          task.status === 'planning' ? 'outline' : 'destructive'
                        }>
                          {task.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {task.progress}% complete
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 relative h-8 bg-gray-100 rounded">
                      <div
                        className={`absolute top-1 bottom-1 rounded ${getStatusColor(task.status)} opacity-80`}
                        style={{
                          left: `${position.left}%`,
                          width: `${position.width}%`
                        }}
                      >
                        {/* Progress indicator */}
                        <div
                          className="h-full bg-white bg-opacity-30 rounded-r"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      
                      {/* Task details on hover */}
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white opacity-0 hover:opacity-100 transition-opacity">
                        {task.start.toLocaleDateString()} - {task.end.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs text-muted-foreground mt-6 pt-4 border-t">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Planning</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>On Hold</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};