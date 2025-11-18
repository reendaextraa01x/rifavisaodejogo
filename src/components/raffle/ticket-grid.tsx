"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { FallingMoney } from '../animations/falling-money';

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

const GOLDEN_TICKETS = new Set([7, 22, 55, 88, 101, 123, 150, 177, 200, 222, 250, 283, 300, 333, 377, 400, 450, 488]);

const TicketNumber = ({ number, isSold }: { number: number, isSold: boolean }) => {
  const isGolden = GOLDEN_TICKETS.has(number);

  if (isGolden && !isSold) {
    return (
      <div
        className="relative flex items-center justify-center w-10 h-10 aspect-square rounded-full transition-all duration-300 group cursor-pointer animate-glow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.6))',
          boxShadow: '0 0 15px hsl(var(--primary) / 0.7)',
        }}
        title={`Número Dourado ${String(number).padStart(3, '0')}! Chance extra!`}
      >
        <Star className="absolute w-5 h-5 text-white/50 animate-ping opacity-50" />
        <Star className="absolute w-6 h-6 text-white/70" fill="currentColor" />
        <span className="relative z-10 font-bold text-sm text-primary-foreground transition-colors group-hover:text-white">
          {String(number).padStart(3, '0')}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-10 h-10 aspect-square rounded-full transition-all duration-300 group",
        isSold ? "bg-muted/30 cursor-not-allowed" : "bg-primary/80 hover:bg-primary cursor-pointer shadow-lg shadow-primary/30"
      )}
      title={isSold ? `Vendido` : `Número ${String(number).padStart(3, '0')}`}
    >
      {!isSold && (
        <div className="absolute inset-0 rounded-full bg-primary/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      
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
};


export function RaffleTicketsGrid({ tickets, isLoading }: RaffleTicketsGridProps) {
    const totalNumbers = 500;
    const numbersPerPage = 100;
    const totalPages = Math.ceil(totalNumbers / numbersPerPage);
    const [currentPage, setCurrentPage] = useState(1);

    const allNumbers = useMemo(() => Array.from({ length: totalNumbers }, (_, i) => i + 1), [totalNumbers]);

    const ticketStatusMap = useMemo(() => {
        const map = new Map<number, RaffleTicket>();
        tickets.forEach(ticket => {
            map.set(ticket.ticketNumber, ticket);
        });
        return map;
    }, [tickets]);
    
    const numbersToShow = useMemo(() => {
        const startIndex = (currentPage - 1) * numbersPerPage;
        const endIndex = startIndex + numbersPerPage;
        return allNumbers.slice(startIndex, endIndex);
    }, [currentPage, allNumbers]);

    if (isLoading) {
        return (
            <Card className="bg-transparent border-none p-4">
                <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-10 gap-2">
                    {Array.from({ length: numbersPerPage }).map((_, i) => (
                        <Skeleton key={i} className="w-10 h-10 rounded-full" />
                    ))}
                </div>
            </Card>
        );
    }
    
    return (
        <div className="relative overflow-hidden">
             <div className="absolute inset-0 z-0">
                <FallingMoney />
            </div>
            <Card className="bg-transparent border-none p-2 sm:p-4">
                <CardContent className="p-2 relative z-10">
                    <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-10 lg:grid-cols-10 gap-1 sm:gap-2">
                        {numbersToShow.map(number => {
                            const ticket = ticketStatusMap.get(number);
                            const isSold = ticket?.isSold || false;

                            return (
                                <TicketNumber key={number} number={number} isSold={isSold} />
                            );
                        })}
                    </div>
                </CardContent>
                <div className="flex items-center justify-center mt-4 space-x-4 relative z-10">
                    <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} variant="ghost">
                        <ChevronLeft className="mr-2 h-5 w-5" /> Anterior
                    </Button>
                    <span className="font-bold text-muted-foreground">
                        {`Mostrando ${numbersToShow[0]}-${numbersToShow[numbersToShow.length - 1]}`}
                    </span>
                    <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} variant="ghost">
                        Próximo <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}
