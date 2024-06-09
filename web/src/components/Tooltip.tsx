import {
    Tooltip as UITooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";

export default function Tooltip({ children, content }: { children: React.ReactNode, content: string }) {
    return (
        <TooltipProvider>
      <UITooltip delayDuration={200}>
        <TooltipTrigger>
            {children}
        </TooltipTrigger>
        <TooltipContent>
            {content}
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
    )
}
