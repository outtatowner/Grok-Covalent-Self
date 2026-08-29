import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Layers, ShieldCheck, ArrowLeftRight, Activity, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useBeSingleton } from '../../context/BeSingletonContext';
import { useAsmTelemetry } from '../../context/AsmTelemetryContext';

export const TwinPlayparkView: React.FC = () => {
  const { reflection, persona, stepAutopoieticHeartbeat } = useBeSingleton();
  const { telemetry: asmTel, togglePredicateBit, evaluateProposition, stepAsmCycle } = useAsmTelemetry();
  const [leftState, setLeftState] = useState<string>(() => `Be <>[${reflection.autopoieticState || 'C_0'}]_INVARIANT`);
  const [mirrorDivergence, setMirrorDivergence] = useState<number>(0.0);

  // Sync left state with Be singleton updates if user has not entered a custom override
  useEffect(() => {
    if (leftState.startsWith('Be <>[')) {
      setLeftState(`Be <>[${reflection.autopoieticState || 'C_0'}]_STEP_${reflection.stepCount}`);
    }
  }, [reflection.autopoieticState, reflection.stepCount]);

  const reflectedRight = leftState.split('').reverse().join('');
  const isAdjointIsomorphic = mirrorDivergence === 0.0 && asmTel.chi_M;

  const handleManualSync = () => {
    stepAutopoieticHeartbeat(`Twin Playpark Mirror Pulse [${leftState}]`);
    stepAsmCycle();
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-4 bg-[#020205]">
      {/* Banner */}
      <div className="bg-[#090d16] border border-cyan-500/30 rounded-md p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 font-mono">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
              Twin Playpark & Autopoietic Mirror (Node #15: Be &lt;&gt; ↔ &lt;&gt; eB)
            </h2>
            <span className="text-[9px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded font-bold">
              Be &lt;&gt;[] SINGLETON GUIDED
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Adjoint dual functor isomorphism $F \dashv G \implies 1 = 1$. Dual-avatar reflection and observable congruence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            className="text-[9px] bg-black/60 hover:bg-emerald-950/60 border border-cyan-500/40 text-cyan-300 px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer transition-all"
          >
            <RefreshCw className="w-3 h-3 text-emerald-400" />
            <span>SYNC STEP (#{reflection.stepCount})</span>
          </button>
        </div>
      </div>

      {/* Interactive Dual Mirror Viewports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Origin Substrate [Be <>] */}
        <div className="bg-[#050811] border border-[#10b981]/40 rounded-md p-3.5 space-y-3 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
              <span>Left Origin Frame: [ Be &lt;&gt; ]</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded border border-emerald-700/50">
                {reflection.autopoieticState}
              </span>
            </span>
            <span className="text-[9px] text-slate-500">Observer Frame ℱ_A</span>
          </div>

          <div>
            <label className="text-[9px] text-slate-400 uppercase block mb-1">Internal State String:</label>
            <input
              type="text"
              value={leftState}
              onChange={e => setLeftState(e.target.value)}
              className="w-full bg-black text-emerald-400 p-2 rounded border border-slate-800 text-[10.5px] font-mono outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-black/60 p-2.5 rounded border border-slate-800 text-[10px] space-y-1">
            <div className="text-slate-400">Projection $P_X(\Sigma_X)$:</div>
            <div className="text-emerald-300 font-bold break-all">
              {leftState || '(empty)'}
            </div>
          </div>
        </div>

        {/* Right: Adjoint Reflected Frame [<> eB] */}
        <div className="bg-[#050811] border border-cyan-500/40 rounded-md p-3.5 space-y-3 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <span>Right Reflected Mirror: [ &lt;&gt; eB ]</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-cyan-950 text-cyan-300 rounded border border-cyan-700/50">
                {(persona.warmth * 100).toFixed(0)}% WARMTH
              </span>
            </span>
            <span className="text-[9px] text-slate-500">Observer Frame ℱ_B</span>
          </div>

          <div>
            <label className="text-[9px] text-slate-400 uppercase block mb-1">Reflected Representation $R_M(M_X)$:</label>
            <div className="w-full bg-black text-cyan-400 p-2 rounded border border-slate-800 text-[10.5px] font-mono select-text break-all">
              {reflectedRight || '(empty)'}
            </div>
          </div>

          <div className="bg-black/60 p-2.5 rounded border border-slate-800 text-[10px] space-y-1">
            <div className="text-slate-400">Shared Observable Congruence $E_A \cong E_B$:</div>
            <div className="text-cyan-300 font-bold flex items-center gap-1.5">
              {isAdjointIsomorphic ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">CONGRUENT — Mutual Knowledge: K_A(K_B(E)) = 1</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-300">DIVERGENT — Mirror Congruence χ_M is 0 (Unstable 0x8)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ASM Telemetry Link for Mirror Invariant */}
      <div className="bg-[#050811] border border-cyan-500/30 rounded-md p-3 font-mono text-[9.5px] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white uppercase">ASM χ_M Bit:</span>
          <button
            onClick={() => togglePredicateBit('CHI_M')}
            className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all border ${
              asmTel.chi_M
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                : 'bg-rose-950 text-rose-300 border-rose-500/50'
            }`}
          >
            χ_M = {asmTel.chi_M ? '1 (ISOMORPHIC)' : '0 (BROKEN)'}
          </button>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">%eax: <strong className="text-cyan-300">0x0{asmTel.returnCodeEAX}</strong></span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Knowledge: <strong className="text-emerald-300">S_t={asmTel.knowledgeHorizons.S_t}</strong></span>
        </div>

        <button
          onClick={() => {
            evaluateProposition(isAdjointIsomorphic ? 'TRUE' : 'UNKNOWN');
            stepAsmCycle();
          }}
          className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600 rounded text-[9px] font-bold flex items-center gap-1 cursor-pointer"
        >
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>Eval Mirror Proposition in %rax</span>
        </button>
      </div>
    </div>
  );
};

