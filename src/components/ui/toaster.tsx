"use client";

import { Check, CircleAlert } from "lucide-react";
import { Toaster as Sonner } from "sonner";

/** Dark ink toast from the design: check in accent-300, "Geri al" as an inverse ghost button. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      offset={{ right: 40, bottom: 32 }}
      // Sits above the admin's mobile tab bar (76px).
      mobileOffset={{ left: 12, right: 12, bottom: 92 }}
      gap={10}
      icons={{
        success: <Check size={18} strokeWidth={2} className="text-accent-300" aria-hidden />,
        error: <CircleAlert size={18} strokeWidth={2} className="text-danger-line" aria-hidden />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full md:w-[380px] items-center gap-3 rounded-lg bg-neutral-900 py-3 pr-2.5 pl-4 text-neutral-100 shadow-lg font-body",
          title: "text-[14px] leading-snug [&_strong]:font-semibold",
          description: "text-[13px] text-neutral-300",
          icon: "flex-none",
          content: "flex-1",
          actionButton:
            "h-11 md:h-9 px-2.5 rounded-md font-heading font-semibold text-[15px] text-accent-300 hover:bg-white/10 cursor-pointer",
        },
      }}
    />
  );
}
