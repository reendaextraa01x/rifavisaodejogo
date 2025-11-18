
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Sparkles, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type RaffleTicket = {
    id: string;
    ticketNumber: number;
    isSold: boolean;
};

interface SlothAnalysisProps {
    tickets: RaffleTicket[];
}

export function SlothAnalysis({ tickets }: SlothAnalysisProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [luckyNumber, setLuckyNumber] = useState<number | null>(null);
    const [probability, setProbability] = useState<number | null>(null);

    const availableNumbers = useMemo(() => {
        const soldNumbers = new Set(tickets.filter(t => t.isSold).map(t => t.ticketNumber));
        return Array.from({ length: 500 }, (_, i) => i + 1).filter(num => !soldNumbers.has(num));
    }, [tickets]);

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        setLuckyNumber(null);
        setProbability(null);

        setTimeout(() => {
            if (availableNumbers.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableNumbers.length);
                setLuckyNumber(availableNumbers[randomIndex]);
                // Generate a random probability between 40 and 60
                const randomProb = Math.floor(Math.random() * (60 - 40 + 1)) + 40;
                setProbability(randomProb);
            }
            setIsAnalyzing(false);
        }, 3000); // Simulate analysis for 3 seconds
    };
    
    return (
        <Card className="relative overflow-hidden bg-card/50 border-primary/30 text-center transition-all duration-300 shadow-lg p-6 animate-glow">
            <CardHeader className="p-0 mb-4">
                <CardTitle className="font-headline text-3xl text-primary flex items-center justify-center gap-2">
                    <Sparkles className="w-8 h-8" /> Análise da Preguiça <Sparkles className="w-8 h-8" />
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                <p className="text-lg text-muted-foreground">Nossa IA preguiçosa vai analisar as probabilidades e te dar um número da sorte!</p>
                
                <div className="relative w-48 h-40 flex items-center justify-center">
                    {isAnalyzing && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-40 h-40 rounded-full bg-primary/10 animate-ping"></div>
                            <div className="absolute w-32 h-32 rounded-full bg-primary/20 animate-ping delay-200"></div>
                            <div className="absolute w-24 h-24 rounded-full bg-primary/30 animate-ping delay-400"></div>
                        </div>
                    )}
                    <Image 
                      src="https://i.imgur.com/z87Zmld.png" 
                      alt="Mascote Preguiça" 
                      width={160} 
                      height={160} 
                      className={cn("transition-all duration-500", isAnalyzing && "animate-pulse" )}
                      data-ai-hint="mascot sloth"
                    />
                </div>

                {luckyNumber !== null ? (
                    <div className="flex flex-col items-center space-y-2 animate-fade-in">
                        <p className="text-white text-2xl">A preguiça recomenda o número...</p>
                        <div 
                            className="flex items-center justify-center bg-primary text-primary-foreground font-bold w-32 h-32 rounded-full text-6xl shadow-lg border-4 border-accent cursor-pointer transform transition-transform hover:scale-110"
                            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                            onClick={handleAnalyze}
                            title="Analisar Novamente"
                        >
                            {String(luckyNumber).padStart(3, '0')}
                        </div>
                        {probability && (
                             <p className="text-white text-md mt-4 animate-fade-in">
                                Probabilidade de acerto: <span className="font-bold text-primary">{probability}%</span>
                            </p>
                        )}
                    </div>
                ) : (
                    <Button onClick={handleAnalyze} disabled={isAnalyzing} size="lg">
                        {isAnalyzing ? (
                            <>
                                <Loader className="mr-2 h-5 w-5 animate-spin" />
                                Analisando...
                            </>
                        ) : (
                            "Analisar Números"
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
