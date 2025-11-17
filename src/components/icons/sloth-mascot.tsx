import type { SVGProps } from "react";

export function SlothMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 130"
      aria-label="Mascote do canal Visão de Jogo: uma preguiça de óculos escuros deitada numa rede."
      {...props}
    >
      <defs>
        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
          <feFlood floodColor="hsl(var(--primary))" result="flood" />
          <feComposite in="flood" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <path d="M5 60 C 50 120, 150 120, 195 60" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" filter="url(#neon-glow)" />

      <g transform="translate(0, -10)">
        <path d="M60 70 C 70 110, 130 110, 140 70 Z" fill="#383838" />
        <circle cx="100" cy="60" r="28" fill="#4a4a4a" />

        <rect x="75" y="52" width="50" height="15" rx="7" fill="black" stroke="hsl(var(--primary))" strokeWidth="0.5" />
        <line x1="82" y1="53" x2="92" y2="66" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
        <line x1="118" y1="53" x2="108" y2="66" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />

        <path d="M75 75 C 45 70, 35 90, 40 100" stroke="#383838" strokeWidth="12" fill="none" strokeLinecap="round" />
        <g>
          <circle cx="35" cy="110" r="12" fill="white" stroke="black" strokeWidth="0.5"/>
          <path d="M30,105 l10,0 l-3,8 h-4 z" fill="black" />
          <path d="M35,117 l-5,-5 l8,0 z" fill="black" />
          <path d="M28.5,112.5 l3,3.5 l3,-3.5" fill="none" stroke="black" strokeWidth="0.5" />
        </g>
        
        <path d="M125 75 C 155 70, 165 90, 160 100" stroke="#383838" strokeWidth="12" fill="none" strokeLinecap="round" />
        <g transform="translate(160, 105)" filter="url(#neon-glow)">
            <circle r="8" fill="hsl(var(--primary))"/>
            <text x="-4" y="3" fill="hsl(var(--primary-foreground))" fontSize="8" fontWeight="bold">$</text>
        </g>
        
        <path d="M95 72 C 100 77, 105 77, 110 72" stroke="black" strokeWidth="1.5" fill="none" />
      </g>
    </svg>
  );
}
