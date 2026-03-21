import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Megaphone, Users, CalendarClock, MessageSquareText } from "lucide-react";

const NAV_ITEMS = [
  { label: "Campaigns", href: "/", icon: Megaphone },
  { label: "Audiences", href: "/audiences", icon: Users },
  { label: "Schedules", href: "/schedules", icon: CalendarClock },
  { label: "Messages", href: "/messages", icon: MessageSquareText },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();

  function isActive(href: string) {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r bg-card shrink-0">
        <div className="px-6 py-5 border-b">
          <span className="text-sm font-semibold tracking-wide uppercase text-foreground">
            Campaign Manager
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-sm",
                isActive(item.href)
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b bg-card flex items-center justify-between px-6 shrink-0">
          <div className="md:hidden text-sm font-semibold tracking-wide uppercase text-foreground">
            Campaign Manager
          </div>
          <div className="hidden md:block" />
          <span className="text-sm text-muted-foreground">Operator</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
