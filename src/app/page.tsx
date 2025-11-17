import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SlothMascot } from "@/components/icons/sloth-mascot";
import { RaffleGrid } from "@/components/raffle-grid";
import { soldNumbers } from "@/lib/raffle-data";
import { Award, Gift, Handshake, Percent, Ticket, Users } from "lucide-react";

export default function Home() {
  const totalNumbers = 500;
  const soldCount = soldNumbers.length;
  const remainingCount = totalNumbers - soldCount;
  const percentageSold = (soldCount / totalNumbers) * 100;

  const pricingOptions = [
    { tickets: 1, price: "10,00", emoji: "🎟️" },
    { tickets: 3, price: "25,00", emoji: "🎟️🎟️🎟️" },
    { tickets: 7, price: "50,00", emoji: "🎉" },
  ];

  const rules = [
    { icon: <Award className="text-primary" />, text: "Prêmio: R$ 2.500,00 no PIX + Camisa oficial surpresa autografada do Brasileirão 2025." },
    { icon: <Ticket className="text-primary" />, text: "500 números de 001 a 500. Aumente suas chances!" },
    { icon: <Percent className="text-primary" />, text: "Sorteio baseado no resultado da Loteria Federal para garantir a lisura." },
    { icon: <Users className="text-primary" />, text: "O sorteio será realizado AO VIVO em nosso canal assim que todos os números forem vendidos." },
    { icon: <Handshake className="text-primary" />, text: "Garantimos a entrega do prêmio em até 24h após o sorteio. Transparência total!" },
    { icon: <Gift className="text-primary" />, text: "A camisa será enviada para o endereço do ganhador sem custos de frete." },
  ];

  // Configure seu número de WhatsApp aqui. Ex: 5511999999999
  const whatsappNumber = "5511900000000"; 
  const whatsappMessage = "Olá! Quero comprar números da rifa Visão de Jogo!";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gradient-to-b from-black via-[#111A07] to-[#1A330A] text-gray-100 font-body overflow-x-hidden">
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

        <section className="w-full text-center p-6 bg-card/30 rounded-xl border border-border backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4">
            Corra! Restam apenas <span className="text-primary font-headline tracking-wider text-3xl">{remainingCount}</span> números!
          </h2>
          <Progress value={percentageSold} className="w-full h-4 bg-muted border border-primary/20" />
          <p className="mt-2 text-sm text-muted-foreground">{soldCount} de {totalNumbers} vendidos ({percentageSold.toFixed(1)}%)</p>
        </section>

        <section className="w-full">
            <h2 className="font-headline text-4xl text-center mb-6 text-white">Escolha seus números da sorte 🍀</h2>
            <RaffleGrid soldNumbers={soldNumbers} totalNumbers={totalNumbers} />
        </section>

        <section className="w-full flex justify-center sticky bottom-4 z-10">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xl py-8 px-10 rounded-full shadow-lg shadow-accent/50 animate-pulse">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              COMPRAR NO WHATSAPP
            </a>
          </Button>
        </section>

        <section className="w-full">
            <h2 className="font-headline text-4xl text-center mb-6 text-white">Combos com Desconto 🔥</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pricingOptions.map((option, index) => (
                    <Card key={index} className="bg-card/50 border-primary/30 text-center hover:bg-card hover:border-primary transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
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
    </div>
  );
}
