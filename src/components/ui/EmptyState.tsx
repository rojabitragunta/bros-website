import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "./Button";

export function EmptyState({
  title,
  body,
  action,
  className,
  index,
}: {
  title: string;
  body?: string;
  action?: { label: string; href: string; onClick?: () => void };
  className?: string;
  index?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <p className="eyebrow mb-6 text-steel">{index ?? "00 / Empty"}</p>
      <h2 className="display max-w-md text-[clamp(2.5rem,9vw,4.5rem)]">{title}</h2>
      {body && <p className="mt-4 text-sm text-mist">{body}</p>}
      {action && (
        <ButtonLink href={action.href} onClick={action.onClick} size="lg" className="mt-10" icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
          {action.label}
        </ButtonLink>
      )}
    </div>
  );
}
