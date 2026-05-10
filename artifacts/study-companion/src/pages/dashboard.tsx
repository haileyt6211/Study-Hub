import { AppLayout } from "@/components/layout";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { AlertCircle, BellOff, CheckCircle2, Clock, BookMarked } from "lucide-react";
import { Link } from "wouter";
import { useListAssignments } from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";

export function Dashboard() {
  const { permission, requestPermission, dueSoon } = useNotifications();
  const { data: assignments } = useListAssignments();

  const total = assignments?.length || 0;
  const completed = assignments?.filter(a => a.completed).length || 0;
  const pending = total - completed;

  const upcoming = assignments
    ?.filter(a => !a.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4) || [];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-script text-5xl text-foreground">Dashboard</h1>
          {permission !== "granted" && typeof Notification !== "undefined" && (
            <Button
              onClick={requestPermission}
              variant="outline"
              className="gap-2 bg-white border-border shadow-sm rounded-2xl text-sm"
              data-testid="button-enable-notifications"
            >
              <BellOff className="w-4 h-4" />
              Enable Notifications
            </Button>
          )}
        </div>

        {dueSoon && dueSoon.length > 0 && (
          <div className="bg-white border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm">
            <div className="bg-red-100 p-3 rounded-full shrink-0">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-600 text-base">Urgent Deadlines</h3>
              <p className="text-red-400 text-sm">You have {dueSoon.length} assignment(s) due in the next 24 hours.</p>
            </div>
            <Link href="/assignments">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shrink-0 text-sm" data-testid="button-view-assignments">
                View Assignments
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Assignments", value: total, icon: BookMarked },
            { label: "Pending", value: pending, icon: Clock },
            { label: "Completed", value: completed, icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-border/50 flex items-center justify-between" data-testid={`card-${label.toLowerCase().replace(/ /g, '-')}`}>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{label}</p>
                <p className="text-4xl font-bold text-foreground">{value}</p>
              </div>
              <div className="bg-secondary rounded-full p-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-script text-3xl text-foreground">Upcoming Tasks</h2>
            <Link href="/assignments">
              <span className="text-sm text-primary hover:underline cursor-pointer">View all</span>
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-border text-center py-12 text-muted-foreground shadow-sm">
              <p>No upcoming tasks. Enjoy your free time!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(a => (
                <div key={a.id} className="bg-white rounded-2xl border border-border/50 px-5 py-4 flex items-center justify-between gap-4 shadow-sm" data-testid={`card-assignment-${a.id}`}>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{a.subject} · Due {format(parseISO(a.dueDate), "MMM d, yyyy")}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide ${
                    a.priority === "high" ? "bg-red-100 text-red-500" :
                    a.priority === "medium" ? "bg-primary/10 text-primary" :
                    "bg-secondary text-muted-foreground"
                  }`} data-testid={`badge-priority-${a.id}`}>
                    {a.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
