
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Star, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                // Reset for next time
                setTimeout(() => setIsClaimed(false), 300);
            }
        }}>
            <DialogContent className="bg-gray-900 border-yellow-400 text-white overflow-hidden">
                <DialogHeader className="z-10">
                    <DialogTitle className="text-2xl font-headline text-yellow-400 flex items-center justify-center gap-2">
                        <Star className="w-8 h-8 animate-pulse" /> NÚMERO DOURADO! <Star className="w-8 h-8 animate-pulse" />
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-300">
                        Parabéns! Você tirou a sorte grande com o número <span className="font-bold text-yellow-400">{String(number).padStart(3, '0')}</span>!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4 py-4 z-10 min-h-[250px] justify-center">
                    <div 
                      className={cn("absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out", isClaimed ? 'scale-0 opacity-0' : 'scale-100 opacity-100')}
                      style={{ perspective: '1000px' }}
                    >
                      <button onClick={handleClaim} className="group flex flex-col items-center">
                        <Gift className="w-32 h-32 text-yellow-400 group-hover:animate-bounce" />
                        <p className="text-center font-bold text-white mt-2">Clique para abrir!</p>
                      </button>
                    </div>

                    <div className={cn("absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out", isClaimed ? 'scale-100 opacity-100' : 'scale-0 opacity-0')}>
                      <PartyPopper className="w-32 h-32 text-primary animate-ping-slow" />
                      <p className="text-lg text-center mt-4">
                          Você ganhou um prêmio instantâneo!
                      </p>
                      <p className="text-4xl font-bold text-white">
                          +10 Números Extras!
                      </p>
                       <p className="text-sm text-gray-400 text-center mt-2">
                        (Serão adicionados à sua conta em breve)
                      </p>
                    </div>
                </div>
                <Button 
                    onClick={onClose} 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg py-6 mt-4 z-10"
                >
                    {isClaimed ? "Que Sorte! Fechar" : "Fechar"}
                </Button>
                
                {isClaimed && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full animate-fall"
                        style={{
                          left: `${Math.random() * 100}%`,
                          width: `${Math.random() * 8 + 5}px`,
                          height: `${Math.random() * 8 + 5}px`,
                          background: `hsl(${Math.random() * 60 + 30}, 100%, 50%)`,
                          animationDelay: `${Math.random() * 0.5}s`,
                          animationDuration: `${Math.random() * 2 + 1.5}s`,
                          opacity: 0,
                        }}
                      />
                    ))}
                  </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

    