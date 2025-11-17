"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

type RaffleTicket = {
    id: string;
    raffleId: string;
    ticketNumber: number;
    isSold: boolean;
    userId?: string;
    userName?: string;
    userPhoto?: string;
};

interface RecentPurchasesProps {
    tickets: RaffleTicket[];
}

type TopBuyer = {
    userId: string;
    userName: string;
    userPhoto?: string;
    ticketCount: number;
}

const getTrophy = (rank: number) => {
    switch (rank) {
        case 0: return <Trophy className="w-8 h-8 text-yellow-400" />;
        case 1: return <Trophy className="w-8 h-8 text-gray-400" />;
        case 2: return <Trophy className="w-8 h-8 text-yellow-700" />;
        default: return null;
    }
}

export function RecentPurchases({ tickets }: RecentPurchasesProps) {
    const topBuyers = useMemo(() => {
        if (!tickets || tickets.length === 0) {
            return [];
        }

        const buyerCounts = new Map<string, TopBuyer>();
        const soldTickets = tickets.filter(t => t.isSold && t.userId && t.userName);

        soldTickets.forEach(ticket => {
            if (buyerCounts.has(ticket.userId!)) {
                const buyer = buyerCounts.get(ticket.userId!)!;
                buyer.ticketCount += 1;
            } else {
                buyerCounts.set(ticket.userId!, {
                    userId: ticket.userId!,
                    userName: ticket.userName!,
                    userPhoto: ticket.userPhoto,
                    ticketCount: 1,
                });
            }
        });

        return Array.from(buyerCounts.values())
            .sort((a, b) => b.ticketCount - a.ticketCount)
            .slice(0, 3);

    }, [tickets]);

    const soldTicketsCount = useMemo(() => tickets.filter(t => t.isSold).length, [tickets]);

    if (soldTicketsCount === 0 || topBuyers.length === 0) {
        return null;
    }

    return (
        <Card className="bg-card/30 border-border backdrop-blur-sm w-full shadow-lg shadow-black/20">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-center text-primary flex items-center justify-center gap-2">
                    <Trophy className="w-8 h-8 animate-pulse" /> Ranking de Compradores
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
                {topBuyers.map((buyer, index) => (
                    <div
                        key={buyer.userId}
                        className={cn(
                            "flex items-center justify-between bg-card/50 p-3 rounded-lg transition-all duration-500 transform animate-fade-in",
                            index === 0 && 'border-2 border-yellow-400 shadow-yellow-400/20 shadow-lg',
                            index === 1 && 'border border-gray-400',
                            index === 2 && 'border border-yellow-700'
                        )}
                        style={{animationDelay: `${index * 150}ms`}}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold w-8 text-center">{getTrophy(index)}</span>
                            <Avatar className="w-12 h-12 border-2 border-primary/50">
                                <AvatarImage src={buyer.userPhoto} alt={buyer.userName} />
                                <AvatarFallback>{buyer.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-white text-lg">{buyer.userName}</p>
                                <p className="text-sm text-muted-foreground">{buyer.ticketCount} números comprados</p>
                            </div>
                        </div>
                        <span className="font-bold text-primary text-xl bg-primary/20 px-4 py-2 rounded-full">
                            {buyer.ticketCount}
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
