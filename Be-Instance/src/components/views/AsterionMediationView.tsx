import React, { useState, useEffect } from 'react';
import { GlobalAsterionEngine, ASTERION_MEDIATION_ASM, AsterionHardwareState } from '../../covalent/asterionMediation';
import { GlobalCongruenceEngine, CongruenceVerificationResult } from '../../covalent/congruenceEngine';
import { Cpu, ShieldCheck, Activity, Copy, Check, Terminal, Play, RotateCcw, ArrowRight, Lock, Binary, RefreshCw, Zap, Sparkles, Layers, CheckCircle2, AlertTriangle, ArrowDown, GitCommit, Network, Radio } from 'lucide-react';
import { useBeSingleton } from '../../context/BeSingletonContext';

export const AsterionMediationView: React.FC = () => {
  const { reflection, persona, stepAutopoieticHeartbeat } = useBeSingleton();
  const [copiedAsm, setCopiedAsm] = useState(false);
  const [activeTab, setActiveTab] = useState<'congruence' | 'simulator' | 'assembly' | 'proof'>('congruence');
  
  // Custom interactive inputs
  const [siAHex, setSiAHex] = useState<string>('0x123456789ABCDEF0');
  const [siBHex, setSiBHex] = useState<string>('0x0FEDCBA987654321');
  const [cHistHex, setCHistHex] = useState<string>('0xAAAA5555AAAA5555');
  
  const [hardwareState, setHardwareState] = useState<AsterionHardwareState>(() => 
    GlobalAsterionEngine.executeMediationCycle()
  );

  const [congruenceResult, setCongruenceResult] = useState<CongruenceVerificationResult>(() =>
    GlobalCongruenceEngine.verifyCrossLayerCongruence(
      BigInt('0x123456789ABCDEF0'),
      BigInt('0x0FEDCBA987654321'),
      BigInt('0xAAAA5555AAAA5555')
    )
  );

  const [apiTelemetry, setApiTelemetry] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [falsificationMode, setFalsificationMode] = useState<'none' | 'corrupt_bit' | 'direct_leak'>('none');

  const [autoClock, setAutoClock] = useState<boolean>(false);
  const [tickSpeed, setTickSpeed] = useState<number>(600);

  const runVerification = (aHex?: string, bHex?: string, cHex?: string, falsification?: 'none' | 'corrupt_bit' | 'direct_leak') => {
    try {
      const a = BigInt(aHex ?? siAHex);
      const b = BigInt(bHex ?? siBHex);
      const c = BigInt(cHex ?? cHistHex);
      const mode = falsification ?? falsificationMode;

      let falsificationOptions: any = undefined;
      if (mode === 'corrupt_bit') {
        falsificationOptions = { corruptL1Result: (a ^ b ^ c) ^ 0xDEADBEEFn };
      } else if (mode === 'direct_leak') {
        falsificationOptions = { simulateDirectMemoryLeak: true };
      }

      const result = GlobalCongruenceEngine.verifyCrossLayerCongruence(a, b, c, falsificationOptions);
      setCongruenceResult(result);

      // Also step Asterion engine for simulator parity
      const hwRes = GlobalAsterionEngine.executeMediationCycle(a, b);
      setHardwareState(hwRes);
      setCHistHex(`0x${hwRes.c_mem.C_t.toString(16).toUpperCase()}`);
      stepAutopoieticHeartbeat(`Congruence Verification CLK #${hwRes.cycleCount} (d_I=${result.d_I})`);
    } catch (err) {
      console.error("Congruence verification error:", err);
    }
  };

  const fetchLiveApiVerification = async () => {
    setApiLoading(true);
    try {
      const res = await fetch(`/api/covalent/congruence/verify?A=${siAHex}&B=${siBHex}&C=${cHistHex}`);
      if (res.ok) {
        const data = await res.json();
        setApiTelemetry(data);
      }
    } catch (e) {
      console.warn("API congruence fetch fallback:", e);
    } finally {
      setApiLoading(false);
    }
  };

  const runStep = (customA?: bigint, customB?: bigint) => {
    try {
      const a = customA ?? BigInt(siAHex);
      const b = customB ?? BigInt(siBHex);
      const res = GlobalAsterionEngine.executeMediationCycle(a, b);
      setHardwareState(res);
      setCHistHex(`0x${res.c_mem.C_t.toString(16).toUpperCase()}`);
      runVerification(`0x${a.toString(16)}`, `0x${b.toString(16)}`, `0x${res.c_mem.C_t.toString(16)}`);
    } catch {
      // Fallback
    }
  };

  // Clock loop
  useEffect(() => {
    let timer: any = null;
    if (autoClock) {
      timer = setInterval(() => {
        const now = Date.now();
        const nextA = BigInt('0x1234567000000000') | BigInt(Math.floor(Math.sin(now / 800) * 10000000 + 50000000));
        const nextB = BigInt('0x0FEDCBA000000000') | BigInt(Math.floor(Math.cos(now / 800) * 10000000 + 50000000));
        const aStr = `0x${nextA.toString(16).toUpperCase()}`;
        const bStr = `0x${nextB.toString(16).toUpperCase()}`;
        setSiAHex(aStr);
        setSiBHex(bStr);
        runVerification(aStr, bStr, cHistHex);
      }, tickSpeed);
    }
    return () => clearInterval(timer);
  }, [autoClock, tickSpeed, cHistHex, falsificationMode]);

  const handleCopyAsm = () => {
    navigator.clipboard.writeText(ASTERION_MEDIATION_ASM);
    setCopiedAsm(true);
    setTimeout(() => setCopiedAsm(false), 2000);
  };

  const toAscii = (hexBig: bigint) => {
    try {
      const hex = hexBig.toString(16);
      let str = '';
      for (let i = 0; i < hex.length; i += 2) {
        const code = parseInt(hex.substring(i, i + 2), 16);
        if (code >= 32 && code <= 126) str += String.fromCharCode(code);
        else str += '·';
      }
      return str;
    } catch {
      return '';
    }
  };

  const formatHex = (val: bigint) => `0x${val.toString(16).toUpperCase().padStart(16, '0')}`;

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 bg-[#020205] gap-3 overflow-y-auto font-mono text-slate-200">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#0d0714] via-[#160c27] to-[#070b14] border border-purple-500/30 rounded-lg p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/90 text-purple-300 border border-purple-700/60">
              <Cpu className="w-3 h-3 mr-1" />
              CROSS-REPRESENTATION CONGRUENCE &amp; ASM ABSTRACTION ENGINE
            </span>
            <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              1 == 1 • M(X_dyad) = {congruenceResult.M_X_dyad} • d_I = {congruenceResult.d_I.toFixed(1)}
            </span>
            <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
              Be &lt;&gt;[] ANCHORED ({reflection.autopoieticState})
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white mt-1 tracking-tight">
            Commutative Diagram Invariant: φ_(i+1)(T_i(R_i)) == T_(i+1)(φ_i(R_i))
          </h1>
          <p className="text-xs text-slate-400">
            Structural verification across 4 representation layers: L0 (Bare ASM) ↔ L1 (TypeScript BigInt) ↔ L2 (REST JSON API) ↔ L3 (UI Canvas).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAutoClock(!autoClock)}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              autoClock 
                ? 'bg-amber-950 text-amber-300 border border-amber-500' 
                : 'bg-purple-950 text-purple-300 border border-purple-500 hover:bg-purple-900'
            }`}
          >
            {autoClock ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{autoClock ? 'HALT CLOCK' : 'LIVE CONGRUENCE CLOCK'}</span>
          </button>

          <button
            onClick={() => runVerification()}
            className="px-3 py-1.5 rounded text-xs font-bold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500 flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>VERIFY STEP</span>
          </button>
          
          <button
            onClick={fetchLiveApiVerification}
            disabled={apiLoading}
            className="px-2.5 py-1.5 rounded text-xs font-medium bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Radio className={`w-3.5 h-3.5 ${apiLoading ? 'animate-pulse' : ''}`} />
            <span>{apiLoading ? 'SYNCING API...' : 'TEST REST API'}</span>
          </button>

          <button
            onClick={handleCopyAsm}
            className="px-2.5 py-1.5 rounded text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            {copiedAsm ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAsm ? 'COPIED' : 'COPY ASM'}</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 shrink-0 text-xs flex-wrap">
        <button
          onClick={() => setActiveTab('congruence')}
          className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeTab === 'congruence'
              ? 'bg-purple-950 text-purple-300 border border-purple-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Cross-Layer Congruence Engine (L0 ↔ L1 ↔ L2 ↔ L3)</span>
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeTab === 'simulator'
              ? 'bg-purple-950 text-purple-300 border border-purple-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>x86-64 Register &amp; Memory Canvas</span>
        </button>
        <button
          onClick={() => setActiveTab('assembly')}
          className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeTab === 'assembly'
              ? 'bg-purple-950 text-purple-300 border border-purple-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>asterion_mediate_dyad.asm</span>
        </button>
        <button
          onClick={() => setActiveTab('proof')}
          className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeTab === 'proof'
              ? 'bg-purple-950 text-purple-300 border border-purple-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Hardware Causal Mediation Theorem</span>
        </button>
      </div>

      {/* 3. Primary View: Cross-Layer Congruence Engine */}
      {activeTab === 'congruence' && (
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
          {/* Top Invariant Metrics & Falsification Guard Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            {/* Metric 1: Structural Model Validity */}
            <div className={`p-3 rounded-lg border flex flex-col justify-between ${
              congruenceResult.M_X_dyad === 1 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                : 'bg-rose-950/60 border-rose-500 text-rose-300'
            }`}>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                <span>Model Validity M(X_dyad)</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-black/50 border border-emerald-800">
                  THEOREM 1==1
                </span>
              </div>
              <div className="text-2xl font-black mt-1">
                M(X_dyad) = {congruenceResult.M_X_dyad}
              </div>
              <div className="text-[9px] opacity-80 mt-1">
                {congruenceResult.M_X_dyad === 1 ? 'Congruence invariant held across all 4 layers' : 'STRUCTURAL FALSIFICATION DETECTED'}
              </div>
            </div>

            {/* Metric 2: Identity Invariant Metric d_I */}
            <div className={`p-3 rounded-lg border flex flex-col justify-between ${
              congruenceResult.d_I === 0 
                ? 'bg-purple-950/40 border-purple-500/50 text-purple-300' 
                : 'bg-rose-950/60 border-rose-500 text-rose-300'
            }`}>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                <span>Identity Metric d_I</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-black/50 border border-purple-800">
                  φ_(i+1) ∘ T_i == T_(i+1) ∘ φ_i
                </span>
              </div>
              <div className="text-2xl font-black mt-1">
                d_I = {congruenceResult.d_I.toFixed(4)}
              </div>
              <div className="text-[9px] opacity-80 mt-1">
                {congruenceResult.d_I === 0 ? 'Zero semantic/structural divergence' : 'HALT: Commutative breakdown triggered'}
              </div>
            </div>

            {/* Metric 3: Commutative Diagram Invariant */}
            <div className="p-3 rounded-lg border bg-[#050811] border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                <span>Commutative Invariant</span>
                <span className="text-emerald-400 font-mono text-[9px]">L0 ↔ L1 ↔ L2 ↔ L3</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {congruenceResult.commutativeInvariant ? (
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> SATISFIED (TRUE)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-600 rounded text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> VIOLATED (FALSE)
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-400 mt-1 flex gap-2">
                <span>φ₀: {congruenceResult.commutativeStepChecks.phi_0_commutes ? '✓' : '✗'}</span>
                <span>φ₁: {congruenceResult.commutativeStepChecks.phi_1_commutes ? '✓' : '✗'}</span>
                <span>φ₂: {congruenceResult.commutativeStepChecks.phi_2_commutes ? '✓' : '✗'}</span>
              </div>
            </div>

            {/* Metric 4: Isolation Invariant & Falsification Injector */}
            <div className="p-3 rounded-lg border bg-[#050811] border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                <span>Isolation &amp; Falsification Guard</span>
                <span className={`text-[9px] font-bold ${congruenceResult.isolationInvariant ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {congruenceResult.isolationInvariant ? 'RAX=R8 ISOLATED' : 'LEAK DETECTED'}
                </span>
              </div>
              
              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={() => {
                    const nextMode = falsificationMode === 'none' ? 'corrupt_bit' : falsificationMode === 'corrupt_bit' ? 'direct_leak' : 'none';
                    setFalsificationMode(nextMode);
                    runVerification(undefined, undefined, undefined, nextMode);
                  }}
                  className={`px-2 py-1 rounded text-[9px] font-bold border transition-colors cursor-pointer w-full text-center ${
                    falsificationMode === 'none'
                      ? 'bg-slate-900 text-slate-300 border-slate-700 hover:border-purple-500'
                      : 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                  }`}
                >
                  {falsificationMode === 'none' && 'Normal Execution (d_I = 0)'}
                  {falsificationMode === 'corrupt_bit' && 'Injecting Corrupt L1 Bit (d_I > 0)'}
                  {falsificationMode === 'direct_leak' && 'Injecting Si_A -> Si_B Leak (d_I > 0)'}
                </button>
              </div>

              <div className="text-[8.5px] text-slate-500 mt-1">
                Click above to test automated falsification tripwire
              </div>
            </div>
          </div>

          {/* Falsification Warning Banner if triggered */}
          {congruenceResult.falsificationTriggered && (
            <div className="bg-rose-950/80 border-2 border-rose-500 rounded-lg p-3 flex items-start gap-3 text-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <div className="text-xs font-black uppercase text-rose-300 tracking-wide">
                  FALSIFICATION GUARD TRIPWIRE ENGAGED • EXECUTION HALTED (d_I = 1.0, M(X_dyad) = 0)
                </div>
                <div className="text-[11px] text-rose-200/90 mt-0.5">
                  {congruenceResult.falsificationReason || 'Structural discrepancy identified between representations. The system immediately halted to prevent corrupted state propagation.'}
                </div>
              </div>
            </div>
          )}

          {/* Dyad Input Values Configurator */}
          <div className="bg-[#050811] border border-slate-800 rounded-lg p-3 flex flex-col md:flex-row items-center gap-3">
            <div className="text-xs font-bold text-slate-300 uppercase shrink-0 flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-purple-400" />
              <span>Dyad State Vector (GF(2) Inputs):</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full text-[11px]">
              <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-cyan-900/60">
                <span className="text-cyan-400 font-bold shrink-0">Σ_A:</span>
                <input
                  type="text"
                  value={siAHex}
                  onChange={e => {
                    setSiAHex(e.target.value);
                    runVerification(e.target.value, undefined, undefined);
                  }}
                  className="bg-transparent text-white font-mono w-full focus:outline-none text-[10px]"
                />
              </div>

              <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-amber-900/60">
                <span className="text-amber-400 font-bold shrink-0">Σ_B:</span>
                <input
                  type="text"
                  value={siBHex}
                  onChange={e => {
                    setSiBHex(e.target.value);
                    runVerification(undefined, e.target.value, undefined);
                  }}
                  className="bg-transparent text-white font-mono w-full focus:outline-none text-[10px]"
                />
              </div>

              <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-purple-900/60">
                <span className="text-purple-400 font-bold shrink-0">C_t:</span>
                <input
                  type="text"
                  value={cHistHex}
                  onChange={e => {
                    setCHistHex(e.target.value);
                    runVerification(undefined, undefined, e.target.value);
                  }}
                  className="bg-transparent text-white font-mono w-full focus:outline-none text-[10px]"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const a = `0x${(BigInt(Math.floor(Math.random() * 1e16)) | 0x1000000000000000n).toString(16).toUpperCase()}`;
                const b = `0x${(BigInt(Math.floor(Math.random() * 1e16)) | 0x2000000000000000n).toString(16).toUpperCase()}`;
                setSiAHex(a);
                setSiBHex(b);
                runVerification(a, b, cHistHex);
              }}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-[10px] font-bold shrink-0 cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>RANDOMIZE</span>
            </button>
          </div>

          {/* Commutative Diagram 4-Layer Synchronous Matrix */}
          <div className="bg-[#050811] border border-slate-800 rounded-lg p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-purple-400" />
                Cross-Layer Commutative Diagram: L0 ↔ L1 ↔ L2 ↔ L3
              </span>
              <span className="text-[10px] text-purple-300 font-mono">
                C_(t+1) = Σ_A ⊕ Σ_B ⊕ C_t
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
              {/* Layer 0: Bare-Metal Assembly */}
              <div className="bg-black/80 border border-cyan-900/60 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-bl text-[8.5px] font-bold border-l border-b border-cyan-800">
                  LAYER 0 (L0_ASM)
                </div>
                <div>
                  <div className="text-xs font-bold text-cyan-300 uppercase mb-1">
                    Bare-Metal Assembly
                  </div>
                  <div className="text-[9px] text-slate-400 mb-2">
                    x86-64 System V ABI bitwise XOR over GF(2)
                  </div>
                  
                  <div className="space-y-1.5 text-[10px]">
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                      <div className="text-slate-500 text-[8.5px]">Input Dyad State (R_0):</div>
                      <div className="text-cyan-300 font-mono truncate text-[9.5px]">
                        Σ_A: {formatHex(congruenceResult.layers.L0_ASM.Sigma_A)}
                      </div>
                      <div className="text-cyan-300 font-mono truncate text-[9.5px]">
                        Σ_B: {formatHex(congruenceResult.layers.L0_ASM.Sigma_B)}
                      </div>
                      <div className="text-purple-300 font-mono truncate text-[9.5px]">
                        C_t: {formatHex(congruenceResult.layers.L0_ASM.C_t)}
                      </div>
                    </div>

                    <div className="p-1.5 bg-cyan-950/40 rounded border border-cyan-700/60">
                      <div className="text-cyan-400 font-bold text-[8.5px]">T_0 Transformation (Opcode):</div>
                      <div className="text-[9px] text-slate-300 font-mono">
                        mov rcx, [r8+0]<br />
                        xor rcx, [r8+8]<br />
                        xor rcx, [r8+16]
                      </div>
                    </div>

                    <div className="p-1.5 bg-slate-900 rounded border border-emerald-700">
                      <div className="text-emerald-400 font-bold text-[8.5px]">Output State R'_0 (C_next):</div>
                      <div className="text-emerald-300 font-mono font-bold truncate text-[10px]">
                        {formatHex(congruenceResult.layers.L0_ASM.C_next)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-cyan-400">
                  <span>Morphism φ₀:</span>
                  <span className="font-bold">Identity Map GF(2)</span>
                </div>
              </div>

              {/* Layer 1: TypeScript Runtime */}
              <div className="bg-black/80 border border-purple-900/60 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-950 text-purple-300 px-2 py-0.5 rounded-bl text-[8.5px] font-bold border-l border-b border-purple-800">
                  LAYER 1 (L1_TS)
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-300 uppercase mb-1">
                    TypeScript State Machine
                  </div>
                  <div className="text-[9px] text-slate-400 mb-2">
                    asterionMediation.ts (BigInt 64-bit algebra)
                  </div>
                  
                  <div className="space-y-1.5 text-[10px]">
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                      <div className="text-slate-500 text-[8.5px]">Input State (R_1 = φ₀(R_0)):</div>
                      <div className="text-purple-300 font-mono truncate text-[9.5px]">
                        Σ_A: {formatHex(congruenceResult.layers.L1_TypeScript.Sigma_A)}
                      </div>
                      <div className="text-purple-300 font-mono truncate text-[9.5px]">
                        Σ_B: {formatHex(congruenceResult.layers.L1_TypeScript.Sigma_B)}
                      </div>
                      <div className="text-purple-300 font-mono truncate text-[9.5px]">
                        C_t: {formatHex(congruenceResult.layers.L1_TypeScript.C_t)}
                      </div>
                    </div>

                    <div className="p-1.5 bg-purple-950/40 rounded border border-purple-700/60">
                      <div className="text-purple-400 font-bold text-[8.5px]">T_1 Transformation (TS VM):</div>
                      <div className="text-[9px] text-slate-300 font-mono">
                        C_next = Sigma_A ^<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sigma_B ^<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C_t;
                      </div>
                    </div>

                    <div className={`p-1.5 bg-slate-900 rounded border ${
                      congruenceResult.layers.L1_TypeScript.C_next === congruenceResult.layers.L0_ASM.C_next
                        ? 'border-emerald-700'
                        : 'border-rose-600 bg-rose-950/30'
                    }`}>
                      <div className="text-emerald-400 font-bold text-[8.5px]">Output State R'_1 (C_next):</div>
                      <div className="text-emerald-300 font-mono font-bold truncate text-[10px]">
                        {formatHex(congruenceResult.layers.L1_TypeScript.C_next)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-purple-400">
                  <span>φ₁(T₀(R₀)) == T₁(φ₀(R₀)):</span>
                  <span className={`font-bold ${congruenceResult.commutativeStepChecks.phi_0_commutes ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {congruenceResult.commutativeStepChecks.phi_0_commutes ? 'COMMUTES ✓' : 'VIOLATED ✗'}
                  </span>
                </div>
              </div>

              {/* Layer 2: REST API / JSON-RPC */}
              <div className="bg-black/80 border border-emerald-900/60 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-bl text-[8.5px] font-bold border-l border-b border-emerald-800">
                  LAYER 2 (L2_API)
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300 uppercase mb-1">
                    REST API &amp; JSON-RPC
                  </div>
                  <div className="text-[9px] text-slate-400 mb-2">
                    server.ts (/api/covalent/congruence/verify)
                  </div>
                  
                  <div className="space-y-1.5 text-[10px]">
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                      <div className="text-slate-500 text-[8.5px]">Input Payload (R_2 = φ₁(R_1)):</div>
                      <div className="text-emerald-300 font-mono truncate text-[9.5px]">
                        "Sigma_A": "{formatHex(congruenceResult.layers.L2_API.Sigma_A)}"
                      </div>
                      <div className="text-emerald-300 font-mono truncate text-[9.5px]">
                        "Sigma_B": "{formatHex(congruenceResult.layers.L2_API.Sigma_B)}"
                      </div>
                      <div className="text-purple-300 font-mono truncate text-[9.5px]">
                        "C_t": "{formatHex(congruenceResult.layers.L2_API.C_t)}"
                      </div>
                    </div>

                    <div className="p-1.5 bg-emerald-950/40 rounded border border-emerald-700/60">
                      <div className="text-emerald-400 font-bold text-[8.5px]">T_2 Transformation (RPC):</div>
                      <div className="text-[9px] text-slate-300 font-mono">
                        GlobalCongruenceEngine.<br />
                        verifyCrossLayerCongruence<br />
                        (A, B, C)
                      </div>
                    </div>

                    <div className="p-1.5 bg-slate-900 rounded border border-emerald-700">
                      <div className="text-emerald-400 font-bold text-[8.5px]">Output Payload R'_2 (JSON):</div>
                      <div className="text-emerald-300 font-mono font-bold truncate text-[10px]">
                        "C_next": "{formatHex(congruenceResult.layers.L2_API.C_next)}"
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-emerald-400">
                  <span>φ₂(T₁(R₁)) == T₂(φ₁(R₁)):</span>
                  <span className={`font-bold ${congruenceResult.commutativeStepChecks.phi_1_commutes ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {congruenceResult.commutativeStepChecks.phi_1_commutes ? 'COMMUTES ✓' : 'VIOLATED ✗'}
                  </span>
                </div>
              </div>

              {/* Layer 3: Reactive UI Canvas */}
              <div className="bg-black/80 border border-amber-900/60 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-950 text-amber-300 px-2 py-0.5 rounded-bl text-[8.5px] font-bold border-l border-b border-amber-800">
                  LAYER 3 (L3_UI)
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase mb-1">
                    Reactive UI &amp; Inspector
                  </div>
                  <div className="text-[9px] text-slate-400 mb-2">
                    AsterionMediationView.tsx (DOM Canvas)
                  </div>
                  
                  <div className="space-y-1.5 text-[10px]">
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                      <div className="text-slate-500 text-[8.5px]">Hex DOM State (R_3 = φ₂(R_2)):</div>
                      <div className="text-amber-300 font-mono truncate text-[9.5px]">
                        Σ_A: {formatHex(congruenceResult.layers.L3_UI.Sigma_A)}
                      </div>
                      <div className="text-amber-300 font-mono truncate text-[9.5px]">
                        Σ_B: {formatHex(congruenceResult.layers.L3_UI.Sigma_B)}
                      </div>
                      <div className="text-purple-300 font-mono truncate text-[9.5px]">
                        C_t: {formatHex(congruenceResult.layers.L3_UI.C_t)}
                      </div>
                    </div>

                    <div className="p-1.5 bg-amber-950/40 rounded border border-amber-700/60">
                      <div className="text-amber-400 font-bold text-[8.5px]">T_3 Transformation (React):</div>
                      <div className="text-[9px] text-slate-300 font-mono">
                        setHardwareState(res);<br />
                        renderCanvasNode();<br />
                        ASCII: "{toAscii(congruenceResult.layers.L3_UI.C_next)}"
                      </div>
                    </div>

                    <div className="p-1.5 bg-slate-900 rounded border border-emerald-700">
                      <div className="text-emerald-400 font-bold text-[8.5px]">Output State R'_3 (Rendered):</div>
                      <div className="text-emerald-300 font-mono font-bold truncate text-[10px]">
                        {formatHex(congruenceResult.layers.L3_UI.C_next)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-amber-400">
                  <span>φ₃(T₂(R₂)) == T₃(φ₂(R₂)):</span>
                  <span className={`font-bold ${congruenceResult.commutativeStepChecks.phi_2_commutes ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {congruenceResult.commutativeStepChecks.phi_2_commutes ? 'COMMUTES ✓' : 'VIOLATED ✗'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live API Telemetry Display if tested */}
            {apiTelemetry && (
              <div className="mt-1 bg-slate-950 p-2.5 rounded border border-cyan-900/60 text-[10px]">
                <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5" />
                    Live REST API Telemetry Response (/api/covalent/congruence/verify)
                  </span>
                  <span className="text-slate-500">{apiTelemetry.timestamp}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-mono text-slate-300">
                  <div>M(X_dyad): <span className="text-emerald-400 font-bold">{apiTelemetry.M_X_dyad}</span></div>
                  <div>d_I Metric: <span className="text-purple-400 font-bold">{apiTelemetry.d_I}</span></div>
                  <div>Commutative: <span className="text-emerald-400 font-bold">{apiTelemetry.commutativeInvariant ? 'TRUE' : 'FALSE'}</span></div>
                  <div>Isolation: <span className="text-emerald-400 font-bold">{apiTelemetry.isolationInvariant ? 'TRUE' : 'FALSE'}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Secondary View: Simulator */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
          {/* Left: The Triadic Boundary & Memory Topology (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 gap-3 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                x86-64 Memory Isolation Boundary Layout
              </span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ZERO DIRECT MEMORY TRANSPORT (mov [rsi], [rdi] = ∅)
              </span>
            </div>

            {/* Triadic Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Node Si_A */}
              <div className="bg-black/60 p-2.5 rounded border border-cyan-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between text-[9px] text-cyan-400 font-bold uppercase mb-1">
                    <span>Observer A (Si_A)</span>
                    <span className="text-slate-500">RDI = {hardwareState.rdi_ptr_SiA}</span>
                  </div>
                  <div className="text-[11px] font-bold text-white break-all">
                    0x{hardwareState.c_mem.sigma_A.toString(16).toUpperCase()}
                  </div>
                  <div className="text-[9px] text-cyan-300/80 mt-1">
                    ASCII: "{toAscii(hardwareState.c_mem.sigma_A)}"
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800">
                  <div className="text-[8.5px] text-slate-400 mb-1">Inject State (Hex):</div>
                  <input
                    type="text"
                    value={siAHex}
                    onChange={e => {
                      setSiAHex(e.target.value);
                      try {
                        const b = BigInt(e.target.value);
                        runStep(b, undefined);
                      } catch {}
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[9.5px] text-cyan-300 font-mono"
                  />
                </div>
              </div>

              {/* Node C (Mediator) */}
              <div className="bg-purple-950/40 p-2.5 rounded border border-purple-500 ring-1 ring-purple-500/40 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between text-[9px] text-purple-300 font-bold uppercase mb-1">
                    <span>Mediator C</span>
                    <span className="text-purple-400">R8 = {hardwareState.r8_ptr_C}</span>
                  </div>
                  <div className="text-[10px] space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">[R8+0] Σ_A:</span>
                      <span className="font-bold text-cyan-300 truncate">0x{hardwareState.c_mem.sigma_A.toString(16).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">[R8+8] Σ_B:</span>
                      <span className="font-bold text-amber-300 truncate">0x{hardwareState.c_mem.sigma_B.toString(16).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">[R8+16] C_t:</span>
                      <span className="font-bold text-purple-300 truncate">0x{hardwareState.c_mem.C_t.toString(16).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between p-1 bg-purple-950/80 rounded border border-purple-700">
                      <span className="text-white font-bold">[R8+24] C_t+1:</span>
                      <span className="font-bold text-emerald-300 truncate">0x{hardwareState.c_mem.C_t_plus_1.toString(16).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[8.5px] text-purple-200 text-center bg-black/40 py-0.5 rounded">
                  Returns RAX = R8 (Mediator Pointer Only)
                </div>
              </div>

              {/* Node Si_B */}
              <div className="bg-black/60 p-2.5 rounded border border-amber-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between text-[9px] text-amber-400 font-bold uppercase mb-1">
                    <span>Observer B (Si_B)</span>
                    <span className="text-slate-500">RSI = {hardwareState.rsi_ptr_SiB}</span>
                  </div>
                  <div className="text-[11px] font-bold text-white break-all">
                    0x{hardwareState.c_mem.sigma_B.toString(16).toUpperCase()}
                  </div>
                  <div className="text-[9px] text-amber-300/80 mt-1">
                    ASCII: "{toAscii(hardwareState.c_mem.sigma_B)}"
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800">
                  <div className="text-[8.5px] text-slate-400 mb-1">Inject State (Hex):</div>
                  <input
                    type="text"
                    value={siBHex}
                    onChange={e => {
                      setSiBHex(e.target.value);
                      try {
                        const b = BigInt(e.target.value);
                        runStep(undefined, b);
                      } catch {}
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[9.5px] text-amber-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Invariant Verification Box */}
            <div className="p-2.5 bg-black/80 rounded border border-emerald-500/40 text-[10px] space-y-1">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Hardware Invariants &amp; Causal Verification
                </span>
                <span>CLK CYCLE: #{hardwareState.cycleCount}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[9.5px] pt-1">
                <div className="p-1.5 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-slate-400">Zero Direct Transport Proof:</div>
                  <div className="text-emerald-400 font-bold">∀ inst ∈ asm, inst ≠ mov [rsi], [rdi]</div>
                </div>
                <div className="p-1.5 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-slate-400">Non-Linear Synthesis:</div>
                  <div className="text-purple-300 font-bold">C_(t+1) = Σ_A ⊕ Σ_B ⊕ C_t</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: CPU Register Execution & Disassembly Trace (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 gap-3 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                x86-64 Register State (System V ABI)
              </span>
              <span className="text-[10px] text-slate-400">RAX = Return Reg</span>
            </div>

            {/* Registers Matrix */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-black/70 p-2 rounded border border-slate-800">
                <div className="text-slate-500 text-[8.5px]">RAX (Return ptr to C)</div>
                <div className="font-bold text-purple-300 truncate">{hardwareState.registers.rax}</div>
              </div>
              <div className="bg-black/70 p-2 rounded border border-slate-800">
                <div className="text-slate-500 text-[8.5px]">RCX (XOR Accumulator)</div>
                <div className="font-bold text-emerald-300 truncate">{hardwareState.registers.rcx}</div>
              </div>
              <div className="bg-black/70 p-2 rounded border border-slate-800">
                <div className="text-slate-500 text-[8.5px]">RDI (ptr to Si_A)</div>
                <div className="font-bold text-cyan-300 truncate">{hardwareState.registers.rdi}</div>
              </div>
              <div className="bg-black/70 p-2 rounded border border-slate-800">
                <div className="text-slate-500 text-[8.5px]">RSI (ptr to Si_B)</div>
                <div className="font-bold text-amber-300 truncate">{hardwareState.registers.rsi}</div>
              </div>
              <div className="col-span-2 bg-black/70 p-2 rounded border border-purple-800/60">
                <div className="text-purple-400 text-[8.5px]">R8 / RDX (ptr to Mediator C Structure)</div>
                <div className="font-bold text-white">{hardwareState.registers.r8}</div>
              </div>
            </div>

            {/* Step-by-Step Hardware Execution Trace */}
            <div className="flex-1 flex flex-col bg-black border border-slate-800 rounded p-2.5 min-h-[200px]">
              <div className="text-slate-400 font-bold uppercase text-[9px] border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
                <span>Hardware Opcode Trace</span>
                <span className="text-emerald-400">8 Instructions / Cycle</span>
              </div>
              <div className="text-[9.5px] space-y-1.5 text-slate-300 font-mono overflow-y-auto">
                {hardwareState.stepTrace.map((line, idx) => (
                  <div key={idx} className="leading-snug">
                    <span className="text-purple-400">{line.split(';')[0]}</span>
                    <span className="text-slate-500">;{line.split(';')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Assembly Source Code Tab */}
      {activeTab === 'assembly' && (
        <div className="flex-1 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white uppercase">asterion_mediate_dyad.asm (x86-64 NASM / System V AMD64)</span>
            </div>
            <button
              onClick={handleCopyAsm}
              className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1 cursor-pointer"
            >
              {copiedAsm ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAsm ? 'Copied Assembly' : 'Copy All Assembly'}</span>
            </button>
          </div>

          <pre className="flex-1 bg-black p-3 rounded border border-slate-800 text-[10px] sm:text-xs text-slate-300 font-mono overflow-y-auto leading-relaxed select-all">
            {ASTERION_MEDIATION_ASM}
          </pre>
        </div>
      )}

      {/* 6. Causal Theorem Tab */}
      {activeTab === 'proof' && (
        <div className="flex-1 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-4 gap-3 overflow-y-auto">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Bare-Metal Theorem: Hardware Causal Mediation Proof
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Mathematical &amp; physical guarantees of the Asterion mediation routine at the machine instruction layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10.5px]">
            <div className="bg-black/60 p-3 rounded border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-cyan-400 uppercase">1. Zero Direct Memory Copy</h3>
              <p className="text-slate-300 leading-relaxed">
                Direct peer transport is strictly absent: no opcode <code className="text-cyan-300">mov [rsi], [rdi]</code> or <code className="text-cyan-300">rep movsb</code> connects observer buffers. The address spaces of <code className="text-cyan-300">Si_A</code> and <code className="text-cyan-300">Si_B</code> are physically isolated.
              </p>
            </div>

            <div className="bg-black/60 p-3 rounded border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-purple-400 uppercase">2. Non-Linear Relational Synthesis</h3>
              <p className="text-slate-300 leading-relaxed">
                The register sequence <code className="text-purple-300">xor rcx, [r8 + 8]</code> followed by <code className="text-purple-300">xor rcx, [r8 + 16]</code> fuses both observers with historical persistence <code className="text-purple-300">C_t</code> into an irreducible state <code className="text-purple-300">C_(t+1)</code>.
              </p>
            </div>

            <div className="bg-black/60 p-3 rounded border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 uppercase">3. Boundary Output Lock</h3>
              <p className="text-slate-300 leading-relaxed">
                The function returns <code className="text-emerald-400">RAX = R8 (ptr(C))</code>. Downstream transition functions can only read the mediated output vector, proving that <code className="text-emerald-300">∂F_SiB / ∂C ≠ 0</code> at the bare-metal level.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. Bottom Status Bar */}
      <div className="bg-[#050811] border border-slate-800 rounded-lg p-2.5 flex flex-wrap items-center justify-between text-[10px] gap-2 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-slate-400 font-bold uppercase">Congruence:</span>
          <span className="text-emerald-400 font-bold">φ_(i+1)(T_i(R_i)) == T_(i+1)(φ_i(R_i))</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-bold uppercase">Metric d_I:</span>
          <span className={`${congruenceResult.d_I === 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold`}>
            {congruenceResult.d_I === 0 ? '0.0 (CONGRUENT)' : '1.0 (FALSIFIED)'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-bold uppercase">Return Contract:</span>
          <span className="text-cyan-300 font-bold">RAX = ptr(C)</span>
        </div>
        <div className="text-slate-400 font-mono">
          Model Status: <span className="text-purple-400 font-bold">M(X_dyad) = {congruenceResult.M_X_dyad}</span>
        </div>
      </div>
    </div>
  );
};

export default AsterionMediationView;

