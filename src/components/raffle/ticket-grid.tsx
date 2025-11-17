"use client";

import { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import Image from 'next/image';

type RaffleTicket = {
    id: string;
    raffleId: string;
    ticketNumber: number;
    isSold: boolean;
    purchaseId?: string;
    userId?: string;
};

interface RaffleTicketsGridProps {
    tickets: RaffleTicket[];
    isLoading: boolean;
}

const TicketNumber = ({ number, isSold }: { number: number, isSold: boolean }) => (
  <div
    className={cn(
      "relative flex items-center justify-center w-10 h-10 aspect-square rounded-full transition-all duration-300 group",
      isSold ? "bg-muted/30 cursor-not-allowed" : "bg-primary/80 hover:bg-primary cursor-pointer shadow-lg shadow-primary/30"
    )}
    title={isSold ? `Vendido` : `Número ${String(number).padStart(3, '0')}`}
  >
    {/* Subtle glow for available tickets */}
    {!isSold && (
      <div className="absolute inset-0 rounded-full bg-primary/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-glow"></div>
    )}
    
    {/* Inner border */}
    <div className={cn(
        "absolute inset-[2px] rounded-full",
        isSold ? "border border-dashed border-muted-foreground/20" : "border border-primary/50"
    )}></div>

    <span className={cn(
      "relative z-10 font-bold text-sm transition-colors",
      isSold ? 'text-muted-foreground/60' : 'text-primary-foreground group-hover:text-white'
    )}>
      {String(number).padStart(3, '0')}
    </span>
  </div>
);


export function RaffleTicketsGrid({ tickets, isLoading }: RaffleTicketsGridProps) {
    const totalNumbers = 500;
    const allNumbers = useMemo(() => Array.from({ length: totalNumbers }, (_, i) => i + 1), [totalNumbers]);

    const ticketStatusMap = useMemo(() => {
        const map = new Map<number, RaffleTicket>();
        tickets.forEach(ticket => {
            map.set(ticket.ticketNumber, ticket);
        });
        return map;
    }, [tickets]);

    if (isLoading) {
        return (
            <Card className="bg-transparent border-none p-4">
                <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2">
                    {allNumbers.slice(0, 100).map(num => (
                        <Skeleton key={num} className="w-10 h-10 rounded-full" />
                    ))}
                </div>
            </Card>
        );
    }
    
    return (
        <Card className="bg-transparent border-none p-2 sm:p-4">
            <CardContent className="p-2">
                <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-1 sm:gap-2">
                    {allNumbers.map(number => {
                        const ticket = ticketStatusMap.get(number);
                        const isSold = ticket?.isSold || false;

                        return (
                            <TicketNumber key={number} number={number} isSold={isSold} />
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
