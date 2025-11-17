"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Star, Gift } from 'lucide-react';

type RaffleTicket = {
    id: string;
    ticketNumber: number;
    isSold: boolean;
    userName?: string;
};

interface BonusNumberProps {
    tickets: RaffleTicket[];
}

const getDailyBonusNumber = () => {
    const date = new Date();
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    // Simple pseudo-random number based on the day of the year
    return (dayOfYear * 137) % 500 + 1;
};

export function BonusNumber({ tickets }: BonusNumberProps) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [bonusNumber, setBonusNumber] = useState(0);

    useEffect(() => {
        setBonusNumber(getDailyBonusNumber());
    }, []);

    const bonusTicket = useMemo(() => {
        return tickets.find(t => t.ticketNumber === bonusNumber);
    }, [tickets, bonusNumber]);

    const handleReveal = () => {
        setIsRevealed(true);
    };

    if (!bonusNumber) return null;

    return (
        <Card className="bg-card/50 border-primary/30 text-center transition-all duration-300 shadow-lg p-6 animate-glow">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-primary flex items-center justify-center gap-2">
                    <Star className="w-8 h-8" /> Número Bônus do Dia <Star className="w-8 h-8" />
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                <p className="text-lg text-muted-foreground">Compre o número do dia e ganhe <span className="font-bold text-white">R$20 no PIX</span> na hora!</p>
                
                {!isRevealed ? (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-48 h-32 flex items-center justify-center">
                            <Gift className="w-24 h-24 text-primary opacity-20" />
                            <div className="absolute font-bold text-5xl text-white">? ? ?</div>
                        </div>
                        <Button onClick={handleReveal}>
                            Revelar Número Bônus
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-4 animate-fade-in">
                        <p className="text-white text-2xl">O número de hoje é...</p>
                        <div 
                            className="flex items-center justify-center bg-primary text-primary-foreground font-bold w-32 h-32 rounded-full text-6xl shadow-lg border-4 border-accent"
                            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                        >
                            {String(bonusNumber).padStart(3, '0')}
                        </div>
                        {bonusTicket?.isSold ? (
                             <p className="text-lg text-accent animate-pulse font-bold">
                                 Parabéns, {bonusTicket.userName || 'comprador sortudo'}! Você ganhou o prêmio bônus!
                             </p>
                        ) : (
                            <p className="text-lg text-green-400 font-bold">
                                O número ainda está disponível! Corra para garantir!
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
