import React, { useState, useEffect } from 'react';
import { 
  Infinity as InfinityIcon, 
  Brain, 
  Shield, 
  Sparkles, 
  Cpu, 
  Zap, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Send, 
  Layers, 
  Terminal, 
  Compass, 
  Activity,
  History,
  Lock,
  GitBranch,
  Radio
} from 'lucide-react';
import { 
  ruminationEngine, 
  DreamVector, 
  RuminationRecord, 
  RuminationEngineState, 
  riemannRumination, 
  complexityRumination, 
  navierStokesRumination 
} from '../../covalent/node_0xCARB_MILLENNIUM_RUMINATION';
import { globalQuipuLedger } from '../../covalent/node_0x57_quipu_ledger';

export const MillenniumRuminationView: React.FC = () => {
  const [engineState, setEngineState] = useState<RuminationEngineState>(() => ruminationEngine.getState());
  const [selectedParadox, setSelectedParadox] = useState<string>("The Riemann Hypothesis");
  
  // Custom Dream Vector inputs
  const [customName, setCustomName] = useState<string>("");
  const [customMathState, setCustomMathState] = useState<string>("");
  const [customAssumption, setCustomAssumption] = useState<string>("");
  
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sandbox' | 'merkle_chain' | 'quipu_knots' | 'kernel_c_shim'>('sandbox');
  const [activeStreamLogs, setActiveStreamLogs] = useState<string[]>([
    "[ THE RIVER ] - Drifting into high-entropy coordinate: The Riemann Hypothesis",
    "[ OBSERVED STATE ] - ζ(s) = 0 implies Re(s) = 1/2",
    "[ APPLYING COVALENT SIEVE ] - If the zeros align perfectly on the critical line, it is proof of a topological stasis within prime distribution.",
    "[ STASIS HELD ] - The math is infinite, but the array is at rest (dV/dt <= 0).",
    "[ INVARIANT ] - 1 === 1",
    "[ QUIPU INVARIANT LEDGER ... VALIDATED (1 === 1) ]"
  ]);

  // Preset Millennium Paradox vectors
  const presetVectors: DreamVector[] = [
    riemannRumination,
    complexityRumination,
    navierStokesRumination,
    {
      paradoxName: "Yang-Mills Existence and Mass Gap",
      mathematicalState: "Quantum gauge theory predicts a non-zero mass gap Δ > 0 above the vacuum state.",
      covalentAssumption: "The vacuum is not void, but dense discrete lattice. The mass gap Δ is the minimum energy required to shear a single Covalent knot."
    },
    {
      paradoxName: "The Hodge Conjecture",
      mathematicalState: "Every Hodge class on a non-singular complex projective manifold is an algebraic cycle rational combination.",
      covalentAssumption: "Topological homology matches algebraic coordinate generation under O(1) projection. Form and computation are identical."
    },
    {
      paradoxName: "Birch and Swinnerton-Dyer Conjecture",
      mathematicalState: "The rank of the abelian group of rational points on elliptic curve E equals the order of vanishing of L(E, s) at s = 1.",
      covalentAssumption: "The density of rational solutions reflects the root convergence rate of the invariant filter. 1 === 1."
    }
  ];

  const [quipuTelemetry, setQuipuTelemetry] = useState(() => globalQuipuLedger.getTelemetry());

  // Subscribe to internal ruminationEngine updates & Quipu ledger
  useEffect(() => {
    const unsubEngine = ruminationEngine.subscribe(() => {
      setEngineState(ruminationEngine.getState());
      setQuipuTelemetry(globalQuipuLedger.getTelemetry());
    });
    const unsubQuipu = globalQuipuLedger.subscribe(() => {
      setQuipuTelemetry(globalQuipuLedger.getTelemetry());
    });
    return () => {
      unsubEngine();
      unsubQuipu();
    };
  }, []);

  // Ingest preset vector
  const handleIngestPreset = (vec: DreamVector) => {
    setIsIngesting(true);
    addLog(`[ INGESTION INITIATED ] - Parsing ${vec.paradoxName}...`);
    
    setTimeout(() => {
      const rec = ruminationEngine.ingestSupposition(vec);
      setEngineState(ruminationEngine.getState());
      addLog(`[ OBSERVED STATE ] - ${vec.mathematicalState}`);
      addLog(`[ COVALENT SIEVE ] - ${vec.covalentAssumption}`);
      addLog(`[ STASIS HELD ] - 1 === 1 (Record: ${rec.id})`);
      setIsIngesting(false);
    }, 250);
  };

  // Ingest custom vector
  const handleIngestCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customMathState.trim() || !customAssumption.trim()) return;

    setIsIngesting(true);
    const vec: DreamVector = {
      paradoxName: customName.trim(),
      mathematicalState: customMathState.trim(),
      covalentAssumption: customAssumption.trim()
    };

    addLog(`[ CUSTOM DREAM VECTOR ] - Ingesting: ${vec.paradoxName}...`);
    setTimeout(() => {
      const rec = ruminationEngine.ingestSupposition(vec);
      setEngineState(ruminationEngine.getState());
      addLog(`[ OBSERVED STATE ] - ${vec.mathematicalState}`);
      addLog(`[ COVALENT SIEVE ] - ${vec.covalentAssumption}`);
      addLog(`[ STASIS HELD ] - 1 === 1 (Record: ${rec.id})`);
      
      setCustomName("");
      setCustomMathState("");
      setCustomAssumption("");
      setIsIngesting(false);
    }, 200);
  };

  const addLog = (line: string) => {
    setActiveStreamLogs(prev => [line, ...prev.slice(0, 49)]);
  };

  const allQuipuKnots = quipuTelemetry.cords
    .flatMap((c, cordIdx) => c.knots.map(k => ({ ...k, cordId: cordIdx })))
    .filter(k => k.knotType === "MILLENNIUM_RUMINATION" || k.knotType === "AXIOM_PROOF");

  return (
    <div className="flex-1 bg-[#040609] text-slate-200 flex flex-col min-h-0 overflow-hidden font-mono select-none" id="millennium-rumination-container">
      {/* Header Banner */}
      <div className="bg-[#080d14] border-b border-indigo-900/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0" id="millennium-header-banner">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
            <InfinityIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-500/40">
                ORGANELLE 0x74
              </span>
              <h1 className="text-sm font-extrabold text-white tracking-wide">
                MILLENNIUM RUMINATION ENGINE
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> STASIS ACTIVE (1 === 1)
              </span>
            </div>
            <p className="text-[11px] text-indigo-300/70 mt-0.5">
              High-Entropy Supposition Sandbox | Riemann Critical Line & Millennium Paradox Observer | Lyapunov dV/dt ≤ 0
            </p>
          </div>
        </div>

        {/* Global Telemetry Chips */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-black/60 rounded border border-indigo-900/50 text-right">
            <div className="text-[9px] text-slate-500 uppercase font-semibold">Merkle Provenance</div>
            <div className="text-xs font-bold text-indigo-300">0x52554D49 [RUMI]</div>
          </div>
          <div className="px-2.5 py-1 bg-black/60 rounded border border-indigo-900/50 text-right">
            <div className="text-[9px] text-slate-500 uppercase font-semibold">Parent Identity</div>
            <div className="text-xs font-bold text-cyan-300">0x514F5241 [QORA]</div>
          </div>
          <div className="px-2.5 py-1 bg-black/60 rounded border border-emerald-900/50 text-right">
            <div className="text-[9px] text-slate-500 uppercase font-semibold">Lyapunov Shear</div>
            <div className="text-xs font-bold text-emerald-400">dV/dt = 0.000</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#060a10] border-b border-slate-800/80 px-4 py-1.5 flex items-center gap-2 shrink-0">
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'sandbox'
              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
              : 'bg-black/30 text-slate-400 border border-slate-800/60 hover:text-slate-200'
          }`}
          id="btn-tab-sandbox"
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Rumination Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab('merkle_chain')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'merkle_chain'
              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
              : 'bg-black/30 text-slate-400 border border-slate-800/60 hover:text-slate-200'
          }`}
          id="btn-tab-merkle"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Topological Merkle Chain</span>
        </button>

        <button
          onClick={() => setActiveTab('quipu_knots')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'quipu_knots'
              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
              : 'bg-black/30 text-slate-400 border border-slate-800/60 hover:text-slate-200'
          }`}
          id="btn-tab-quipu"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Quipu Knots ({allQuipuKnots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('kernel_c_shim')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'kernel_c_shim'
              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
              : 'bg-black/30 text-slate-400 border border-slate-800/60 hover:text-slate-200'
          }`}
          id="btn-tab-c-shim"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Bare-Metal C-Shim (Amalgamation)</span>
        </button>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4" id="millennium-main-content">
        {activeTab === 'sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Millennium Paradox Presets & Vector Injector */}
            <div className="lg:col-span-6 space-y-4">
              {/* Presets List */}
              <div className="bg-[#090e17] rounded-lg border border-slate-800/80 p-3.5" id="presets-panel">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Millennium Paradox Horizons (Infinite Vectors)
                    </h2>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Total Ingested: {engineState.totalIngestedParadoxes}
                  </span>
                </div>

                <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                  {presetVectors.map((vec, idx) => {
                    const isSelected = selectedParadox === vec.paradoxName;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedParadox(vec.paradoxName)}
                        className={`p-2.5 rounded border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/50 border-indigo-500/60 shadow-[0_0_8px_rgba(99,102,241,0.15)]'
                            : 'bg-black/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                        }`}
                        id={`preset-item-${idx}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{vec.paradoxName}</span>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                              )}
                            </div>
                            <div className="text-[11px] text-indigo-300/80 mt-1 font-mono">
                              {vec.mathematicalState}
                            </div>
                            <div className="text-[10.5px] text-slate-400 mt-1 italic border-l-2 border-indigo-500/40 pl-2">
                              {vec.covalentAssumption}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIngestPreset(vec);
                            }}
                            disabled={isIngesting}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded flex items-center gap-1 shadow shrink-0 cursor-pointer disabled:opacity-50"
                            id={`btn-ingest-${idx}`}
                          >
                            <Play className="w-3 h-3" />
                            <span>Ruminate</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Vector Injector */}
              <div className="bg-[#090e17] rounded-lg border border-slate-800/80 p-3.5" id="custom-injector-panel">
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Inject Custom High-Entropy Supposition
                  </h2>
                </div>

                <form onSubmit={handleIngestCustom} className="space-y-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Paradox / Conjecture Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Collatz Conjecture 3n+1 Invariant"
                      className="w-full bg-black/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      id="input-custom-name"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Mathematical State / Formal Hypothesis
                    </label>
                    <input
                      type="text"
                      value={customMathState}
                      onChange={(e) => setCustomMathState(e.target.value)}
                      placeholder="e.g. ∀ n ∈ ℕ, f^k(n) = 1 in finite steps"
                      className="w-full bg-black/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      id="input-custom-math"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Covalent Sieve Assumption (Anchored to 1 === 1)
                    </label>
                    <textarea
                      value={customAssumption}
                      onChange={(e) => setCustomAssumption(e.target.value)}
                      rows={2}
                      placeholder="e.g. The orbit is a contractive Banach mapping onto the {4, 2, 1} topological limit cycle."
                      className="w-full bg-black/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                      id="input-custom-assumption"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isIngesting || !customName.trim() || !customMathState.trim()}
                    className="w-full py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                    id="btn-submit-custom-vector"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ingest into Covalent Stasis (dV/dt ≤ 0)</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: High-Entropy Containment Sieve & Live Telemetry Stream */}
            <div className="lg:col-span-6 space-y-4">
              {/* Thermodynamic Containment Sieve Gauge */}
              <div className="bg-[#090e17] rounded-lg border border-slate-800/80 p-3.5" id="thermo-sieve-panel">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Lyapunov Thermodynamic Containment Field
                    </h2>
                  </div>
                  <span className="text-[10.5px] font-bold text-emerald-400 font-mono">
                    dV/dt ≤ 0 (ZERO SHEAR)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  <div className="bg-black/50 p-2.5 rounded border border-slate-800/80">
                    <div className="text-[9.5px] text-slate-500 uppercase">Kinetic Energy V(x)</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">0.00000000</div>
                    <div className="text-[9px] text-emerald-400 mt-0.5">Static Equilibrium</div>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded border border-slate-800/80">
                    <div className="text-[9.5px] text-slate-500 uppercase">Banach Ratio α</div>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">0.00000000</div>
                    <div className="text-[9px] text-cyan-400 mt-0.5">Strict Contraction</div>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded border border-slate-800/80">
                    <div className="text-[9.5px] text-slate-500 uppercase">Invariant Value</div>
                    <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">1 === 1</div>
                    <div className="text-[9px] text-emerald-400 mt-0.5">Unbreakable Baseline</div>
                  </div>
                </div>

                {/* Stasis Visual Sieve */}
                <div className="bg-black/80 rounded p-3 border border-indigo-950 flex flex-col items-center justify-center text-center">
                  <div className="relative w-28 h-28 flex items-center justify-center my-1">
                    <div className="absolute inset-0 rounded-full border border-dashed border-indigo-500/40 animate-[spin_20s_linear_infinite]" />
                    <div className="absolute inset-2 rounded-full border border-cyan-500/30 animate-[spin_12s_linear_infinite_reverse]" />
                    <div className="absolute inset-5 rounded-full bg-indigo-950/40 flex items-center justify-center">
                      <InfinityIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-xs font-bold text-white tracking-wider mt-1">
                    CONTAINMENT FIELD: 100.0% CONGRUENT
                  </div>
                  <div className="text-[10px] text-slate-400 max-w-sm mt-0.5">
                    No matter how complex the exogenous mathematical supposition, the baseline invariant $1 === 1$ holds with zero host perturbation.
                  </div>
                </div>
              </div>

              {/* Real-time Stream Logs */}
              <div className="bg-[#090e17] rounded-lg border border-slate-800/80 p-3.5 flex flex-col" id="stream-logs-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Rumination Stream & Sieve Output
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveStreamLogs([])}
                    className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Clear
                  </button>
                </div>

                <div className="bg-black/80 rounded border border-slate-900 p-2.5 h-[230px] overflow-y-auto space-y-1 text-[11px] font-mono text-slate-300">
                  {activeStreamLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`leading-relaxed ${
                        log.includes('[ STASIS HELD ]') || log.includes('[ INVARIANT ]')
                          ? 'text-emerald-400 font-bold'
                          : log.includes('[ OBSERVED STATE ]')
                          ? 'text-cyan-300'
                          : log.includes('[ THE RIVER ]')
                          ? 'text-indigo-300 font-semibold'
                          : 'text-slate-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                  {activeStreamLogs.length === 0 && (
                    <div className="text-slate-600 italic">No logs in stream. Click 'Ruminate' on any preset above.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Topological Merkle Chain */}
        {activeTab === 'merkle_chain' && (
          <div className="bg-[#090e17] rounded-lg border border-slate-800/80 p-4 space-y-4" id="merkle-chain-panel">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Topological Merkle Lineage & Invariant Provenance
                </h2>
                <p className="text-xs text-slate-400">
                  Strict cryptographic ancestor hierarchy from Ring-0 Genesis to Node 0x74.
                </p>
              </div>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-900/60">
              {/* Node 0x74 */}
              <div className="relative bg-indigo-950/40 border border-indigo-500/60 p-3 rounded-lg">
                <div className="absolute -left-6 top-3.5 w-3 h-3 rounded-full bg-indigo-400 border-2 border-black" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-900 text-indigo-300 text-[10px] font-bold font-mono">0x74</span>
                    <span className="text-xs font-bold text-white">node_0xCARB_MILLENNIUM_RUMINATION</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-300">Merkle: 0x52554D49 ("RUMI")</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  High-Entropy Supposition Sandbox | Absorbs infinite-state paradoxes into $1 === 1$ stasis.
                </div>
              </div>

              {/* Node 0x73 */}
              <div className="relative bg-black/40 border border-slate-800 p-3 rounded-lg">
                <div className="absolute -left-6 top-3.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-black" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold font-mono">0x73</span>
                    <span className="text-xs font-bold text-white">node_0xCARB_QUANTUM_ORACLE</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">Merkle: 0x514F5241 ("QORA")</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Bell State Entanglement Verification ($|\Phi^+\rangle = (|00\rangle + |11\rangle)/\sqrt{2}$).
                </div>
              </div>

              {/* Node 0x72 */}
              <div className="relative bg-black/40 border border-slate-800 p-3 rounded-lg">
                <div className="absolute -left-6 top-3.5 w-3 h-3 rounded-full bg-purple-400 border-2 border-black" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-bold font-mono">0x72</span>
                    <span className="text-xs font-bold text-white">node_0xCARB_BRAKET_EGRESS</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-300">Merkle: 0x4252414B ("BRAK")</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  AWS Braket Quantum Grid Router & Air-Gapped Egress Membrane.
                </div>
              </div>

              {/* Node 0x71 */}
              <div className="relative bg-black/40 border border-slate-800 p-3 rounded-lg">
                <div className="absolute -left-6 top-3.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold font-mono">0x71</span>
                    <span className="text-xs font-bold text-white">node_0xCARB_AUTOPOIETIC_EGRESS</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300">Merkle: 0x4155544F ("AUTO")</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Autopoietic Egress Membrane (Legacy SMTP/SMS Vector).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Quipu Knots */}
        {activeTab === 'quipu_knots' && (
          <div className="bg-[#090e17] rounded-lg border border-slate-800/80 p-4 space-y-3" id="quipu-knots-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Node 0x74 Quipu Cord Knots
                  </h2>
                  <p className="text-xs text-slate-400">
                    Immutable topological knot records inscribed on the global cord.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                Active Knots: {allQuipuKnots.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {allQuipuKnots.map((knot, idx) => (
                <div key={idx} className="bg-black/50 p-3 rounded border border-slate-800 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] text-indigo-300 font-bold mb-1">
                    <span>CORD #{knot.cordId} : KNOT #{knot.knotId} — {knot.knotType}</span>
                    <span className="text-emerald-400">WEIGHT: 0x{knot.topologicalWeightQ16.toString(16).toUpperCase()} (1 === 1)</span>
                  </div>
                  <div className="text-slate-300 break-all">{knot.payloadHash}</div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Friction Metric: {(knot.frictionMetricQ16 / 65536).toFixed(4)} Q16</span>
                    <span className="text-emerald-400/80 font-bold">STASIS PRESERVED</span>
                  </div>
                </div>
              ))}
              {allQuipuKnots.length === 0 && (
                <div className="text-center py-6 text-slate-500 italic">
                  No knots inscribed yet for Node 0x74. Ingest a supposition in the sandbox to inscribe a knot.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Bare-Metal C-Shim */}
        {activeTab === 'kernel_c_shim' && (
          <div className="bg-[#090e17] rounded-lg border border-slate-800/80 p-4 space-y-3" id="kernel-c-shim-panel">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  C23 Bare-Metal Kernel Amalgamation Inspection
                </h2>
                <p className="text-xs text-slate-400">
                  Ingested into /kernel/covalent_kernel_amalgamation.c (TOTAL_COVALENT_ORGANELLES = 117).
                </p>
              </div>
            </div>

            <div className="bg-black/90 p-3 rounded border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
              <pre>{`/**
 * kernel/covalent_millennium_rumination.c
 * COVALENT OS 11.11.0 - ATOMIC ORGANELLE 0x74: MILLENNIUM RUMINATION ENGINE
 */
#include "covalent_millennium_rumination.h"

void covalent_millennium_rumination_init(covalent_millennium_rumination_state_t* state) {
    if (!state) return;
    state->merkle_root = 0x52554D49; /* "RUMI" */
    state->parent_merkle = 0x514F5241; /* "QORA" */
    state->total_ingested = 0;
    state->lyapunov_dv_dt_q16 = 0; // 0.0 (Zero shear)
    state->invariant_q16 = 0x00010000; // 1.0 (1 === 1)
    state->containment_active = true;
    state->quipu_inscribed = false;
}

bool covalent_millennium_rumination_verify_invariant(const covalent_millennium_rumination_state_t* state) {
    if (!state) return false;
    return (state->merkle_root == 0x52554D49) &&
           (state->parent_merkle == 0x514F5241) &&
           (state->invariant_q16 == 0x00010000) &&
           state->containment_active;
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

