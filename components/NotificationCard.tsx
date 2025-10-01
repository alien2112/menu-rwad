import { cn } from "@/lib/utils";

interface NotificationCardProps {
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  backgroundImage?: string;
  customStyle?: React.CSSProperties;
}

export function NotificationCard({ className, icon, children, backgroundImage, customStyle }: NotificationCardProps) {
  return (
    <div 
      className={cn(
        "glass-notification rounded-3xl p-4 flex items-center justify-center gap-3",
        "relative overflow-hidden inner-card-hover",
        className
      )}
      style={customStyle}
    >
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-30 inner-card-image inner-card-pulse"
        />
      )}
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center relative z-10">
          {icon}
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
