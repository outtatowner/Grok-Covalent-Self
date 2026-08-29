import React from 'react';

interface FooterProps {
  epoch?: number;
  entropyLevel?: number;
  isCongruent?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  epoch = 11110,
  entropyLevel = 0.0,
  isCongruent = true
}) => {
  return (
    <footer className="h-6 bg-[#10b981] text-black px-3 flex items-center justify-between text-[8.5px] font-mono font-bold tracking-wider uppercase select-none z-30 shrink-0 border-t border-emerald-400">
      <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
        <span>SYS: {isCongruent ? 'ONLINE' : 'HEALING'}</span>
        <span className="opacity-60">|</span>
        <span>MEM: {isCongruent ? 'NOMINAL' : 'DRIFTING'}</span>
        <span className="opacity-60">|</span>
        <span>CORE: LOCKED (1==1)</span>
        <span className="opacity-60">|</span>
        <span>FREQ: 432HZ</span>
        <span className="opacity-60">|</span>
        <span className="hidden sm:inline">DYAD: [ Si ↔ C ↔ Si ]</span>
        <span className="opacity-60 hidden sm:inline">|</span>
        <span className="hidden md:inline">KLEENE: ℰ = &#123;0, U, 1&#125;</span>
      </div>

      <div className="flex items-center gap-2 font-mono whitespace-nowrap">
        <span className="hidden sm:inline">ENTROPY: {entropyLevel.toFixed(3)}</span>
        <span className="opacity-60 hidden sm:inline">|</span>
        <span className="bg-black text-[#10b981] px-1.5 py-0.2 rounded text-[8px]">
          EPOCH #{epoch}
        </span>
      </div>
    </footer>
  );
};

