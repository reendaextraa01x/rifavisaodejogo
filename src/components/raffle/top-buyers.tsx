"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Trophy } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

type RaffleTicket = {
    id: string;
    raffleId: string;
    ticketNumber: number;
    isSold: boolean;
    userId?: string;
    userName?: string;
    userPhoto?: string;
};

interface TopBuyersProps {
    tickets: RaffleTicket[];
}

type Buyer = {
    userId: string;
    userName: string;
    userPhoto?: string;
    ticketCount: number;
}

export function TopBuyers({ tickets }: TopBuyersProps) {
    const topBuyers = useMemo(() => {
        if (!tickets || tickets.length === 0) {
            return [];
        }

        const buyersMap = new Map<string, Buyer>();
        
        tickets.forEach(ticket => {
            if (ticket.isSold && ticket.userId && ticket.userName) {
                if (buyersMap.has(ticket.userId)) {
                    const buyer = buyersMap.get(ticket.userId)!;
                    buyer.ticketCount += 1;
                } else {
                    buyersMap.set(ticket.userId, {
                        userId: ticket.userId,
                        userName: ticket.userName,
                        userPhoto: ticket.userPhoto,
                        ticketCount: 1,
                    });
                }
            }
        });

        return Array.from(buyersMap.values())
            .sort((a, b) => b.ticketCount - a.ticketCount)
            .slice(0, 5); // Top 5

    }, [tickets]);

    if (tickets.length === 0 && topBuyers.length === 0) {
        return (
            <Card className="bg-card/30 border-border backdrop-blur-sm shadow-lg shadow-black/20">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl text-center text-primary flex items-center justify-center gap-2">
                        <Trophy className="w-8 h-8" /> Top Compradores
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>Seja o primeiro a comprar e apareça aqui!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-card/30 border-border backdrop-blur-sm w-full shadow-lg shadow-black/20">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-center text-primary flex items-center justify-center gap-2">
                    <Trophy className="w-8 h-8" /> Top Compradores
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {topBuyers.map((buyer, index) => (
                    <div key={buyer.userId} className="flex items-center justify-between bg-card/50 p-3 rounded-lg transition-all duration-300 hover:bg-card hover:shadow-primary/20 hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-lg w-6">{index + 1}.</span>
                            <Avatar>
                                <AvatarImage src={buyer.userPhoto} alt={buyer.userName} />
                                <AvatarFallback>{buyer.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-bold">{buyer.userName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {index === 0 && <Crown className="w-6 h-6 text-yellow-400" />}
                           <span className="font-bold text-primary text-lg">{buyer.ticketCount} números</span>
                        </div>
                    </div>
                ))}
                 {topBuyers.length === 0 && (
                     <p className="text-center text-muted-foreground">Ainda não há compradores. Seja o primeiro!</p>
                 )}
            </CardContent>
        </Card>
    );
}

    