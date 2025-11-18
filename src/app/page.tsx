
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Gift, Handshake, Percent, Ticket, Users, ChevronDown, Star, Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { useUser } from "@/firebase/provider";
import { RaffleTicketsGrid, GOLDEN_TICKETS } from "@/components/raffle/ticket-grid";
import { MyTickets } from "@/components/raffle/my-tickets";
import { SlothAnalysis } from "@/components/raffle/sloth-analysis";
import { ImagePlaceholders } from "@/lib/placeholder-images";
import { BonusNumberClaim } from "@/components/raffle/bonus-number";

type RaffleTicket = {
  id: string;
  raffleId: string;
  ticketNumber: number;
  isSold: boolean;
  purchaseId?: string;
  userId?: string;
  userName?: string;
  userPhoto?: string;
};

export default function Home() {
  const totalNumbers = 500;
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [chosenNumber, setChosenNumber] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTicketsOpen, setIsTicketsOpen] = useState(true);
  const [goldenNumberClaim, setGoldenNumberClaim] = useState<number | null>(null);


  const ticketsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "raffleTickets"), where("raffleId", "==", "main-raffle"));
  }, [firestore]);

  const { data: tickets, isLoading: ticketsLoading } = useCollection<RaffleTicket>(ticketsQuery);

  const { soldCount, availableCount, percentageSold, soldNumbersSet } = useMemo(() => {
    if (!tickets) {
      return {
        soldCount: 0,
        availableCount: totalNumbers,
        percentageSold: 0,
        soldNumbersSet: new Set(),
      };
    }
    const sold = tickets.filter(t => t.isSold);
    const soldNumbers = new Set(sold.map(t => t.ticketNumber));
    return {
      soldCount: sold.length,
      availableCount: totalNumbers - sold.length,
      percentageSold: (sold.length / totalNumbers) * 100,
      soldNumbersSet: soldNumbers,
    };
  }, [tickets]);

  useEffect(() => {
    if (chosenNumber) {
      setTicketQuantity(1);
    }
  }, [chosenNumber]);


  const handleBuyClick = () => {
    if (chosenNumber) {
      const num = parseInt(chosenNumber);
      if (isNaN(num) || num < 1 || num > 500) {
        toast({
          variant: "destructive",
          title: "Número inválido",
          description: "Por favor, escolha um número entre 001 e 500.",
        });
        return;
      }
      if (soldNumbersSet.has(num)) {
        toast({
          variant: "destructive",
          title: "Número indisponível",
          description: `O número ${chosenNumber.padStart(3,'0')} já foi vendido.`,
        });
        return;
      }
    } else if (ticketQuantity > availableCount) {
      toast({
        variant: "destructive",
        title: "Oh no! Ingressos insuficientes.",
        description: `Temos apenas ${availableCount} números disponíveis.`,
      });
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  const processPayment = async () => {
    setIsProcessing(true);

    try {
      let currentUser = user;
      if (!currentUser && !isUserLoading) {
        initiateAnonymousSignIn(auth);
        toast({
          title: "Aguardando autenticação...",
          description: "Por favor, clique em 'Confirmar Pagamento' novamente.",
        });
        setIsProcessing(false);
        return;
      }
      
      if (!currentUser) {
         toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Não foi possível autenticar o usuário. Tente novamente.",
        });
        setIsProcessing(false);
        return;
      }

      if (!firestore) {
        throw new Error("Firestore not initialized");
      }

      const batch = writeBatch(firestore);
      const purchaseId = `purchase_${Date.now()}`;
      const quantityToBuy = chosenNumber ? 1 : ticketQuantity;
      
      const newPurchase = {
        id: purchaseId,
        raffleId: "main-raffle",
        userId: currentUser.uid,
        purchaseDate: new Date().toISOString(),
        numberOfTickets: quantityToBuy,
        totalAmount: quantityToBuy * 1,
        paymentMethod: "PIX",
        paymentStatus: "completed",
      };

      const purchaseRef = collection(firestore, `users/${currentUser.uid}/purchases`);
      batch.set(doc(purchaseRef, purchaseId), newPurchase);
      
      const boughtNumbers: number[] = [];
      let wonGoldenTicket = false;
      let goldenNumber = null;

      if (chosenNumber) {
        const numToBuy = parseInt(chosenNumber);
        const ticketQuery = query(
          collection(firestore, "raffleTickets"),
          where("raffleId", "==", "main-raffle"),
          where("ticketNumber", "==", numToBuy),
          where("isSold", "==", false)
        );
        const ticketSnapshot = await getDocs(ticketQuery);

        if (ticketSnapshot.empty) {
          throw new Error(`O número ${chosenNumber.padStart(3,'0')} não está mais disponível.`);
        }
        const ticketDoc = ticketSnapshot.docs[0];
        const ticketRef = doc(firestore, "raffleTickets", ticketDoc.id);
        batch.update(ticketRef, {
          isSold: true,
          purchaseId: purchaseId,
          userId: currentUser.uid,
          userName: currentUser.displayName || "Anônimo",
          userPhoto: currentUser.photoURL || undefined,
        });
        boughtNumbers.push(ticketDoc.data().ticketNumber);
        if (GOLDEN_TICKETS.has(numToBuy)) {
          wonGoldenTicket = true;
          goldenNumber = numToBuy;
        }
      } else {
        const availableTicketsQuery = query(
          collection(firestore, "raffleTickets"),
          where("raffleId", "==", "main-raffle"),
          where("isSold", "==", false)
        );
        
        const availableTicketsSnapshot = await getDocs(availableTicketsQuery);
        const availableTickets = availableTicketsSnapshot.docs.slice(0, quantityToBuy);

        if (availableTickets.length < quantityToBuy) {
          throw new Error("Não há números suficientes disponíveis.");
        }

        availableTickets.forEach(ticketDoc => {
          const ticketData = ticketDoc.data();
          const ticketRef = doc(firestore, "raffleTickets", ticketDoc.id);
          batch.update(ticketRef, {
            isSold: true,
            purchaseId: purchaseId,
            userId: currentUser.uid,
            userName: currentUser.displayName || "Anônimo",
            userPhoto: currentUser.photoURL || undefined,
          });
          boughtNumbers.push(ticketData.ticketNumber);
          if (GOLDEN_TICKETS.has(ticketData.ticketNumber) && !wonGoldenTicket) {
             wonGoldenTicket = true;
             goldenNumber = ticketData.ticketNumber;
          }
        });
      }

      await batch.commit();

      toast({
        title: "Pagamento confirmado!",
        description: `Você comprou ${quantityToBuy} número(s): ${boughtNumbers.map(n => String(n).padStart(3, '0')).join(', ')}`,
      });

      if (wonGoldenTicket && goldenNumber) {
        setGoldenNumberClaim(goldenNumber);
      }


    } catch (error: any) {
      console.error("Payment processing error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Algo deu errado.",
        description: error.message || "Não foi possível processar seu pagamento.",
      });
    } finally {
      setIsProcessing(false);
      setIsPaymentDialogOpen(false);
      setChosenNumber('');
    }
  };


  const rules = [
    { icon: <Award className="text-primary" />, text: "Prêmio: R$ 2.500,00 no PIX + Camisa oficial surpresa autografada do Brasileirão 2025." },
    { icon: <Star className="text-primary animate-pulse" />, text: "Números Dourados: Compre um número dourado e concorra a um prêmio extra instantâneo!" },
    { icon: <Ticket className="text-primary" />, text: "500 números de 001 a 500. Aumente suas chances!" },
    { icon: <Percent className="text-primary" />, text: "Sorteio baseado no resultado da Loteria Federal para garantir a lisura." },
    { icon: <Users className="text-primary" />, text: "O sorteio será realizado AO VIVO em nosso canal assim que todos os números forem vendidos." },
    { icon: <Handshake className="text-primary" />, text: "Garantimos a entrega do prêmio em até 24h após o sorteio. Transparência total!" },
    { icon: <Gift className="text-primary" />, text: "A camisa será enviada para o endereço do ganhador sem custos de frete." },
  ];
  
  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gradient-to-b from-black via-green-950 to-background text-gray-100 font-body">
      <main className="flex flex-col items-center w-full max-w-4xl px-4 py-8 space-y-12 md:space-y-16">
        
        <header className="flex flex-col items-center text-center space-y-4 animate-fade-in">
          <Image src={ImagePlaceholders.find(p => p.id === 'logo')?.imageUrl || ''} alt="Visão de Jogo Logo" width={50} height={50} className="md:w-14 md:h-14 w-12 h-12" data-ai-hint="logo" />
          <h1 className="font-headline text-5xl md:text-7xl text-center tracking-wider text-primary drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            RIFA VISÃO DE JOGO
          </h1>
          <p className="text-xl md:text-3xl font-headline text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] flex items-center gap-x-2">
            💸 <span className="text-4xl md:text-6xl text-primary font-bold drop-shadow-[0_4px_4px_rgba(0,255,100,0.3)]">R$2.500</span> NO PIX + CAMISA 💸
          </p>
        </header>

        <section className="w-full animate-fade-in my-8 rounded-2xl border-2 border-primary/30 p-4 md:p-8 relative bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.6)_0%,_rgba(0,0,0,0.9)_70%)] animate-glow" style={{ animationDelay: '0.8s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-4">
                  <h2 className="font-headline text-4xl md:text-5xl text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.8)] [text-shadow:0_0_10px_hsl(var(--primary)/0.5)]">
                      O PRÊMIO QUE VAI MUDAR SEU JOGO
                  </h2>
                  <Image 
                      src={ImagePlaceholders.find(p => p.id === 'prizeImage')?.imageUrl || ''}
                      alt="Prêmio da Rifa"
                      width={500}
                      height={500}
                      className="rounded-2xl shadow-2xl border-2 border-primary/30 object-cover aspect-square mt-4"
                      data-ai-hint="prize money"
                  />
                  <p className="text-lg text-gray-300 max-w-md drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pt-4">
                      Imagine R$2.500 caindo no seu PIX e uma camisa oficial, autografada, do seu time do coração. Com apenas um número, essa pode ser a sua realidade.
                  </p>
              </div>
              <div className="max-w-md mx-auto bg-card/50 border border-primary/30 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
                  <div className="space-y-6">
                      <p className="text-2xl font-headline tracking-wider">Quantos números você quer?</p>
                      <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50" 
                            onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                            disabled={!!chosenNumber}
                          >
                            <Minus className="w-6 h-6 sm:w-8 sm:h-8" />
                          </Button>
                          
                          <div className="relative w-28 sm:w-40 h-20 sm:h-24 flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/20 rounded-xl border border-primary/30 backdrop-blur-sm"></div>
                            <span className="relative text-6xl sm:text-7xl font-bold text-white drop-shadow-lg">{ticketQuantity}</span>
                          </div>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50" 
                            onClick={() => setTicketQuantity(ticketQuantity + 1)}
                            disabled={!!chosenNumber}
                          >
                            <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
                          </Button>
                      </div>

                      <div className="space-y-2">
                          <label htmlFor="chosenNumber" className="text-md sm:text-lg font-headline tracking-wider text-muted-foreground">Ou escolha seu número (opcional):</label>
                          <Input
                            id="chosenNumber"
                            type="number"
                            placeholder="Ex: 007"
                            className="max-w-[200px] sm:max-w-xs mx-auto text-center text-lg sm:text-xl"
                            value={chosenNumber}
                            onChange={(e) => setChosenNumber(e.target.value)}
                          />
                      </div>
                      
                      <p className="text-4xl sm:text-5xl font-headline text-primary tracking-widest">
                        Total: R$ {(chosenNumber ? 1 : ticketQuantity * 1).toFixed(2).replace('.', ',')}
                      </p>
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-black font-bold text-xl sm:text-2xl py-6 sm:py-8 px-8 sm:px-10 rounded-full shadow-lg w-full transform transition-transform hover:scale-105"
                        onClick={handleBuyClick}
                      >
                          COMPRAR AGORA
                      </Button>
                  </div>
              </div>
          </div>
        </section>

        <div className="w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <section className="relative w-full text-center p-6 bg-card/30 rounded-xl border border-border backdrop-blur-sm shadow-lg shadow-black/20">
            <h2 className="text-xl md:text-2xl font-bold mb-4 font-headline tracking-wider">
              Corra! Restam apenas <span className="text-primary font-headline tracking-wider text-2xl md:text-3xl">{ticketsLoading ? '...' : availableCount}</span> números!
            </h2>
            <Progress value={percentageSold} className="w-full h-4 bg-muted border border-primary/20" />
            <p className="mt-2 text-sm text-muted-foreground">{soldCount} de {totalNumbers} vendidos ({percentageSold.toFixed(2)}%)</p>
          </section>
        </div>


        <section className="w-full animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <SlothAnalysis tickets={tickets || []} />
        </section>
        
        <section className="w-full animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Collapsible open={isTicketsOpen} onOpenChange={setIsTicketsOpen} className="rounded-lg border-2 border-primary/50 animate-glow p-1">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-center font-headline text-2xl sm:text-4xl text-center my-2 sm:my-4 text-white hover:text-primary transition-colors">
                Ver Números da Sorte
                <ChevronDown className={`ml-2 h-6 w-6 sm:h-8 sm:w-8 transition-transform duration-300 ${isTicketsOpen ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <RaffleTicketsGrid tickets={tickets || []} isLoading={ticketsLoading} />
            </CollapsibleContent>
          </Collapsible>
        </section>

        {user && (
          <section className="w-full animate-fade-in" style={{ animationDelay: '1.0s' }}>
            <MyTickets userId={user.uid} />
          </section>
        )}

        <section className="w-full animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <Card className="bg-card/30 border-border backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl sm:text-3xl text-center text-primary">Regras e Transparência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm sm:text-base">
                    {rules.map((rule, index) => (
                        <div key={index} className="flex items-start space-x-3 sm:space-x-4">
                            <div className="flex-shrink-0 mt-1">{rule.icon}</div>
                            <p className="text-gray-300 font-bold">{rule.text}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </section>
      </main>

      <footer className="w-full text-center py-8 mt-12 border-t border-border">
          <p className="font-bold text-md sm:text-lg">@visao.de.jogo.oficial</p>
          <p className="text-muted-foreground text-xs sm:text-sm">Sorteio ao vivo no TikTok – transparência total 🚀</p>
      </footer>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="bg-gray-900 border-primary/50 text-white max-w-[90vw] sm:max-w-lg rounded-lg">
              <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl font-headline text-primary text-center">Pagamento via PIX</DialogTitle>
                  <DialogDescription className="text-center text-gray-300 text-sm sm:text-base">
                      Escaneie o QR Code abaixo com seu app do banco ou copie o código.
                  </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4 py-4">
                  <Image src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://firebase.google.com/" alt="QR Code PIX" width={180} height={180} className="rounded-lg border-4 border-primary sm:w-[200px] sm:h-[200px]" data-ai-hint="qr code" />
                  <Card className="w-full bg-black/50 p-3">
                      <p className="text-xs text-gray-400 break-words">000201265802BR5913NOMECOMPLETO6009SAOPAULO62070503***6304E2A8</p>
                  </Card>
                  <Button onClick={async () => {
                      await navigator.clipboard.writeText("000201265802BR5913NOMECOMPLETO6009SAOPAULO62070503***6304E2A8");
                      toast({ title: "Copiado!", description: "Código PIX copiado para a área de transferência." });
                  }}>
                      Copiar Código PIX
                  </Button>
              </div>
              <Button onClick={processPayment} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-6">
                  {isProcessing ? "Processando..." : "Confirmar Pagamento"}
              </Button>
          </DialogContent>
      </Dialog>
      
      {goldenNumberClaim && (
        <BonusNumberClaim 
          number={goldenNumberClaim}
          isOpen={!!goldenNumberClaim}
          onClose={() => setGoldenNumberClaim(null)} 
        />
      )}
    </div>
  );

    

    
