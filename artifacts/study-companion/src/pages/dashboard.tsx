import { AppLayout } from "@/components/layout";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { AlertCircle, BellOff, CheckCircle2, Clock, BookMarked, Palette, Check } from "lucide-react";
import { Link } from "wouter";
import { useListAssignments } from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

const pastelPalettes = [
  { id: "rose", name: "Rose", swatch: "#F7B4C8", background: "348 60% 92%", sidebar: "348 52% 87%", primary: "340 52% 58%", secondary: "348 45% 86%", accent: "348 50% 84%", border: "348 30% 84%" },
  { id: "peach", name: "Peach", swatch: "#F8C8B4", background: "22 75% 93%", sidebar: "22 65% 87%", primary: "15 70% 60%", secondary: "22 60% 86%", accent: "22 65% 84%", border: "22 38% 83%" },
  { id: "lemon", name: "Lemon", swatch: "#F5E7A3", background: "48 70% 92%", sidebar: "48 62% 86%", primary: "42 65% 48%", secondary: "48 55% 85%", accent: "48 65% 82%", border: "48 38% 81%" },
  { id: "mint", name: "Mint", swatch: "#B6E4D3", background: "154 45% 92%", sidebar: "154 42% 85%", primary: "154 42% 43%", secondary: "154 35% 84%", accent: "154 40% 81%", border: "154 28% 79%" },
  { id: "sky", name: "Sky", swatch: "#B9DDF2", background: "202 65% 93%", sidebar: "202 55% 87%", primary: "202 55% 52%", secondary: "202 45% 85%", accent: "202 55% 82%", border: "202 30% 80%" },
  { id: "lavender", name: "Lavender", swatch: "#D5C3F0", background: "263 55% 93%", sidebar: "263 45% 87%", primary: "263 48% 58%", secondary: "263 38% 86%", accent: "263 45% 83%", border: "263 28% 81%" },
] as const;

export function Dashboard() {
  const { permission, requestPermission, dueSoon } = useNotifications();
  const { data: assignments } = useListAssignments();
  const [paletteId, setPaletteId] = useState(() => localStorage.getItem("studyhub-palette") || "rose");

  useEffect(() => {
    const palette = pastelPalettes.find((item) => item.id === paletteId) ?? pastelPalettes[0];
    document.documentElement.style.setProperty("--background", palette.background);
    document.documentElement.style.setProperty("--sidebar", palette.sidebar);
    document.documentElement.style.setProperty("--primary", palette.primary);
    document.documentElement.style.setProperty("--secondary", palette.secondary);
    document.documentElement.style.setProperty("--accent", palette.accent);
    document.documentElement.style.setProperty("--border", palette.border);
    localStorage.setItem("studyhub-palette", palette.id);
  }, [paletteId]);

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

        <section className="bg-white/70 rounded-3xl border border-white/80 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-secondary p-2 text-primary">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Choose your Study Hub colors</h2>
              <p className="text-xs text-muted-foreground">Pick a pastel palette for your home screen.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {pastelPalettes.map((palette) => {
              const selected = palette.id === paletteId;
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setPaletteId(palette.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selected ? "ring-2 ring-primary ring-offset-2" : "hover:scale-105"}`}
                  style={{ backgroundColor: palette.swatch }}
                  aria-label={`Use ${palette.name} palette`}
                  data-testid={`palette-${palette.id}`}
                >
                  <span className="h-3 w-3 rounded-full bg-white/70" />
                  {palette.name}
                  {selected && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </section>

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
