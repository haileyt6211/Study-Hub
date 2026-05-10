import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { useListAssignments, useUpdateAssignment, useDeleteAssignment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListAssignmentsQueryKey,
  getGetAssignmentSummaryQueryKey,
  getGetAssignmentsDueSoonQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Assignments() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const { data: assignments } = useListAssignments();
  const updateAssignment = useUpdateAssignment();
  const deleteAssignment = useDeleteAssignment();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListAssignmentsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetAssignmentSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetAssignmentsDueSoonQueryKey() });
  };

  const toggleComplete = (id: number, current: boolean) => {
    updateAssignment.mutate({ id, data: { completed: !current } }, { onSuccess: invalidate });
  };

  const handleDelete = (id: number) => {
    deleteAssignment.mutate({ id }, { onSuccess: invalidate });
  };

  const filtered = assignments
    ?.filter(a => {
      if (filterStatus === "completed" && !a.completed) return false;
      if (filterStatus === "pending" && a.completed) return false;
      if (filterPriority !== "all" && a.priority !== filterPriority) return false;
      return true;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-script text-5xl text-foreground">Assignments</h1>
          <Link href="/assignments/new">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-sm" data-testid="button-new-assignment">
              <Plus className="w-4 h-4" />
              New Assignment
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 bg-white rounded-2xl border border-border/50 p-4 shadow-sm">
          <div className="w-44">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="rounded-xl border-border bg-background" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-44">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="rounded-xl border-border bg-background" data-testid="select-priority">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-border text-center py-16 text-muted-foreground shadow-sm">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-primary/30" />
            <p className="font-medium">No assignments found</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => (
              <div
                key={a.id}
                data-testid={`assignment-row-${a.id}`}
                className={`bg-white rounded-2xl border border-border/50 px-5 py-4 flex items-center gap-4 shadow-sm transition-all ${
                  a.completed ? "opacity-60" : "hover:border-primary/30"
                }`}
              >
                <button
                  onClick={() => toggleComplete(a.id, a.completed)}
                  data-testid={`button-toggle-${a.id}`}
                  className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                >
                  {a.completed
                    ? <CheckCircle2 className="w-7 h-7 text-primary" />
                    : <Circle className="w-7 h-7" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-base leading-tight ${a.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {a.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{a.subject}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">Due {format(parseISO(a.dueDate), "MMM d, yyyy")}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      a.priority === "high" ? "bg-red-100 text-red-500" :
                      a.priority === "medium" ? "bg-primary/10 text-primary" :
                      "bg-secondary text-muted-foreground"
                    }`} data-testid={`badge-priority-${a.id}`}>
                      {a.priority}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(a.id)}
                  data-testid={`button-delete-${a.id}`}
                  className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
