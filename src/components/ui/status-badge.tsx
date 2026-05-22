import type { ToolStatus } from "@/lib/tool-manifest";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ToolStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium",
        status === "已上线"
          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        className,
      )}
    >
      {status}
    </span>
  );
}
