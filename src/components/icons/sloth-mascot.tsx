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
          .hammock, .sloth-g-root {
            animation: swing 4s ease-in-out infinite alternate;
            transform-origin: 100px 60px;
          }
           .sloth-g-root {
             animation-direction: alternate-reverse;
             animation-delay: -0.1s;
           }
          .scan-line {
            opacity: 0;
            stroke: hsl(var(--accent));
            animation: ${isAnalyzing ? 'scan-animation 1.5s ease-out infinite' : 'none'};
          }
          @keyframes swing {
            from { transform: rotate(-1.5deg) translateY(-2px); }
            to { transform: rotate(1.5deg) translateY(2px); }
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
        <radialGradient id="sloth-fur-gradient" cx="0.5" cy="0.5" r="0.7">
            <stop offset="0%" stopColor="#8D6E63" />
            <stop offset="100%" stopColor="#6D4C41" />
        </radialGradient>
        <linearGradient id="glasses-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#222" />
            <stop offset="100%" stopColor="#111" />
        </linearGradient>
      </defs>
      
      <path className="hammock" d="M5 60 C 50 120, 150 120, 195 60" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" filter="url(#neon-glow)" />

      <g className="sloth-g-root" transform="translate(0, -15)">
        {/* Body */}
        <path d="M70 75 C 50 110, 150 110, 130 75 Z" fill="url(#sloth-fur-gradient)" stroke="#5D4037" strokeWidth="1.5" />
        
        {/* Head */}
        <circle cx="100" cy="58" r="28" fill="#A1887F" stroke="#795548" strokeWidth="1.5" />
        <path d="M82 55 a 18 18 0 0 1 36 0" fill="#EFEBE9" /> 
        <path d="M90 73 C 95 78, 105 78, 110 73" fill="#CFB9A5" />

        {/* Sunglasses */}
        <g>
          <path d="M75 52 L 125 52 L 122 68 L 78 68 Z" fill="url(#glasses-gradient)" stroke="#000" strokeWidth="1" />
          <path d="M92 52 L 108 52" stroke="hsl(var(--primary))" strokeWidth="1" />
          <path d="M77 55 L 85 66" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1.5" />
          <path d="M123 55 L 115 66" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1.5" />
          <rect className="scan-line" x="76" y="53" width="48" height="1" strokeWidth="1.5" />
        </g>
        
        {/* Nose and mouth */}
        <path d="M98 70 Q 100 73, 102 70" stroke="#4E342E" strokeWidth="1.5" fill="#4E342E" />
        <path d="M95 76 C 100 78, 105 78, 110 76" stroke="#6D4C41" strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* Arms and Claws */}
        <g>
            <path d="M80 80 C 40 70, 30 100, 35 110" stroke="#8D6E63" strokeWidth="18" fill="none" strokeLinecap="round" />
            <path d="M30 110 Q 25 105 30 100" stroke="#FBFAF8" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M35 115 Q 30 110 35 105" stroke="#FBFAF8" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
        <g>
            <path d="M120 80 C 160 70, 170 100, 165 110" stroke="#8D6E63" strokeWidth="18" fill="none" strokeLinecap="round" />
            <path d="M170 110 Q 175 105 170 100" stroke="#FBFAF8" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M165 115 Q 170 110 165 105" stroke="#FBFAF8" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
