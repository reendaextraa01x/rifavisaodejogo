
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Star } from 'lucide-react';

interface BonusNumberProps {
    number: number;
    isOpen: boolean;
    onClose: () => void;
}

export function BonusNumberClaim({ number, isOpen, onClose }: BonusNumberProps) {
    const [isClaimed, setIsClaimed] = useState(false);

    const handleClaim = () => {
        setIsClaimed(true);
        // Here you would typically trigger an API call to register the claim
        // and then maybe show another toast or update the UI further.
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gray-900 border-yellow-400 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-headline text-yellow-400 flex items-center justify-center gap-2">
                        <Star className="w-8 h-8 animate-pulse" /> NÚMERO DOURADO! <Star className="w-8 h-8 animate-pulse" />
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-300">
                        Parabéns! Você comprou o número dourado <span className="font-bold text-yellow-400">{String(number).padStart(3, '0')}</span>!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4 py-4">
                    <Gift className="w-24 h-24 text-yellow-400 animate-bounce" />
                    <p className="text-lg text-center">
                        Você ganhou um prêmio instantâneo!
                    </p>
                    <p className="text-3xl font-bold text-white">
                        +10 Números Extras!
                    </p>
                    <p className="text-sm text-gray-400 text-center">
                        (Serão adicionados à sua conta em breve)
                    </p>
                </div>
                <Button 
                    onClick={isClaimed ? onClose : handleClaim} 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg py-6"
                >
                    {isClaimed ? "Fechar" : "Reivindicar Prêmio!"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
