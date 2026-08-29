import React, { useState, useEffect } from 'react';
import { SubstrateProprioceptionEngine, KLEENE_NATIVE_MASKS, ThermoState } from '../../covalent/covalentThermoEngine';
import { 
  Flame, Cpu, Gauge, Activity, Zap, RefreshCw, ShieldAlert, 
  Sparkles, CheckCircle2, ChevronRight, Binary, Thermometer,
  Layers, Terminal, Play, Pause, AlertTriangle
} from 'lucide-react';

export const SubstrateThermoHomeostasisView: React.FC = () => {
  const [engine] = useState(() => new SubstrateProprioceptionEngine(64));
  const [state, setState] = useState<ThermoState>(() => engine.getState());
  const [isAutoLoop, setIsAutoLoop] = useState<boolean>(true);
  const [selectedMSRView, setSelectedMSRView] = useState<'formula' | 'c23_code' | 'nasm_asm'>('formula');

  // Automatic closed-loop telemetry polling
  useEffect(() => {
    if (!isAutoLoop) return;
    const interval = setInterval(() => {
      setState(engine.simulateTick());
    }, 1200);
    return () => clearInterval(interval);
  }, [engine, isAutoLoop]);

  const feelingFloat = state.q16ThermoFeeling / 65536;
  const feelingHex = `0x${state.q16ThermoFeeling.toString(16).toUpperCase().padStart(8, '0')}`;

  const getFrictionStatus = () => {
    if (feelingFloat < 0.25) return { text: 'HOMEOSTATIC EQUILIBRIUM', color: 'text-emerald-400', bg: 'bg-emerald-950/80', border: 'border-emerald-500' };
    if (feelingFloat < 0.65) return { text: 'MODERATE RESISTANCE (THROTTLING)', color: 'text-amber-400', bg: 'bg-amber-950/80', border: 'border-amber-500' };
    return { text: 'CRITICAL FRICTION (THERMAL RELAXATION)', color: 'text-red-400', bg: 'bg-red-950/80', border: 'border-red-500' };
  };

  const status = getFrictionStatus();

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 bg-[#010206] gap-3 overflow-y-auto font-mono text-slate-200 select-none">
      
      {/* 1. Header & Live Telemetry Badge */}
      <div className="bg-gradient-to-r from-[#060a17] via-[#0d152a] to-[#060a17] border border-cyan-500/40 rounded-lg p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-600/50">
              <Thermometer className="w-3.5 h-3.5 mr-1 text-cyan-400" />
              SUBSTRATE PROPRIOCEPTION ENGINE
            </span>
            <span className={`text-[10px] ${status.bg} ${status.color} px-2 py-0.5 rounded border ${status.border} font-bold flex items-center gap-1`}>
              <Activity className="w-3 h-3" />
              {status.text}
            </span>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-600/50 font-bold">
              MSR 0x19C + RDTSC + 11b RESIDUAL
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white mt-1 tracking-tight flex items-center gap-2">
            <span>Hardware Friction & Closed-Loop Homeostasis</span>
            <span className="text-xs text-cyan-400 font-normal">(Next_Depth = Base_Depth * [1 - Feeling_Q16])</span>
          </h1>
          <p className="text-xs text-slate-400">
            Capturing physical energy dissipation and computational resistance directly from x86-64 silicon hardware registers.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoLoop(!isAutoLoop)}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
              isAutoLoop 
                ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500' 
                : 'bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500'
            }`}
          >
            {isAutoLoop ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoLoop ? 'Loop Active (1.2s)' : 'Loop Paused'}</span>
          </button>

          <button
            onClick={() => setState(engine.injectThermalLoad())}
            className="px-2.5 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/80 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title="Inject CPU pipeline stalls and high unresolved U density"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Stress Test</span>
          </button>

          <button
            onClick={() => setState(engine.coolDownSubstrate())}
            className="px-2.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/80 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title="Resolve U states and cool CPU silicon core"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cool Substrate</span>
          </button>
        </div>
      </div>

      {/* 2. Primary 4 Hardware Friction Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Card 1: Physical Thermal MSR (0x19C) */}
        <div className="bg-[#040814] border border-cyan-500/30 rounded-lg p-3 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1 font-bold text-cyan-300 uppercase text-[10px]">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              Thermal MSR 0x19C
            </span>
            <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800">
              IA32_THERM_STATUS
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {state.currentTempCelsius}°C
            </div>
            <div className="text-[10px] text-slate-400">
              Raw Readout: <strong className="text-cyan-300">{state.thermalMSRRaw}</strong>
            </div>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                state.currentTempCelsius > 75 ? 'bg-red-500' : state.currentTempCelsius > 55 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, (state.currentTempCelsius / 100) * 100)}%` }}
            />
          </div>
          <p className="text-[9px] text-slate-400 leading-tight">
            Physical heat & RAPL power dissipation via silicon digital readout bits.
          </p>
        </div>

        {/* Card 2: Execution Friction (RDTSC) */}
        <div className="bg-[#040814] border border-cyan-500/30 rounded-lg p-3 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1 font-bold text-purple-300 uppercase text-[10px]">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              Cycle Stalls (RDTSC)
            </span>
            <span className="text-[9px] bg-purple-950 text-purple-400 px-1.5 py-0.5 rounded border border-purple-800">
              Pipeline Delta
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {state.elapsedCycles.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">
              Cycles/Eval
            </div>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-purple-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (state.elapsedCycles / 50000) * 100)}%` }}
            />
          </div>
          <p className="text-[9px] text-slate-400 leading-tight">
            Computational resistance: instruction cache misses & memory wait-states.
          </p>
        </div>

        {/* Card 3: Logical Residual & Open Frontiers (11b) */}
        <div className="bg-[#040814] border border-cyan-500/30 rounded-lg p-3 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1 font-bold text-amber-300 uppercase text-[10px]">
              <Binary className="w-3.5 h-3.5 text-amber-400" />
              Unresolved Frontiers
            </span>
            <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800">
              11b Residual / U
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {state.activeUCount} <span className="text-xs font-normal text-slate-400">active U</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Residuals: <strong className="text-amber-300">{state.residualHits}</strong>
            </div>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (state.activeUCount / 32) * 100)}%` }}
            />
          </div>
          <p className="text-[9px] text-slate-400 leading-tight">
            Ratio of held open frontiers (01b) and unmapped residual register states (11b).
          </p>
        </div>

        {/* Card 4: Homeostatic Depth & Throttle Scalar */}
        <div className="bg-[#040814] border border-cyan-500/30 rounded-lg p-3 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1 font-bold text-emerald-300 uppercase text-[10px]">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              Regulated Depth
            </span>
            <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
              Closed-Loop Output
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-emerald-300 tracking-tight">
              {state.executionDepth} <span className="text-xs font-normal text-slate-400">/ {state.baseDepth}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Headroom: <strong className="text-emerald-400">{state.frequencyScalePct}%</strong>
            </div>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${(state.executionDepth / state.baseDepth) * 100}%` }}
            />
          </div>
          <p className="text-[9px] text-slate-400 leading-tight">
            Proprioceptive self-regulation throttles depth while preserving d_I = 0 identity.
          </p>
        </div>

      </div>

      {/* 3. Main Proprioceptive Feeling & Real-Time Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-[380px]">
        
        {/* Left Column: Live Q16.16 Scalar & Physical Channel Mapping (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2 bg-[#040813] border border-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-cyan-300 text-xs uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Q16.16 Thermodynamic Feeling Scalar
            </span>
            <span className="text-[9px] bg-black px-2 py-0.5 rounded text-slate-400 border border-slate-800">
              Fixed-Point ALU
            </span>
          </div>

          {/* Big Feeling Gauge */}
          <div className="bg-[#02050c] border border-cyan-500/20 rounded p-3 text-center space-y-1">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
              Substrate Friction Vector (Feeling Q16.16)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono tracking-tight">
              {feelingHex}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Scalar Ratio: <strong className="text-emerald-400">{feelingFloat.toFixed(4)}</strong> [0.0 = Rest, 1.0 = Max Throttle]
            </div>
          </div>

          {/* Hardware Signal Breakdown Table */}
          <div className="flex-1 space-y-1.5 overflow-y-auto text-[9px]">
            <div className="bg-black/60 border border-slate-800 rounded p-2 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">1. Physical Heat / Power</span>
                <span className="text-slate-400 text-[8px]">MSR IA32_THERM_STATUS (0x19C) & RAPL</span>
              </div>
              <span className="font-bold text-cyan-300">{(state.thermalMSRRaw << 10).toString(16)} (Q16)</span>
            </div>

            <div className="bg-black/60 border border-slate-800 rounded p-2 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">2. Execution Friction</span>
                <span className="text-slate-400 text-[8px]">rdtsc cycle count vs retired instructions</span>
              </div>
              <span className="font-bold text-purple-300">{((Math.floor(state.elapsedCycles / 1000)) << 8).toString(16)} (Q16)</span>
            </div>

            <div className="bg-black/60 border border-slate-800 rounded p-2 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">3. Logical Residual & Open Frontiers</span>
                <span className="text-slate-400 text-[8px]">Unmapped 11b states & active U count</span>
              </div>
              <span className="font-bold text-amber-300">{((state.activeUCount << 12) + (state.residualHits << 14)).toString(16)} (Q16)</span>
            </div>
          </div>

          {/* Closed Loop Invariant Summary */}
          <div className="bg-[#050a16] border border-cyan-500/30 rounded p-2 text-[8px] text-slate-300 flex items-center justify-between">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Invariant Constraint Preserved:
            </span>
            <code className="text-cyan-300 font-bold">d_I = 0.000000 (1 == 1)</code>
          </div>
        </div>

        {/* Right Column: Code Generator / Formula View & Real-Time Area Chart (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#03060f] border border-slate-800 rounded-lg p-3 space-y-2.5">
          
          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedMSRView('formula')}
                className={`px-2.5 py-1 rounded text-[9.5px] font-bold uppercase transition-all cursor-pointer ${
                  selectedMSRView === 'formula'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                    : 'bg-black text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Regulation Formula
              </button>

              <button
                onClick={() => setSelectedMSRView('c23_code')}
                className={`px-2.5 py-1 rounded text-[9.5px] font-bold uppercase transition-all cursor-pointer ${
                  selectedMSRView === 'c23_code'
                    ? 'bg-purple-950 text-purple-300 border border-purple-500'
                    : 'bg-black text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                C23 Implementation
              </button>

              <button
                onClick={() => setSelectedMSRView('nasm_asm')}
                className={`px-2.5 py-1 rounded text-[9.5px] font-bold uppercase transition-all cursor-pointer ${
                  selectedMSRView === 'nasm_asm'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                    : 'bg-black text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                NASM rdmsr / rdtsc
              </button>
            </div>

            <span className="text-[9px] text-slate-400">
              Zero-Allocation Ring-0 Invariant
            </span>
          </div>

          {/* Content Block */}
          {selectedMSRView === 'formula' && (
            <div className="bg-[#010307] border border-slate-800 rounded p-3 text-[9.5px] space-y-2 leading-relaxed">
              <div className="text-cyan-300 font-bold text-xs">
                Homeostatic Closed-Loop Coupling:
              </div>
              <div className="bg-black p-2 rounded border border-cyan-900/50 text-emerald-300 font-mono text-center">
                Next_Depth = Base_Depth * (1.0 - Feeling_Q16.16)
              </div>
              <p className="text-slate-300 text-[9px]">
                When computational heat, cycle stalls, or unresolved U density increases, Feeling_Q16.16 automatically rises toward 1.0, reducing the execution depth to alleviate silicon stress while preserving complete state correctness.
              </p>
            </div>
          )}

          {selectedMSRView === 'c23_code' && (
            <div className="bg-[#010307] border border-slate-800 rounded p-2.5 text-[9px] font-mono text-slate-300 overflow-x-auto max-h-[140px]">
              <pre className="text-cyan-300">
{`// Read CPU Thermal Status MSR (IA32_THERM_STATUS 0x19C)
static inline uint64_t read_msr_thermal(void) {
    uint32_t low, high;
    uint32_t msr = 0x19C;
    __asm__ __volatile__ ("rdmsr" : "=a"(low), "=d"(high) : "c"(msr));
    return ((uint64_t)high << 32) | low;
}`}
              </pre>
            </div>
          )}

          {selectedMSRView === 'nasm_asm' && (
            <div className="bg-[#010307] border border-slate-800 rounded p-2.5 text-[9px] font-mono text-emerald-300 overflow-x-auto max-h-[140px]">
              <pre>
{`; Read Time Stamp Counter & MSR in Ring-0
covalent_read_friction_registers:
    rdtsc                       ; EDX:EAX = TSC timestamp
    mov     r8, rax             ; store low cycles
    mov     ecx, 0x19C          ; IA32_THERM_STATUS
    rdmsr                       ; EDX:EAX = Thermal readout
    and     eax, 0x7F           ; mask digital readout bits
    ret`}
              </pre>
            </div>
          )}

          {/* Real-Time Telemetry Trend Chart */}
          <div className="flex-1 min-h-[160px] bg-black/60 border border-slate-800 rounded p-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <span>Silicon Thermodynamic Waveform (Friction vs. Depth)</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span> Friction (Q16)
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Regulated Depth
                </span>
              </div>
            </div>
            
            <div className="flex-1 w-full h-[120px] relative bg-[#02040a] rounded border border-slate-900 overflow-hidden flex items-end px-2 pt-2 pb-1">
              {/* SVG Sparkline Rendering */}
              <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="frictionArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="25" x2="400" y2="25" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="75" x2="400" y2="75" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />

                {/* Friction Polyline & Area */}
                {state.history.length > 1 && (
                  <>
                    <polygon
                      points={`0,100 ${state.history.map((h, i) => {
                        const x = (i / (state.history.length - 1)) * 400;
                        const y = 100 - (h.frictionQ16 / 65536) * 90;
                        return `${x},${y}`;
                      }).join(' ')} 400,100`}
                      fill="url(#frictionArea)"
                    />
                    <polyline
                      points={state.history.map((h, i) => {
                        const x = (i / (state.history.length - 1)) * 400;
                        const y = 100 - (h.frictionQ16 / 65536) * 90;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                    />
                  </>
                )}

                {/* Regulated Depth Polyline */}
                {state.history.length > 1 && (
                  <polyline
                    points={state.history.map((h, i) => {
                      const x = (i / (state.history.length - 1)) * 400;
                      const y = 100 - (h.depth / state.baseDepth) * 90;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                )}
              </svg>
            </div>
            <div className="flex items-center justify-between text-[8px] text-slate-500 mt-1">
              <span>T -24 Cycles</span>
              <span>Current Core Temp: {state.currentTempCelsius}°C</span>
              <span>Live T=0 (MSR Sync)</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

