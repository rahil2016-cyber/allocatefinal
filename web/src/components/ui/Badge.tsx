import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}) => {
  const variants = {
    primary: "bg-sky-50 text-[#174A7E] border border-sky-100 font-semibold",
    secondary: "bg-slate-100 text-slate-700 border border-slate-200 font-medium",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 font-medium",
    danger: "bg-rose-50 text-rose-700 border border-rose-200 font-medium",
    info: "bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium",
    outline: "bg-transparent text-slate-600 border border-slate-300 font-medium",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn("inline-flex items-center rounded-full tracking-wide transition-colors", variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};
