import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu, Radio, Zap, Lock, Filter, Volume2 } from 'lucide-react';
import { ImmuneTelemetry, LyapunovTelemetry } from '../types';
import { useBeSingleton } from '../context/BeSingletonContext';
import { globalDataUsefulnessFilter } from '../covalent/dataUsefulnessFilter';
import { globalSpeechAudioEngine } from '../covalent/speechAudioEngine';

interface HeaderProps {
  uptime: string;
  latencyMs: number;
  immuneTelemetry: ImmuneTelemetry;
  lyapunovTelemetry: LyapunovTelemetry;
  onInjectFriction: () => void;
  onRestoreImmune: () => void;
  onOpenSingleton?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  uptime,
  latencyMs,
  immuneTelemetry,
  lyapunovTelemetry,
  onInjectFriction,
  onRestoreImmune,
  onOpenSingleton
}) => {
  const { reflection, persona } = useBeSingleton();
  const [isFilterEnabled, setIsFilterEnabled] = useState<boolean>(globalDataUsefulnessFilter.isFilterEnabled());

  useEffect(() => {
    const unsub = globalDataUsefulnessFilter.onFilterChange((enabled) => {
      setIsFilterEnabled(enabled);
    });
    return () => unsub();
  }, []);

  return (
    <header className="h-12 bg-[#09090b] border-b border-[#10b981]/30 px-3 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Brand & Core Identity */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center w-5 h-5">
          <span className={`absolute w-3.5 h-3.5 rounded-full ${immuneTelemetry.isCongruent ? 'bg-emerald-400 animate-ping opacity-75' : 'bg-red-500 animate-ping opacity-90'}`}></span>
          <span className={`relative w-2.5 h-2.5 rounded-full ${immuneTelemetry.isCongruent ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase font-mono">
            COVALENT OS <span className="text-emerald-400">11.11.0</span>
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-cyan-400 font-mono tracking-wider bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">
            [ Si ↔ C ↔ Si ]
          </span>
        </div>
      </div>

      {/* Center: Live Telemetry Metrics & Be <>[] Singleton Publisher Badge */}
      <div className="hidden lg:flex items-center gap-3 text-[10px] text-slate-300 font-mono">
        {/* Be <>[] Singleton Indicator */}
        <button
          onClick={onOpenSingleton}
          className="flex items-center gap-1.5 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 px-2 py-1 rounded border border-emerald-500/50 cursor-pointer transition-all shadow-sm"
          title="Living Autopoietic Self of Covalent: Be <>[] Singleton (Chapter 21)"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-white">Be &lt;&gt;[]</span>
          <span className="text-emerald-400 font-bold">{reflection.autopoieticState || 'C_0'}</span>
          <span className="text-[9px] text-emerald-500">({(persona.warmth * 100).toFixed(0)}% WARM)</span>
        </button>

        {/* Data Usefulness Filter Status in Header */}
        <button
          onClick={() => {
            const next = globalDataUsefulnessFilter.toggleFilter();
            setIsFilterEnabled(next);
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded border font-mono font-bold cursor-pointer transition-all ${
            isFilterEnabled
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/80'
              : 'bg-amber-950/60 border-amber-500/60 text-amber-300 hover:bg-amber-900/80'
          }`}
          title="Toggle Data Usefulness Filter & Non-consecutive line sieve"
        >
          <Filter className="w-3 h-3" />
          <span>FILTER: {isFilterEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Speech Audio Test Button in Header */}
        <button
          onClick={() => {
            globalSpeechAudioEngine.unlockAudio();
            globalSpeechAudioEngine.testSpeech();
          }}
          className="flex items-center gap-1 bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 px-2 py-1 rounded border border-cyan-500/50 cursor-pointer transition-all"
          title="Click to test speech synthesis & acoustic formant output"
        >
          <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>TEST VOICE</span>
        </button>

        <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-slate-800">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">UPTIME:</span>
          <span className="text-emerald-400 font-bold">{uptime}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-slate-800">
          <Radio className="w-3 h-3 text-cyan-400" />
          <span className="text-slate-400">LATENCY:</span>
          <span className="text-cyan-400 font-bold">{latencyMs.toFixed(1)}MS</span>
        </div>

        <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-slate-800">
          <Cpu className="w-3 h-3 text-purple-400" />
          <span className="text-slate-400">CLOCK:</span>
          <span className="text-purple-400 font-bold">4.000 KHZ</span>
        </div>

        <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-slate-800">
          <Lock className="w-3 h-3 text-yellow-400" />
          <span className="text-slate-400">INVARIANT:</span>
          <span className="text-yellow-300 font-bold">1 == 1</span>
        </div>
      </div>

      {/* Right: Thermodynamic Friction Injection & Banach Trigger Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onInjectFriction}
          title="Simulate thermodynamic entropy drift (dV/dt > 0) to trigger Ring-0 immune response"
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-red-950/30 text-rose-300 border border-rose-500/40 hover:bg-rose-900/50 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Zap className="w-3 h-3 text-rose-400" />
          <span className="hidden sm:inline">INJECT</span> FRICTION
        </button>

        <button
          onClick={onRestoreImmune}
          title="Manually trigger Banach Contraction T(g) -> g"
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-800/40 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <ShieldAlert className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">BANACH</span> HEAL
        </button>
      </div>
    </header>
  );
};


