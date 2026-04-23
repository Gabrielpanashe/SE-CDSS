import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCount, maxLength, onChange, value, ...props }, ref) => {
    const length = typeof value === "string" ? value.length : 0;
    const nearLimit = maxLength && length >= maxLength * 0.85;

    return (
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          onChange={onChange}
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800",
            "placeholder:text-slate-400 leading-relaxed resize-none",
            "focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none",
            "transition-all duration-150",
            "aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-100",
            "aria-[invalid=true]:focus:border-red-500 aria-[invalid=true]:focus:ring-red-100",
            showCount && "pb-7",
            className
          )}
          {...props}
        />
        {showCount && maxLength && (
          <span
            className={cn(
              "absolute bottom-2.5 right-3 text-[10px] font-medium tabular-nums transition-colors",
              nearLimit ? "text-amber-500" : "text-slate-300"
            )}
          >
            {length}/{maxLength}
          </span>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
