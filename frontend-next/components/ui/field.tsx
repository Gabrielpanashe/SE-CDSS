import * as React from "react";
import { cn } from "@/lib/utils";

const Field = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("group space-y-1.5", className)} {...props} />
  )
);
Field.displayName = "Field";

const FieldLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-xs font-semibold uppercase tracking-wide text-slate-500",
        "group-data-[invalid]:text-red-600",
        className
      )}
      {...props}
    />
  )
);
FieldLabel.displayName = "FieldLabel";

const FieldDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs text-slate-400",
        "group-data-[invalid]:text-red-500",
        className
      )}
      {...props}
    />
  )
);
FieldDescription.displayName = "FieldDescription";

export { Field, FieldLabel, FieldDescription };
