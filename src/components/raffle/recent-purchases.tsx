"use client";

import { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

type RaffleTicket = {
    id: string;
    raffleId: string;
    ticketNumber: number;
    isSold: boolean;
    userId?: string;
    userName?: string;
    userPhoto?: string;
    purchaseId?: string;
};

interface RecentPurchasesProps {
    tickets: RaffleTicket[];
}

type Purchase = {
    purchaseId: string;
    userName: string;
    userPhoto?: string;
    ticketCount: number;
    timestamp: number; // For sorting
}

export function RecentPurchases({ tickets }: RecentPurchasesProps) {
    const [visiblePurchases, setVisiblePurchases] = useState<Purchase[]>([]);

    const recentPurchases = useMemo(() => {
        if (!tickets || tickets.length === 0) {
            return [];
        }

        const purchasesMap = new Map<string, Purchase>();

        // We need to simulate a purchase time. We'll use the ticket number for that.
        // In a real scenario, this would come from a `purchaseDate` field.
        const soldTickets = tickets.filter(t => t.isSold && t.purchaseId && t.userId && t.userName);

        soldTickets.forEach(ticket => {
            if (purchasesMap.has(ticket.purchaseId!)) {
                const purchase = purchasesMap.get(ticket.purchaseId!)!;
                purchase.ticketCount += 1;
            } else {
                purchasesMap.set(ticket.purchaseId!, {
                    purchaseId: ticket.purchaseId!,
                    userName: ticket.userName!,
                    userPhoto: ticket.userPhoto,
                    ticketCount: 1,
                    timestamp: ticket.ticketNumber, // Using ticket number as a mock timestamp
                });
            }
        });

        return Array.from(purchasesMap.values())
            .sort((a, b) => b.timestamp - a.timestamp) // Sort by "time"
            .slice(0, 5); // Take the 5 most recent

    }, [tickets]);

    useEffect(() => {
        if (recentPurchases.length === 0) return;

        // Animate the purchases appearing one by one
        const interval = setInterval(() => {
            setVisiblePurchases(prev => {
                if (prev.length < recentPurchases.length) {
                    return [...prev, recentPurchases[prev.length]];
                }
                clearInterval(interval);
                return prev;
            });
        }, 500); // Stagger the appearance of each item

        return () => clearInterval(interval);
    }, [recentPurchases]);


    const soldTicketsCount = useMemo(() => tickets.filter(t => t.isSold).length, [tickets]);

    if (soldTicketsCount === 0) {
        return null; // Don't render if no tickets have been sold yet
    }

    return (
        <Card className="bg-card/30 border-border backdrop-blur-sm w-full shadow-lg shadow-black/20">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-center text-primary flex items-center justify-center gap-2">
                    <ShoppingCart className="w-8 h-8 animate-pulse" /> Últimos Compradores
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
                {visiblePurchases.length > 0 ? visiblePurchases.map((purchase, index) => (
                    <div 
                        key={purchase.purchaseId} 
                        className={cn(
                            "flex items-center justify-between bg-card/50 p-3 rounded-lg transition-all duration-500 transform opacity-0 animate-fade-in"
                        )}
                        style={{animationDelay: `${index * 100}ms`}}
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-primary/50">
                                <AvatarImage src={purchase.userPhoto} alt={purchase.userName} />
                                <AvatarFallback>{purchase.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p>
                                <span className="font-bold text-white">{purchase.userName}</span>
                                <span className="text-sm text-muted-foreground"> acabou de comprar</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-primary text-lg bg-primary/20 px-3 py-1 rounded-full">{purchase.ticketCount} {purchase.ticketCount > 1 ? 'números' : 'número'}</span>
                        </div>
                    </div>
                )) : (
                     <p className="text-center text-muted-foreground py-4">Acompanhe as compras em tempo real!</p>
                 )}
            </CardContent>
        </Card>
    );
}