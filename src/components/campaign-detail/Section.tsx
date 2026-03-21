import type { ComponentType } from "react";

interface SectionProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function Section({ icon: Icon, title, children, action }: SectionProps) {
  return (
    <div className="bg-card border rounded-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <span className="text-muted-foreground text-sm">{label}</span>
      <p className={`mt-0.5 font-medium ${className || ""}`}>{value}</p>
    </div>
  );
}

export function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-secondary/30 rounded-sm px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${color || ""}`}>{value}</p>
    </div>
  );
}
