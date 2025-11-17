
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Gift, Handshake, Percent, Ticket, Users, ChevronDown, UserCheck, CheckCircle } from "lucide-react";
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
import { BonusNumber } from "@/components/raffle/bonus-number";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);

  const ticketsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "raffleTickets"), where("raffleId", "==", "main-raffle"));
  }, [firestore]);

  const { data: tickets, isLoading: ticketsLoading } = useCollection<RaffleTicket>(ticketsQuery);

  const { soldCount, availableCount, percentageSold } = useMemo(() => {
    if (!tickets) {
      const percentageToFill = 87.63;
      const initialSoldCount = Math.floor((totalNumbers * percentageToFill) / 100);
      return {
        soldCount: initialSoldCount,
        availableCount: totalNumbers - initialSoldCount,
        percentageSold: percentageToFill,
      };
    }
    const sold = tickets.filter(t => t.isSold).length;
    return {
      soldCount: sold,
      availableCount: totalNumbers - sold,
      percentageSold: (sold / totalNumbers) * 100,
    };
  }, [tickets]);


  const handleBuyClick = () => {
    if (ticketQuantity > availableCount) {
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

      const availableTicketsQuery = query(
        collection(firestore, "raffleTickets"),
        where("raffleId", "==", "main-raffle"),
        where("isSold", "==", false)
      );
      
      const availableTicketsSnapshot = await getDocs(availableTicketsQuery);
      const availableTickets = availableTicketsSnapshot.docs.slice(0, ticketQuantity);

      if (availableTickets.length < ticketQuantity) {
        throw new Error("Não há números suficientes disponíveis.");
      }

      const batch = writeBatch(firestore);
      const purchaseId = `purchase_${Date.now()}`;
      const newPurchase = {
        id: purchaseId,
        raffleId: "main-raffle",
        userId: currentUser.uid,
        purchaseDate: new Date().toISOString(),
        numberOfTickets: ticketQuantity,
        totalAmount: ticketQuantity * 1,
        paymentMethod: "PIX",
        paymentStatus: "completed",
      };

      const purchaseRef = collection(firestore, `users/${currentUser.uid}/purchases`);
      batch.set(doc(purchaseRef, purchaseId), newPurchase);

      const boughtNumbers: number[] = [];
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

      await batch.commit();

      toast({
        title: "Pagamento confirmado!",
        description: `Você comprou ${ticketQuantity} número(s): ${boughtNumbers.join(', ')}`,
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
    }
  };


  const rules = [
    { icon: <Award className="text-primary" />, text: "Prêmio: R$ 2.500,00 no PIX + Camisa oficial surpresa autografada do Brasileirão 2025." },
    { icon: <Ticket className="text-primary" />, text: "500 números de 001 a 500. Aumente suas chances!" },
    { icon: <Percent className="text-primary" />, text: "Sorteio baseado no resultado da Loteria Federal para garantir a lisura." },
    { icon: <Users className="text-primary" />, text: "O sorteio será realizado AO VIVO em nosso canal assim que todos os números forem vendidos." },
    { icon: <Handshake className="text-primary" />, text: "Garantimos a entrega do prêmio em até 24h após o sorteio. Transparência total!" },
    { icon: <Gift className="text-primary" />, text: "A camisa será enviada para o endereço do ganhador sem custos de frete." },
  ];
  
  const combos = [
    {
      quantity: 1,
      price: 10,
      text: "Azarão",
    },
    {
      quantity: 3,
      price: 25,
      text: "Apostador",
      popular: true,
    },
    {
      quantity: 7,
      price: 50,
      text: "Investidor",
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gradient-to-b from-black via-green-950 to-background text-gray-100 font-body overflow-x-hidden">
      <main className="flex flex-col items-center w-full max-w-4xl px-4 py-8 space-y-12 md:space-y-16">
        
        <header className="flex flex-col items-center text-center space-y-4 animate-fade-in">
          <Image src="https://i.imgur.com/iY4YsxL.png" alt="Visão de Jogo Logo" width={224} height={224} className="md:w-56 md:h-56 w-48 h-48" data-ai-hint="logo" />
          <h1 className="font-headline text-5xl md:text-7xl text-center tracking-wider text-primary drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            RIFA VISÃO DE JOGO
          </h1>
          <p className="text-2xl md:text-4xl font-headline text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            💸 R$ 2.500 NO PIX + CAMISA 💸
          </p>
        </header>

        <section className="w-full text-center p-6 bg-card/30 rounded-xl border border-border backdrop-blur-sm shadow-lg shadow-black/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold mb-4 font-headline tracking-wider">
            Corra! Restam apenas <span className="text-primary font-headline tracking-wider text-3xl">{ticketsLoading ? '...' : availableCount}</span> números!
          </h2>
          <Progress value={percentageSold} className="w-full h-4 bg-muted border border-primary/20" />
          <p className="mt-2 text-sm text-muted-foreground">{soldCount} de {totalNumbers} vendidos ({percentageSold.toFixed(2)}%)</p>
        </section>

        <section className="w-full animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <BonusNumber tickets={tickets || []} />
        </section>

        <section className="w-full animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Collapsible open={isTicketsOpen} onOpenChange={setIsTicketsOpen} className="rounded-lg border-2 border-primary/50 animate-glow p-1">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-center font-headline text-4xl text-center mb-6 text-white hover:text-primary transition-colors">
                Números da Sorte
                <ChevronDown className={`ml-2 h-8 w-8 transition-transform duration-300 ${isTicketsOpen ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <RaffleTicketsGrid tickets={tickets || []} isLoading={ticketsLoading} />
            </CollapsibleContent>
          </Collapsible>
        </section>
        
        <section className="w-full text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <h2 className="font-headline text-4xl text-center mb-6 text-white">Aumente suas chances! 🍀</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {combos.map((combo) => (
                <Card
                  key={combo.quantity}
                  className={`bg-card/50 border-primary/30 text-center transition-all duration-300 shadow-lg p-6 cursor-pointer hover:scale-105 hover:shadow-primary/50 group ${combo.popular ? 'border-2 border-primary animate-glow' : ''}`}
                  onClick={() => setTicketQuantity(combo.quantity)}
                >
                  {combo.popular && (
                    <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold py-1 px-3 rounded-full uppercase tracking-wider">
                      Popular
                    </div>
                  )}
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="font-headline text-2xl text-primary">{combo.text}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-2">
                    <p className="text-4xl font-bold">
                      {combo.quantity} <span className="text-2xl font-headline text-muted-foreground">Número{combo.quantity > 1 ? 's' : ''}</span>
                    </p>
                    <p className="text-2xl font-headline text-white">
                      R$ {combo.price.toFixed(2).replace('.', ',')}
                    </p>
                    <Button variant="ghost" className="w-full group-hover:bg-accent group-hover:text-accent-foreground">
                      <CheckCircle className="mr-2 h-4 w-4" /> Selecionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
        </section>

        <section className="w-full text-center animate-fade-in" style={{ animationDelay: '1.0s' }}>
            <Card className="bg-card/50 border-primary/30 text-center transition-all duration-300 shadow-lg p-6 max-w-md mx-auto">
              <CardContent className="space-y-4">
                  <p className="text-xl font-bold">Ou escolha quantos números você quer:</p>
                  <div className="flex items-center justify-center space-x-4">
                      <Button variant="outline" size="icon" onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}>-</Button>
                      <Input 
                        type="number" 
                        className="text-center text-2xl font-bold w-24 h-14" 
                        value={ticketQuantity}
                        onChange={(e) => setTicketQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        max={availableCount}
                      />
                      <Button variant="outline" size="icon" onClick={() => setTicketQuantity(ticketQuantity + 1)}>+</Button>
                  </div>
                  <p className="text-4xl font-headline text-primary">Total: R$ {(ticketQuantity * 10 - (ticketQuantity >= 7 ? 20 : (ticketQuantity >= 3 ? 5 : 0))).toFixed(2).replace('.', ',')}</p>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xl py-8 px-10 rounded-full shadow-lg animate-glow w-full" onClick={handleBuyClick}>
                      COMPRAR {ticketQuantity} NÚMERO{ticketQuantity > 1 ? 'S' : ''}
                  </Button>
              </CardContent>
            </Card>
        </section>

        {user && (
          <section className="w-full animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <MyTickets userId={user.uid} />
          </section>
        )}

        <section className="w-full animate-fade-in" style={{ animationDelay: '1.4s' }}>
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
