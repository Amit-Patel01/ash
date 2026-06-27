"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  label: string;
  value: string;
  content: React.ReactNode;
};

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.value);
  const selected = tabs.find((tab) => tab.value === active) ?? tabs[0];

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-border bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-semibold transition",
              active === tab.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => setActive(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{selected?.content}</div>
    </div>
  );
}
