
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
import { RaffleTicketsGrid } from "@/components/raffle/ticket-grid";
import { MyTickets } from "@/components/raffle/my-tickets";
import { SlothAnalysis } from "@/components/raffle/sloth-analysis";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlaceholders } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

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

const LeafIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 120"
    className={cn("fill-current", className)}
  >
    <path d="M60,0C26.9,0,0,26.9,0,60c0,33.1,26.9,60,60,60c33.1,0,60-26.9,60-60C120,26.9,93.1,0,60,0z M82.9,35.6 c-3.3-3.3-8.6-3.3-11.9,0L60,46.1L49,35.6c-3.3-3.3-8.6-3.3-11.9,0s-3.3,8.6,0,11.9L48.1,60L37.1,72.4c-3.3,3.3-3.3,8.6,0,11.9 c1.6,1.6,3.8,2.5,6,2.5s4.3-0.8,6-2.5L60,73.9l11.9,11.9c1.6,1.6,3.8,2.5,6,2.5s4.3-0.8,6-2.5c3.3-3.3,3.3-8.6,0-11.9L71.9,60 l11.9-11.9C86.2,44.2,86.2,38.9,82.9,35.6z"
      transform="scale(1.5) translate(-20, -20)"
      fill="rgba(40, 80, 40, 0.4)"
    >
      <path d="M117.8,3.3C112.2-2.3,103.3-1,99,4.8l-52,69.5c-2.9,3.9-7.5,6.2-12.3,6.2H14.3c-8.8,0-16,7.2-16,16 s7.2,16,16,16h20.4c4.8,0,9.4-2.3,12.3-6.2l52-69.5C104.9,20.9,112.2,15.7,117.8,10z M93.4,22L41.3,91.5 c-1.4,1.9-3.6,3-5.9,3H14.3c-3.3,0-6-2.7-6-6s2.7-6,6-6h21.1c2.3,0,4.5-1.1,5.9-3l52-69.5c1.9-2.6,5.7-3.6,8.3-1.8 C100,8.8,100,14.6,98.1,17.2L38.8,84.4c-3.3,4.4-9.5,5.6-13.9,2.3s-5.6-9.5-2.3-13.9L81.9,6.1C87.4,0,96.7-1.6,102.8,3 C108.9,7.6,110,16.9,105,22.4L45.7,89.6c-3.3,4.4-9.5,5.6-13.9,2.3c-4.4-3.3-5.6-9.5-2.3-13.9L88.8,9.3 c2.6-3.4,1.6-8.2-1.8-10.8c-3.4-2.6-8.2-1.6-10.8,1.8L20.8,77.1C18.3,80.5,19.2,85.3,22.6,88s8.5,1.8,10.8-1.5L92.6,19.8 C96-16.4,100.8-15.5,103.4-12.1c2.6,3.4,1.6,8.2-1.8,10.8L40.8,75.4C37.5,79.8,31.3,81,26.9,77.7c-4.4-3.3-5.6-9.5-2.3-13.9 l59.3-67.2c3.4-3.8,9.2-4.2,13-0.8c3.8,3.4,4.2,9.2,0.8,13L42.4,75.9c-3.3,4.4-9.5,5.6-13.9,2.3s-5.6-9.5-2.3-13.9L85.4,9.6 C89.2,5.2,95.6,4.4,100,8.2s3.6,10-0.8,13.8L40,89.2C36.7,93.6,30.5,94.8,26.1,91.5s-5.6-9.5-2.3-13.9L83,10.4C86,6.6,91.4,6,95,9.6 c3.6,3.6,3,9.4-0.8,12.6L35,89.4c-3.3,4.4-9.5,5.6-13.9,2.3s-5.6-9.5-2.3-13.9l59.3-67.2c3.8-4.3,10.1-4.7,14.4-0.9 c4.3,3.8,4.7,10.1,0.9,14.4L37.4,91.4C34.1,95.8,27.9,97,23.5,93.7c-4.4-3.3-5.6-9.5-2.3-13.9L80.4,12.6 C83.9,8.5,90,8.2,94,12.2c4,4,3.8,10.5-0.5,14.3L34.2,93.7c-3.3,4.4-9.5,5.6-13.9,2.3c-4.4-3.3-5.6-9.5-2.3-13.9L77.3,15 c3.5-3.9,9.4-4.8,13.8-1.9s5.8,9,2.5,13.1L34.3,93.4c-3.3,4.4-9.5,5.6-13.9,2.3s-5.6-9.5-2.3-13.9L77.3,15z" />
    </path>
  </svg>
);


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
          const ticketRef = doc(firestore, "raffleTickets", ticketDoc.id);
          batch.update(ticketRef, {
            isSold: true,
            purchaseId: purchaseId,
            userId: currentUser.uid,
            userName: currentUser.displayName || "Anônimo",
            userPhoto: currentUser.photoURL || undefined,
          });
          boughtNumbers.push(ticketDoc.data().ticketNumber);
        });
      }

      await batch.commit();

      toast({
        title: "Pagamento confirmado!",
        description: `Você comprou ${quantityToBuy} número(s): ${boughtNumbers.map(n => String(n).padStart(3, '0')).join(', ')}`,
      });

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
    <div className="flex flex-col items-center min-h-screen w-full bg-gradient-to-b from-black via-green-950 to-background text-gray-100 font-body overflow-x-hidden">
      <main className="flex flex-col items-center w-full max-w-4xl px-4 py-8 space-y-12 md:space-y-16">
        
        <header className="flex flex-col items-center text-center space-y-4 animate-fade-in">
          <Image src={ImagePlaceholders.find(p => p.id === 'logo')?.imageUrl || ''} alt="Visão de Jogo Logo" width={224} height={224} className="md:w-56 md:h-56 w-48 h-48" data-ai-hint="logo" />
          <h1 className="font-headline text-5xl md:text-7xl text-center tracking-wider text-primary drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            RIFA VISÃO DE JOGO
          </h1>
          <p className="text-2xl md:text-3xl font-headline text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] flex items-center gap-x-2">
            💸 <span className="text-5xl md:text-6xl text-primary font-bold drop-shadow-[0_4px_4px_rgba(0,255,100,0.3)]">R$2.500</span> NO PIX + CAMISA 💸
          </p>
        </header>

        <div className="relative w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <LeafIcon className="absolute -top-12 -left-20 w-36 h-36 text-green-900/40 opacity-80 -rotate-45" />
          <LeafIcon className="absolute -bottom-16 -right-16 w-32 h-32 text-green-900/30 opacity-70 rotate-[120deg]" />
          <section className="w-full text-center p-6 bg-card/30 rounded-xl border border-border backdrop-blur-sm shadow-lg shadow-black/20">
            <h2 className="text-2xl font-bold mb-4 font-headline tracking-wider">
              Corra! Restam apenas <span className="text-primary font-headline tracking-wider text-3xl">{ticketsLoading ? '...' : availableCount}</span> números!
            </h2>
            <Progress value={percentageSold} className="w-full h-4 bg-muted border border-primary/20" />
            <p className="mt-2 text-sm text-muted-foreground">{soldCount} de {totalNumbers} vendidos ({percentageSold.toFixed(2)}%)</p>
          </section>
        </div>


        <section className="w-full animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <SlothAnalysis tickets={tickets || []} />
        </section>
        
        <section className="w-full text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="max-w-md mx-auto bg-card/50 border border-primary/30 rounded-2xl shadow-lg p-6 backdrop-blur-sm animate-glow">
                <div className="space-y-6">
                    <p className="text-2xl font-headline tracking-wider">Quantos números você quer?</p>
                    <div className="flex items-center justify-center space-x-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-14 w-14 rounded-full text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50" 
                          onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                          disabled={!!chosenNumber}
                        >
                          <Minus className="w-8 h-8" />
                        </Button>
                        
                        <div className="relative w-40 h-24 flex items-center justify-center">
                          <div className="absolute inset-0 bg-black/20 rounded-xl border border-primary/30 backdrop-blur-sm"></div>
                          <span className="relative text-7xl font-bold text-white drop-shadow-lg">{ticketQuantity}</span>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-14 w-14 rounded-full text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50" 
                          onClick={() => setTicketQuantity(ticketQuantity + 1)}
                          disabled={!!chosenNumber}
                        >
                          <Plus className="w-8 h-8" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="chosenNumber" className="text-lg font-headline tracking-wider text-muted-foreground">Ou escolha seu número (opcional):</label>
                        <Input
                          id="chosenNumber"
                          type="number"
                          placeholder="Ex: 007"
                          className="max-w-xs mx-auto text-center text-xl"
                          value={chosenNumber}
                          onChange={(e) => setChosenNumber(e.target.value)}
                        />
                    </div>
                    
                    <p className="text-5xl font-headline text-primary tracking-widest">
                      Total: R$ {(chosenNumber ? 1 : ticketQuantity * 1).toFixed(2).replace('.', ',')}
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-black font-bold text-2xl py-8 px-10 rounded-full shadow-lg w-full transform transition-transform hover:scale-105"
                      onClick={handleBuyClick}
                    >
                        COMPRAR AGORA
                    </Button>
                </div>
            </div>
        </section>

        <section className="w-full animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Collapsible open={isTicketsOpen} onOpenChange={setIsTicketsOpen} className="rounded-lg border-2 border-primary/50 animate-glow p-1">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-center font-headline text-4xl text-center my-4 text-white hover:text-primary transition-colors">
                Ver Números da Sorte
                <ChevronDown className={`ml-2 h-8 w-8 transition-transform duration-300 ${isTicketsOpen ? 'rotate-180' : ''}`} />
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
                    <CardTitle className="font-headline text-3xl text-center text-primary">Regras e Transparência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {rules.map((rule, index) => (
                        <div key={index} className="flex items-start space-x-4">
                            <div className="flex-shrink-0 mt-1">{rule.icon}</div>
                            <p className="text-gray-300 font-bold">{rule.text}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </section>
      </main>

      <footer className="w-full text-center py-8 mt-12 border-t border-border">
          <p className="font-bold text-lg">@visao.de.jogo.oficial</p>
          <p className="text-muted-foreground text-sm">Sorteio ao vivo no TikTok – transparência total 🚀</p>
      </footer>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="bg-gray-900 border-primary/50 text-white">
              <DialogHeader>
                  <DialogTitle className="text-2xl font-headline text-primary text-center">Pagamento via PIX</DialogTitle>
                  <DialogDescription className="text-center text-gray-300">
                      Escaneie o QR Code abaixo com seu app do banco ou copie o código.
                  </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4 py-4">
                  <Image src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://firebase.google.com/" alt="QR Code PIX" width={200} height={200} className="rounded-lg border-4 border-primary" data-ai-hint="qr code" />
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
    </div>
  );

    

    
