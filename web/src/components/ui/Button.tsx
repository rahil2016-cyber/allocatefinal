import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer select-none";

    const variants = {
      primary: "bg-[#174A7E] text-white hover:bg-[#0F2C4D] focus:ring-[#174A7E] shadow-sm hover:shadow",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400",
      outline: "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-[#174A7E]",
      ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm",
    };

    const sizes = {
      sm: "min-h-[38px] px-3.5 py-1.5 text-xs font-semibold gap-1.5 rounded-lg",
      md: "min-h-[44px] px-4 py-2.5 text-sm font-semibold gap-2 rounded-xl",
      lg: "min-h-[48px] px-6 py-3 text-base font-bold gap-2.5 rounded-xl",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
