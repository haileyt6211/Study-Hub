import { AppLayout } from "@/components/layout";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Bell, BellOff, CheckCircle2, Clock, BookMarked } from "lucide-react";
import { Link } from "wouter";
import { useListAssignments } from "@workspace/api-client-react";

export function Dashboard() {
  const { permission, requestPermission, dueSoon } = useNotifications();
  const { data: assignments } = useListAssignments();

  const total = assignments?.length || 0;
  const completed = assignments?.filter(a => a.completed).length || 0;
  const pending = total - completed;

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2 text-lg">Here's what's happening with your studies today.</p>
          </div>
          
          {permission !== "granted" && typeof Notification !== "undefined" && (
            <Button onClick={requestPermission} variant="outline" className="gap-2 shrink-0">
              <BellOff className="w-4 h-4" />
              Enable Notifications
            </Button>
          )}
        </div>

        {dueSoon && dueSoon.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="bg-destructive/20 p-3 rounded-full shrink-0">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-destructive text-lg">Urgent Deadlines</h3>
              <p className="text-destructive/80">You have {dueSoon.length} assignment(s) due in the next 24 hours.</p>
            </div>
            <Link href="/assignments">
              <Button variant="destructive" className="shrink-0">View Assignments</Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Assignments</CardTitle>
              <BookMarked className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{total}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{pending}</div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{completed}</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-serif font-semibold mb-4">Upcoming Tasks</h2>
          {assignments && assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.filter(a => !a.completed).slice(0, 3).map(assignment => (
                <div key={assignment.id} className="p-4 rounded-xl border bg-card flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-lg">{assignment.title}</h4>
                    <p className="text-sm text-muted-foreground">{assignment.subject} • Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                    assignment.priority === "high" ? "bg-destructive/10 text-destructive" :
                    assignment.priority === "medium" ? "bg-primary/10 text-primary" :
                    "bg-secondary text-secondary-foreground"
                  }`}>
                    {assignment.priority}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-secondary/50 rounded-2xl border border-dashed">
              <p className="text-muted-foreground">No upcoming tasks. Enjoy your free time!</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
