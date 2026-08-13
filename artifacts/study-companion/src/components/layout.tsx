import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Bell,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Timer,
  School,
  StickyNote,
  PenLine,
  GraduationCap,
  Link2,
} from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const palettes: Record<string, Record<string, string>> = {
      rose: { background: "348 60% 92%", sidebar: "348 52% 87%", primary: "340 52% 58%", secondary: "348 45% 86%", accent: "348 50% 84%", border: "348 30% 84%" },
      peach: { background: "22 75% 93%", sidebar: "22 65% 87%", primary: "15 70% 60%", secondary: "22 60% 86%", accent: "22 65% 84%", border: "22 38% 83%" },
      lemon: { background: "48 70% 92%", sidebar: "48 62% 86%", primary: "42 65% 48%", secondary: "48 55% 85%", accent: "48 65% 82%", border: "48 38% 81%" },
      mint: { background: "154 45% 92%", sidebar: "154 42% 85%", primary: "154 42% 43%", secondary: "154 35% 84%", accent: "154 40% 81%", border: "154 28% 79%" },
      sky: { background: "202 65% 93%", sidebar: "202 55% 87%", primary: "202 55% 52%", secondary: "202 45% 85%", accent: "202 55% 82%", border: "202 30% 80%" },
      lavender: { background: "263 55% 93%", sidebar: "263 45% 87%", primary: "263 48% 58%", secondary: "263 38% 86%", accent: "263 45% 83%", border: "263 28% 81%" },
    };
    const palette = palettes[localStorage.getItem("studyhub-palette") || "rose"] ?? palettes.rose;
    Object.entries(palette).forEach(([name, value]) => document.documentElement.style.setProperty(`--${name}`, value));
  }, []);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/timer", label: "Study Timer", icon: Timer },
    { href: "/classes", label: "Classes", icon: School },
    { href: "/sticky-board", label: "Sticky Board", icon: StickyNote },
    { href: "/write", label: "Write Mode", icon: PenLine },
    { href: "/teachers", label: "Teachers", icon: GraduationCap },
    { href: "/resources", label: "Resources", icon: Link2 },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="w-full md:w-64 flex-shrink-0 flex flex-col bg-sidebar md:min-h-screen px-4 py-6 gap-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="font-script text-3xl text-foreground leading-tight">Study Hub</h1>
            <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-[160px]">Welcome back!</p>
          </div>
          <button
            onClick={() => {}}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 text-foreground shadow-sm hover:bg-white/90 transition-colors"
            data-testid="button-notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-sm font-medium ${
                  isActive
                    ? "bg-white shadow-sm text-foreground"
                    : "text-foreground/70 hover:bg-white/50 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4 pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground italic text-center px-2">
            "He is my refuge and my fortress"
          </p>
          <button
            onClick={() => setDark((d) => !d)}
            data-testid="button-dark-mode"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-foreground/70 hover:bg-white/50 hover:text-foreground transition-all"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            data-testid="button-logout"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-foreground/70 hover:bg-white/50 hover:text-foreground transition-all"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
