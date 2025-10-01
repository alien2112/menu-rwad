import { cn } from "@/lib/utils";

interface NotificationCardProps {
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function NotificationCard({ className, icon, children }: NotificationCardProps) {
  return (
    <div className={cn(
      "glass-notification rounded-3xl p-4 flex items-center justify-center gap-3",
      "relative overflow-hidden",
      className
    )}>
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
          {icon}
        </div>
      )}
      {children}
    </div>
  );
}
