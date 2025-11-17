"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SlothMascot } from "@/components/icons/sloth-mascot";
import { Award, Gift, Handshake, Percent, Ticket, Users, ChevronDown } from "lucide-react";
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
import { TopBuyers } from "@/components/raffle/top-buyers";
import { RaffleTicketsGrid } from "@/components/raffle/ticket-grid";
import { MyTickets } from "@/components/raffle/my-tickets";

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
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const raffleTicketsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "raffleTickets"), where("raffleId", "==", "main-raffle"));
  }, [firestore]);

  const { data: tickets, isLoading: ticketsLoading } = useCollection<RaffleTicket>(raffleTicketsQuery);

  const soldCount = useMemo(() => tickets?.filter(t => t.isSold).length || 0, [tickets]);
  const availableCount = totalNumbers - soldCount;
  const percentageSold = (soldCount / totalNumbers) * 100;


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


  const pricingOptions = [
    { tickets: 1, price: "1,00", emoji: "🎟️" },
    { tickets: 3, price: "3,00", emoji: "🎟️🎟️🎟️" },
    { tickets: 7, price: "7,00", emoji: "🎉" },
  ];

  const rules = [
    { icon: <Award className="text-primary" />, text: "Prêmio: R$ 2.500,00 no PIX + Camisa oficial surpresa autografada do Brasileirão 2025." },
    { icon: <Ticket className="text-primary" />, text: "500 números de 001 a 500. Aumente suas chances!" },
    { icon: <Percent className="text-primary" />, text: "Sorteio baseado no resultado da Loteria Federal para garantir a lisura." },
    { icon: <Users className="text-primary" />, text: "O sorteio será realizado AO VIVO em nosso canal assim que todos os números forem vendidos." },
    { icon: <Handshake className="text-primary" />, text: "Garantimos a entrega do prêmio em até 24h após o sorteio. Transparência total!" },
    { icon: <Gift className="text-primary" />, text: "A camisa será enviada para o endereço do ganhador sem custos de frete." },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-[#0A1A05] text-gray-100 font-body overflow-x-hidden">
      <main className="flex flex-col items-center w-full max-w-4xl px-4 py-8 space-y-12 md:space-y-16">
        
        <header className="flex flex-col items-center text-center space-y-4">
          <SlothMascot className="w-48 h-auto md:w-56" />
          <h1 className="font-headline text-5xl md:text-7xl text-center tracking-wider text-primary drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            RIFA VISÃO DE JOGO
          </h1>
          <p className="text-2xl md:text-4xl font-headline text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            💸 R$ 2.500 NO PIX + CAMISA 💸
          </p>
        </header>

        <section className="w-full text-center p-6 bg-card/30 rounded-xl border border-border backdrop-blur-sm shadow-lg shadow-black/20">
          <h2 className="text-2xl font-bold mb-4">
            Corra! Restam apenas <span className="text-primary font-headline tracking-wider text-3xl">{ticketsLoading ? '...' : availableCount}</span> números!
          </h2>
          <Progress value={percentageSold} className="w-full h-4 bg-muted border border-primary/20" />
          <p className="mt-2 text-sm text-muted-foreground">{soldCount} de {totalNumbers} vendidos ({percentageSold.toFixed(1)}%)</p>
        </section>

        <section className="w-full text-center">
            <h2 className="font-headline text-4xl text-center mb-6 text-white">Escolha sua sorte 🍀</h2>
            <Card className="bg-card/50 border-primary/30 text-center transition-all duration-300 shadow-lg p-6 max-w-md mx-auto">
              <CardContent className="space-y-4">
                  <p className="text-xl font-bold">Quantos números você quer comprar?</p>
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
                  <p className="text-4xl font-headline text-primary">Total: R$ {(ticketQuantity * 1).toFixed(2).replace('.', ',')}</p>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xl py-8 px-10 rounded-full shadow-lg shadow-accent/50 w-full" onClick={handleBuyClick}>
                      COMPRAR NÚMEROS
                  </Button>
              </CardContent>
            </Card>
        </section>

        <section className="w-full">
            <h2 className="font-headline text-4xl text-center mb-6 text-white">Combos com Desconto 🔥</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pricingOptions.map((option, index) => (
                    <Card key={index} className="bg-card/50 border-primary/30 text-center hover:bg-card hover:border-primary transition-all duration-300 transform hover:-translate-y-1 shadow-lg cursor-pointer" onClick={() => setTicketQuantity(option.tickets)}>
                        <CardHeader>
                            <CardTitle className="text-5xl">{option.emoji}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-xl font-bold">{option.tickets} NÚMERO{option.tickets > 1 ? 'S' : ''}</p>
                            <p className="text-4xl font-headline text-primary">R$ {option.price}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
        
        {user && (
          <section className="w-full">
            <MyTickets userId={user.uid} />
          </section>
        )}

        <section className="w-full">
          <Collapsible open={isTicketsOpen} onOpenChange={setIsTicketsOpen}>
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

        <section className="w-full">
            <TopBuyers tickets={tickets || []} />
        </section>


        <section className="w-full">
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
}
