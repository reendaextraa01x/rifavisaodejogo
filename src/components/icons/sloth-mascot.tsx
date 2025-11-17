import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

interface SlothMascotProps extends SVGProps<SVGSVGElement> {
  isAnalyzing?: boolean;
}

export function SlothMascot({ isAnalyzing, className, ...props }: SlothMascotProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 130"
      aria-label="Mascote do canal Visão de Jogo: uma preguiça de óculos escuros deitada numa rede."
      className={cn("w-40 h-auto", className)}
      {...props}
    >
      <style>
        {`
          .hammock {
            animation: swing-hammock 4s ease-in-out infinite;
            transform-origin: 100px 60px;
          }
          .sloth-body {
            animation: swing-sloth 4s ease-in-out infinite;
            transform-origin: 100px 60px;
          }
          .scan-line {
            opacity: 0;
            stroke: hsl(var(--accent));
            animation: ${isAnalyzing ? 'scan-animation 1.5s ease-out infinite' : 'none'};
          }
          @keyframes swing-hammock {
            0%, 100% { transform: rotate(0deg) translateY(0); }
            50% { transform: rotate(1.5deg) translateY(2px); }
          }
          @keyframes swing-sloth {
            0%, 100% { transform: rotate(0deg) translateY(0); }
            50% { transform: rotate(-0.5deg) translateY(1px); }
          }
          @keyframes scan-animation {
            0% { opacity: 0; transform: translateY(-5px); }
            20% { opacity: 0.8; transform: translateY(0px); }
            80% { opacity: 0.8; transform: translateY(18px); }
            100% { opacity: 0; transform: translateY(23px); }
          }
        `}
      </style>
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
      
      <path className="hammock" d="M5 60 C 50 120, 150 120, 195 60" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" filter="url(#neon-glow)" />

      <g className="sloth-body" transform="translate(0, -10)">
        {/* Body */}
        <path d="M60 70 C 70 110, 130 110, 140 70 Z" fill="#4a4a4a" />
        
        {/* Head */}
        <circle cx="100" cy="60" r="28" fill="#595959" />
        <path d="M85 40 Q 100 30, 115 40" fill="#6a6a6a" />
        
        {/* Sunglasses */}
        <g>
          <rect x="75" y="52" width="50" height="15" rx="7" fill="black" stroke="hsl(var(--primary))" strokeWidth="0.5" />
          <line x1="82" y1="53" x2="92" y2="66" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
          <line x1="118" y1="53" x2="108" y2="66" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
          <rect className="scan-line" x="76" y="53" width="48" height="1" strokeWidth="1.5" />
        </g>
        
        {/* Nose and mouth */}
        <path d="M97 70 Q 100 73, 103 70" stroke="black" strokeWidth="1.5" fill="#333" />
        <path d="M95 76 C 100 80, 105 80, 110 76" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Arms */}
        <path d="M75 75 C 45 70, 35 90, 40 100" stroke="#4a4a4a" strokeWidth="15" fill="none" strokeLinecap="round" />
        <g>
          <circle cx="35" cy="110" r="10" fill="#383838"/>
          <path d="M32,106 l6,0" stroke="white" strokeWidth="1" strokeLinecap="round" />
          <path d="M31,110 l8,0" stroke="white" strokeWidth="1" strokeLinecap="round" />
          <path d="M32,114 l6,0" stroke="white" strokeWidth="1" strokeLinecap="round" />
        </g>
        
        <path d="M125 75 C 155 70, 165 90, 160 100" stroke="#4a4a4a" strokeWidth="15" fill="none" strokeLinecap="round" />
        <g>
            <circle cx="165" cy="108" r="10" fill="#383838"/>
            <path d="M162,104 l6,0" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <path d="M161,108 l8,0" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <path d="M162,112 l6,0" stroke="white" strokeWidth="1" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
