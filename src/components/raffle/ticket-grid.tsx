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

const FootballIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path
        d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11.5,3.05L15.3,5.74L14.2,9.5L10,8.04L11.5,3.05M8.7,4.34L10,8.04L6.5,10.04L4.8,6.85L8.7,4.34M4.05,7.8L6.5,10.04L5.18,12.32L3.13,10.13L4.05,7.8M12.5,3.05L14,8.04L17.5,9.5L18.7,5.74L12.5,3.05M15.3,5.74L11.5,3.05L10,8.04L14.2,9.5L15.3,5.74M8.7,4.34L12,2.08L15.3,5.74L14.2,9.5L10,8.04L8.7,4.34M4.8,6.85L8.7,4.34L10,8.04L6.5,10.04L4.8,6.85M3.13,10.13L5.18,12.32L6.5,10.04L4.05,7.8L3.13,10.13M2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
        style={{
            stroke: 'hsl(var(--primary))',
            strokeWidth: 0.5,
            fill: 'hsl(var(--background))'
        }}
        />
    </svg>
)


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
            <Card className="bg-card/30 border-border backdrop-blur-sm p-4">
                <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2">
                    {allNumbers.slice(0, 100).map(num => (
                        <Skeleton key={num} className="w-10 h-10 rounded-full" />
                    ))}
                </div>
            </Card>
        );
    }
    
    return (
        <Card className="bg-card/30 border-border backdrop-blur-sm p-2 sm:p-4">
            <CardContent className="p-2">
                <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-1 sm:gap-2">
                    {allNumbers.map(number => {
                        const ticket = ticketStatusMap.get(number);
                        const isSold = ticket?.isSold || false;

                        return (
                            <div key={number}
                                className={cn(
                                    "relative flex items-center justify-center w-10 h-10 aspect-square rounded-full transition-all duration-200",
                                    isSold ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
                                )}
                                title={isSold ? `Vendido` : `Número ${String(number).padStart(3, '0')}`}
                            >
                                <div className="absolute inset-0 text-background">
                                   <FootballIcon />
                                </div>
                               <span className={cn(
                                    "relative z-10 font-bold text-xs",
                                     isSold ? 'text-muted-foreground' : 'text-foreground'
                                )}>
                                    {String(number).padStart(3, '0')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
