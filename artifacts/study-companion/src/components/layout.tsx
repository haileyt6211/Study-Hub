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
} from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/assignments", label: "Assignments", icon: ClipboardList },
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
