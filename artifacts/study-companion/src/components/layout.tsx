import { Link, useLocation } from "wouter";
import { BookOpen, Calendar as CalendarIcon, CheckSquare, Settings } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: BookOpen },
    { href: "/calendar", label: "Calendar", icon: CalendarIcon },
    { href: "/assignments", label: "Assignments", icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-card border-r md:min-h-screen flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 text-primary">
            <BookOpen className="w-8 h-8" />
            <span className="font-serif text-2xl font-bold">Companion</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
