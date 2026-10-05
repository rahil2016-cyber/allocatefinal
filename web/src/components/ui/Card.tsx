import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hoverEffect = false, glass = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-white p-5 shadow-sm transition-all duration-200",
          glass ? "bg-white/80 backdrop-blur-md border-white/40 shadow-md" : "border-slate-200/80",
          hoverEffect ? "hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300" : "",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
