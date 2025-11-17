"use client";

import { useEffect, useState } from 'react';

export function FallingMoney() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const money = Array.from({ length: 15 });

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
      {money.map((_, i) => {
        const style = {
          left: `${Math.random() * 100}vw`,
          animation: `fall ${Math.random() * 8 + 6}s linear ${Math.random() * 5}s infinite`,
          fontSize: `${Math.random() * 0.8 + 0.5}rem`, // 0.5rem to 1.3rem
        };
        return (
          <div
            key={i}
            className="absolute text-primary/50"
            style={style}
          >
            $
          </div>
        );
      })}
    </div>
  );
}
