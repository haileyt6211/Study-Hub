import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { useListAssignments, useUpdateAssignment, useDeleteAssignment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListAssignmentsQueryKey, getGetAssignmentSummaryQueryKey, getGetAssignmentsDueSoonQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Assignments() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const { data: assignments } = useListAssignments();
  const updateAssignment = useUpdateAssignment();
  const deleteAssignment = useDeleteAssignment();
  const queryClient = useQueryClient();

  const toggleComplete = (id: number, currentStatus: boolean) => {
    updateAssignment.mutate({
      id,
      data: { completed: !currentStatus }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAssignmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAssignmentSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAssignmentsDueSoonQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteAssignment.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAssignmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAssignmentSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAssignmentsDueSoonQueryKey() });
      }
    });
  };

  const filteredAssignments = assignments?.filter(a => {
    if (filterStatus === "completed" && !a.completed) return false;
    if (filterStatus === "pending" && a.completed) return false;
    if (filterPriority !== "all" && a.priority !== filterPriority) return false;
    return true;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) || [];

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Assignments</h1>
            <p className="text-muted-foreground mt-1">Track and manage your coursework.</p>
          </div>
          <Link href="/assignments/new">
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              New Assignment
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="w-[180px]">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted/50" />
            <p className="text-lg">No assignments found.</p>
            <p className="text-sm">You are all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div 
                key={assignment.id} 
                className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border bg-card transition-all ${
                  assignment.completed ? "opacity-60" : "hover:shadow-md"
                }`}
              >
                <button 
                  onClick={() => toggleComplete(assignment.id, assignment.completed)}
                  className="shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {assignment.completed ? (
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  ) : (
                    <Circle className="w-8 h-8" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                    <h3 className={`font-bold text-lg leading-tight truncate ${assignment.completed ? "line-through text-muted-foreground" : ""}`}>
                      {assignment.title}
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-secondary">{assignment.subject}</Badge>
                      <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${
                        assignment.priority === "high" ? "bg-destructive/10 text-destructive border-destructive/20" :
                        assignment.priority === "medium" ? "bg-primary/10 text-primary border-primary/20" :
                        "bg-muted text-muted-foreground border-border"
                      }`}>
                        {assignment.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex gap-4">
                    <span>Due: {format(parseISO(assignment.dueDate), "MMM d, yyyy")}</span>
                  </div>
                  {assignment.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {assignment.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex sm:flex-col justify-end">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(assignment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
