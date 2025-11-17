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

const FootballIcon = ({ isSold }: { isSold: boolean }) => (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{ stopColor: 'hsl(var(--primary) / 0.5)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(var(--primary) / 0)', stopOpacity: 1 }} />
            </radialGradient>
        </defs>
        
        {/* Glow effect for available tickets */}
        {!isSold && <circle cx="16" cy="16" r="15" fill="url(#grad1)" />}

        <circle cx="16" cy="16" r="14" fill={isSold ? "hsl(var(--muted) / 0.2)" : "hsl(var(--card))"} stroke="hsl(var(--border))" strokeWidth="0.5"/>
        
        {/* Hexagons */}
        <path d="M16 4.5 L20.3 7 L20.3 11.5 L16 14 L11.7 11.5 L11.7 7 Z" fill={isSold ? "hsl(var(--muted) / 0.3)" : "hsl(var(--primary) / 0.7)"} />
        <path d="M10.3 15.25 L11.7 17 L10.3 18.75 L7.7 18.75 L6.3 17 L7.7 15.25 Z" fill={isSold ? "hsl(var(--muted) / 0.3)" : "hsl(var(--primary) / 0.7)"} />
        <path d="M21.7 15.25 L23.1 17 L21.7 18.75 L19.1 18.75 L17.7 17 L19.1 15.25 Z" fill={isSold ? "hsl(var(--muted) / 0.3)" : "hsl(var(--primary) / 0.7)"} />
        <path d="M16 20.5 L20.3 23 L20.3 27.5 L16 30 L11.7 27.5 L11.7 23 Z" fill={isSold ? "hsl(var(--muted) / 0.3)" : "hsl(var(--primary) / 0.7)"} transform="rotate(180 16 25.25)" />

        {/* Inner shadow for 3D effect */}
        <circle cx="16" cy="16" r="14" fill="transparent" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
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
                                    "relative flex items-center justify-center w-10 h-10 aspect-square rounded-full transition-all duration-300 group",
                                    isSold ? "opacity-40 cursor-not-allowed" : "hover:scale-110 hover:z-10"
                                )}
                                title={isSold ? `Vendido` : `Número ${String(number).padStart(3, '0')}`}
                            >
                                <div className="absolute inset-0">
                                   <FootballIcon isSold={isSold} />
                                </div>
                               <span className={cn(
                                    "relative z-10 font-bold text-xs transition-colors",
                                     isSold ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'
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

    