"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface RaffleGridProps {
  soldNumbers: number[];
  totalNumbers: number;
}

export function RaffleGrid({ soldNumbers, totalNumbers }: RaffleGridProps) {
  const numbers = useMemo(() => Array.from({ length: totalNumbers }, (_, i) => i + 1), [totalNumbers]);

  return (
    <div className="w-full max-w-4xl p-4 bg-card/20 border border-border rounded-lg">
      <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-15 xl:grid-cols-20 gap-1.5 md:gap-2">
        {numbers.map((num) => {
          const isSold = soldNumbers.includes(num);
          const formattedNum = num.toString().padStart(3, '0');
          return (
            <div
              key={num}
              className={cn(
                "flex items-center justify-center aspect-square rounded-md font-bold text-xs md:text-sm shadow-md transition-all duration-300",
                isSold
                  ? "bg-primary text-primary-foreground transform scale-105 shadow-primary/30"
                  : "bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground cursor-pointer"
              )}
              aria-label={isSold ? `Número ${formattedNum} - Vendido` : `Número ${formattedNum} - Disponível`}
            >
              {formattedNum}
            </div>
          );
        })}
      </div>
    </div>
  );
}
