"use client";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface InfoTooltipProps {
  content: string;
}

export default function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger 
        className="text-neutral-400 hover:text-neutral-600 transition-colors p-0.5 rounded-full cursor-help flex-shrink-0"
        aria-label="More information"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-xs p-3 bg-neutral-900 border border-neutral-800 text-white text-[11px] font-medium leading-relaxed rounded-xl shadow-lg"
        style={{ borderRadius: 12 }}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
