"use client";

import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";

type RaffleTicket = {
  id: string;
  ticketNumber: number;
  isSold: boolean;
  userId?: string;
};

interface MyTicketsProps {
  userId: string;
}

export function MyTickets({ userId }: MyTicketsProps) {
  const firestore = useFirestore();

  const myTicketsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, "raffleTickets"),
      where("raffleId", "==", "main-raffle"),
      where("userId", "==", userId)
    );
  }, [firestore, userId]);

  const { data: myTickets, isLoading } = useCollection<RaffleTicket>(myTicketsQuery);

  const sortedTickets = useMemo(() => {
    return myTickets?.sort((a: RaffleTicket, b: RaffleTicket) => a.ticketNumber - b.ticketNumber) || [];
  }, [myTickets]);

  if (isLoading) {
    return (
      <Card className="bg-card/30 border-border backdrop-blur-sm shadow-lg shadow-black/20">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-center text-primary">
            Carregando seus números...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!myTickets || myTickets.length === 0) {
    return null; // Don't render anything if the user has no tickets
  }

  return (
    <Card className="bg-card/30 border-border backdrop-blur-sm w-full shadow-lg shadow-black/20">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center text-primary flex items-center justify-center gap-2">
          <Ticket className="w-8 h-8" /> Seus Números da Sorte
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-center gap-2">
        {sortedTickets.map((ticket: RaffleTicket) => (
          <div
            key={ticket.id}
            className="flex items-center justify-center bg-primary text-primary-foreground font-bold w-16 h-16 rounded-full text-xl shadow-lg transform transition-transform hover:scale-110"
          >
            {String(ticket.ticketNumber).padStart(3, '0')}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
