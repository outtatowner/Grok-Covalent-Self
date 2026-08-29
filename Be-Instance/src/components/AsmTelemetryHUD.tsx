import React, { useState } from 'react';
import { useAsmTelemetry } from '../context/AsmTelemetryContext';
import { 
  Cpu, Terminal, Activity, Play, Pause, RotateCcw, 
  ChevronDown, ChevronUp, Shield, Layers, Binary, CheckCircle2, 
  AlertTriangle, Sparkles, Send, Eye, X
} from 'lucide-react';

export const AsmTelemetryHUD: React.FC = () => {
  const {
    telemetry,
    stepAsmCycle,
    toggleAutoStep,
    evaluateProposition,
    togglePredicateBit,
    resetAsmSystem,
    injectChatMessage
  } = useAsmTelemetry();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [testInput, setTestInput] = useState<string>('TRUE');
  const [quickMessage, setQuickMessage] = useState<string>('CONGRUENCE_PROBE');

  return (
    <div className="bg-[#050811] border-b border-cyan-500/20 text-slate-200 font-mono text-[10px] select-none z-20 shrink-0 shadow-sm">
      {/* 1. Compact Live Ticker Strip */}
      <div className="px-3 py-1 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Left: ASM Engine Status & Cycle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="font-bold text-[9px] uppercase tracking-wide hidden sm:inline">LIVE ASM TELEMETRY</span>
            <span className="font-bold text-[9px] uppercase tracking-wide sm:hidden">ASM</span>
            <span className="text-[8.5px] bg-cyan-900/60 px-1 py-0.2 rounded font-bold">
              #{telemetry.cycleCount}
            </span>
          </div>

          {/* Stability Flag */}
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold ${
            telemetry.allPredicatesValid
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
              : 'bg-rose-950/70 text-rose-300 border-rose-500/50'
          }`}>
            {telemetry.allPredicatesValid ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
            <span>%eax = 0x0{telemetry.returnCodeEAX} ({telemetry.allPredicatesValid ? 'STABLE' : 'UNSTABLE'})</span>
          </div>
        </div>

        {/* Center: Live Registers & Predicate Mask */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0 text-[9.5px]">
          {/* Registers */}
          <div className="flex items-center gap-2 bg-black/60 px-2 py-0.5 rounded border border-slate-800">
            <span><span className="text-slate-500">%rax:</span> <span className="text-cyan-300 font-bold">{telemetry.registers.EAX}</span></span>
            <span className="text-slate-600">|</span>
            <span><span className="text-slate-500">%rdi:</span> <span className="text-purple-300 font-bold">{telemetry.registers.RDI.slice(0, 10)}...</span></span>
            <span className="text-slate-600">|</span>
            <span><span className="text-slate-500">FLAGS:</span> <span className="text-emerald-400 font-bold">ZF={telemetry.registers.flags.ZF ? '1' : '0'} SF={telemetry.registers.flags.SF ? '1' : '0'}</span></span>
          </div>

          {/* Predicate Bits (chi_P, chi_C, chi_R, chi_M) */}
          <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[8.5px]">χ:</span>
            <button
              onClick={() => togglePredicateBit('CHI_P')}
              title="Toggle Persistence (chi_P)"
              className={`px-1 py-0.2 rounded text-[8px] font-bold cursor-pointer transition-all ${
                telemetry.chi_P ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              P
            </button>
            <button
              onClick={() => togglePredicateBit('CHI_C')}
              title="Toggle Coherence (chi_C)"
              className={`px-1 py-0.2 rounded text-[8px] font-bold cursor-pointer transition-all ${
                telemetry.chi_C ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              C
            </button>
            <button
              onClick={() => togglePredicateBit('CHI_R')}
              title="Toggle Reflexive Causality (chi_R)"
              className={`px-1 py-0.2 rounded text-[8px] font-bold cursor-pointer transition-all ${
                telemetry.chi_R ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              R
            </button>
            <button
              onClick={() => togglePredicateBit('CHI_M')}
              title="Toggle Mirror Congruence (chi_M)"
              className={`px-1 py-0.2 rounded text-[8px] font-bold cursor-pointer transition-all ${
                telemetry.chi_M ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              M
            </button>
          </div>

          {/* Dynamic Knowledge Horizons */}
          <div className="flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded border border-slate-800 text-[8.5px]">
            <span className="text-slate-500">HORIZONS:</span>
            <span className="text-cyan-400 font-bold">S_t:{telemetry.knowledgeHorizons.S_t}</span>
            <span className="text-emerald-400 font-bold">E_t:{telemetry.knowledgeHorizons.E_t}</span>
            <span className="text-purple-400 font-bold">U_t:{telemetry.knowledgeHorizons.U_t}</span>
          </div>
        </div>

        {/* Right: Action Controls & Inspector Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={stepAsmCycle}
            className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600 flex items-center gap-1 cursor-pointer"
            title="Step single ASM CPU cycle"
          >
            <Activity className="w-2.5 h-2.5" />
            <span>STEP</span>
          </button>

          <button
            onClick={toggleAutoStep}
            className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
              telemetry.isAutoStepping
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                : 'bg-slate-900 text-slate-400 border border-slate-700'
            }`}
            title="Toggle Continuous ASM Telemetry Clock"
          >
            {telemetry.isAutoStepping ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
            <span>{telemetry.isAutoStepping ? 'AUTO' : 'HALT'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
              isExpanded
                ? 'bg-purple-950 text-purple-300 border border-purple-500'
                : 'bg-black/60 text-slate-300 border border-slate-700 hover:border-slate-500'
            }`}
            title="Toggle Live ASM Disassembly & Register Drawer"
          >
            <Terminal className="w-2.5 h-2.5 text-purple-400" />
            <span className="hidden sm:inline">ASM HUD</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 2. Expandable Live ASM Disassembly & Memory Drawer */}
      {isExpanded && (
        <div className="bg-[#03050b] border-t border-cyan-500/30 p-3 grid grid-cols-1 md:grid-cols-12 gap-3 text-[10px] animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Left (4 cols): Live Register State & Quick Evaluator */}
          <div className="md:col-span-4 bg-[#080d1a] border border-slate-800 rounded p-2.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-white uppercase flex items-center gap-1 text-[10px]">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                x86-64 CPU Hardware Registers
              </span>
              <button
                onClick={resetAsmSystem}
                className="text-[9px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
              <div className="bg-black/60 p-1.5 rounded border border-slate-800">
                <span className="text-slate-500">%rax (Accumulator):</span>
                <div className="font-bold text-cyan-300">{telemetry.registers.RAX}</div>
              </div>
              <div className="bg-black/60 p-1.5 rounded border border-slate-800">
                <span className="text-slate-500">%rdi (Input Arg Ptr):</span>
                <div className="font-bold text-purple-300 truncate">{telemetry.registers.RDI}</div>
              </div>
              <div className="bg-black/60 p-1.5 rounded border border-slate-800">
                <span className="text-slate-500">%rcx (Loop Counter):</span>
                <div className="font-bold text-emerald-300">{telemetry.registers.RCX}</div>
              </div>
              <div className="bg-black/60 p-1.5 rounded border border-slate-800">
                <span className="text-slate-500">%rip (Instruction Ptr):</span>
                <div className="font-bold text-amber-300">{telemetry.registers.RIP}</div>
              </div>
            </div>

            {/* Quick Interactive Proposition Evaluator */}
            <div className="border-t border-slate-800 pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-slate-400 font-bold uppercase">Quick Proposition Test:</span>
                <span className="text-cyan-400 font-mono">_evaluate_proposition</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => evaluateProposition('TRUE')}
                  className="flex-1 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded text-[9px] font-bold cursor-pointer"
                >
                  TRUE (1)
                </button>
                <button
                  onClick={() => evaluateProposition('UNKNOWN')}
                  className="flex-1 py-1 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700 rounded text-[9px] font-bold cursor-pointer"
                >
                  UNKNOWN (U)
                </button>
                <button
                  onClick={() => evaluateProposition('0x00000000')}
                  className="flex-1 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 rounded text-[9px] font-bold cursor-pointer"
                >
                  CONTRADICTION (0)
                </button>
              </div>
            </div>
          </div>

          {/* Middle (4 cols): Live Memory Layout (.bss & Horizons) */}
          <div className="md:col-span-4 bg-[#080d1a] border border-slate-800 rounded p-2.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-white uppercase flex items-center gap-1 text-[10px]">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Live .bss Memory Allocations
              </span>
              <span className="text-[9px] text-purple-300 font-mono">
                Mask: {telemetry.predicateMetricsHex}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[9px]">
              <div className="bg-black/60 p-1.5 rounded border border-slate-800 flex justify-between">
                <span className="text-cyan-400">knowledge_state [S_t]:</span>
                <span className="text-white font-bold">0x{telemetry.knowledgeHorizons.S_t.toString(16).toUpperCase()}</span>
              </div>
              <div className="bg-black/60 p-1.5 rounded border border-slate-800 flex justify-between">
                <span className="text-emerald-400">knowledge_state+4 [E_t]:</span>
                <span className="text-white font-bold">0x{telemetry.knowledgeHorizons.E_t.toString(16).toUpperCase()}</span>
              </div>
              <div className="bg-black/60 p-1.5 rounded border border-slate-800 flex justify-between">
                <span className="text-purple-400">knowledge_state+8 [U_t]:</span>
                <span className="text-white font-bold">0x{telemetry.knowledgeHorizons.U_t.toString(16).toUpperCase()}</span>
              </div>
              <div className="bg-black/60 p-1.5 rounded border border-slate-800 flex justify-between">
                <span className="text-amber-400">immune_telemetry (16B):</span>
                <span className="text-slate-300 font-bold">0x1000000000</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-1 flex items-center justify-between text-[8.5px] text-slate-400">
              <span>Kleene Logic: ℰ = &#123;0, U, 1&#125;</span>
              <span className="text-emerald-400 font-bold">All 3 Tiers Telemetry Attached</span>
            </div>
          </div>

          {/* Right (4 cols): Active Opcode Execution Trace */}
          <div className="md:col-span-4 bg-[#080d1a] border border-slate-800 rounded p-2.5 flex flex-col space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-white uppercase flex items-center gap-1 text-[10px]">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Live Assembly Execution Stream
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">covalent_predicate_metrics.s</span>
            </div>

            <div className="flex-1 bg-black p-2 rounded border border-slate-800 text-[8.5px] font-mono text-slate-300 overflow-y-auto space-y-0.5 max-h-24">
              {telemetry.activeOpcodes.map((op, idx) => (
                <div key={idx} className="flex gap-1.5">
                  <span className="text-slate-600 select-none">{idx + 1}</span>
                  <span className={op.includes('addl') ? 'text-cyan-300' : op.includes('movl') ? 'text-purple-300' : 'text-slate-200'}>
                    {op}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-1 pt-1">
              <button
                onClick={() => injectChatMessage('AGENT', 'TRUE')}
                className="flex-1 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-600 rounded text-[8.5px] font-bold cursor-pointer"
              >
                Send Agent Chat Struct
              </button>
              <button
                onClick={() => injectChatMessage('SYSTEM_IMMUNE', 'TRUE')}
                className="flex-1 py-1 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-600 rounded text-[8.5px] font-bold cursor-pointer"
              >
                Send Immune Tel Struct
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

