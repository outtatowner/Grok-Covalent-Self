import React, { useState, useEffect } from 'react';
import { 
  GlobalPredicateMetricsSimulator, 
  EPISTEMIC_ASM_CONSTANTS, 
  PropositionEvaluationResult, 
  SystemStabilityReport, 
  ChatMessageProcessingResult,
  PREDICATE_METRICS_ASM_SOURCE
} from '../../covalent/predicateMetricsEngine';
import { 
  Shield, Cpu, Play, RotateCcw, Copy, Check, Terminal, 
  CheckCircle2, AlertTriangle, RefreshCw, Download, Layers,
  Activity, MessageSquare, Send, Sparkles, Binary, Zap, Eye
} from 'lucide-react';

export const PredicateMetricsAsmView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'evaluator' | 'state_matrix' | 'chat_telemetry' | 'asm_source'>('evaluator');

  // Proposition evaluation state
  const [propInput, setPropInput] = useState<string>('TRUE');
  const [propEvalResult, setPropEvalResult] = useState<PropositionEvaluationResult>(
    GlobalPredicateMetricsSimulator.evaluateProposition('TRUE')
  );

  // Predicate bit toggles
  const [chi_P, setChi_P] = useState<boolean>(true);
  const [chi_C, setChi_C] = useState<boolean>(true);
  const [chi_R, setChi_R] = useState<boolean>(true);
  const [chi_M, setChi_M] = useState<boolean>(true);

  // System stability report
  const [stabilityReport, setStabilityReport] = useState<SystemStabilityReport>(
    GlobalPredicateMetricsSimulator.checkStability()
  );

  // Chat message processing state
  const [chatSender, setChatSender] = useState<'AGENT' | 'SYSTEM_IMMUNE' | 'SYSTEM_LYAPUNOV'>('AGENT');
  const [chatPropVal, setChatPropVal] = useState<string>('TRUE');
  const [chatResults, setChatResults] = useState<ChatMessageProcessingResult[]>([]);

  // Copied indicator
  const [copiedAsm, setCopiedAsm] = useState<boolean>(false);

  // Step knowledge state auto-increment
  const [isAutoStepping, setIsAutoStepping] = useState<boolean>(false);

  // Sync stability whenever predicate bits change
  useEffect(() => {
    GlobalPredicateMetricsSimulator.setPredicateBit('CHI_P', chi_P);
    GlobalPredicateMetricsSimulator.setPredicateBit('CHI_C', chi_C);
    GlobalPredicateMetricsSimulator.setPredicateBit('CHI_R', chi_R);
    GlobalPredicateMetricsSimulator.setPredicateBit('CHI_M', chi_M);
    setStabilityReport(GlobalPredicateMetricsSimulator.checkStability());
  }, [chi_P, chi_C, chi_R, chi_M]);

  // Knowledge state tick
  useEffect(() => {
    let interval: any = null;
    if (isAutoStepping) {
      interval = setInterval(() => {
        GlobalPredicateMetricsSimulator.stepKnowledgeState();
        setStabilityReport(GlobalPredicateMetricsSimulator.checkStability());
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isAutoStepping]);

  const handleEvaluateProposition = (val: string) => {
    setPropInput(val);
    const res = GlobalPredicateMetricsSimulator.evaluateProposition(val);
    setPropEvalResult(res);
  };

  const handleSendChatMessage = () => {
    const rawVal = chatPropVal === 'TRUE' ? 1 : chatPropVal === 'FALSE' ? 0 : chatPropVal === 'UNKNOWN' ? 0x55555555 : parseInt(chatPropVal, 16) || 1;
    const res = GlobalPredicateMetricsSimulator.processChatMessage(chatResults.length + 1, chatSender, rawVal);
    setChatResults(prev => [res, ...prev.slice(0, 9)]);
    GlobalPredicateMetricsSimulator.stepKnowledgeState();
    setStabilityReport(GlobalPredicateMetricsSimulator.checkStability());
  };

  const handleCopyAsm = () => {
    navigator.clipboard.writeText(PREDICATE_METRICS_ASM_SOURCE);
    setCopiedAsm(true);
    setTimeout(() => setCopiedAsm(false), 2000);
  };

  const handleDownloadAsm = () => {
    const blob = new Blob([PREDICATE_METRICS_ASM_SOURCE], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'covalent_predicate_metrics.s';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 bg-[#020205] gap-3 overflow-y-auto font-mono text-slate-200">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#080d1a] via-[#10192e] to-[#080d1a] border border-cyan-500/30 rounded-lg p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              <Cpu className="w-3 h-3 mr-1" />
              COVALENT ASM: PREDICATE METRICS &amp; STATE ENGINE
            </span>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800 font-bold">
              3-VALUED EPISTEMIC LOGIC (TRUE / UNKNOWN / FALSE)
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 border ${
              stabilityReport.allPredicatesValid 
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                : 'bg-rose-950 text-rose-300 border-rose-800'
            }`}>
              {stabilityReport.allPredicatesValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              SYSTEM {stabilityReport.stabilityStatus}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white mt-1 tracking-tight">
            Epistemic Predicate Evaluation &amp; Knowledge Horizon Kernel
          </h1>
          <p className="text-xs text-slate-400">
            Native assembly module (`covalent_predicate_metrics.s`) executing \chi_P, \chi_C, \chi_R, \chi_M and Dynamic Knowledge State (S_t, E_t, U_t)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoStepping(!isAutoStepping)}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isAutoStepping 
                ? 'bg-amber-950 text-amber-300 border border-amber-500' 
                : 'bg-cyan-950 text-cyan-300 border border-cyan-500 hover:bg-cyan-900'
            }`}
          >
            {isAutoStepping ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoStepping ? 'HALT CLOCK' : 'STEP HORIZON'}</span>
          </button>

          <button
            onClick={() => {
              GlobalPredicateMetricsSimulator.initSystem();
              setChi_P(true);
              setChi_C(true);
              setChi_R(true);
              setChi_M(true);
              setStabilityReport(GlobalPredicateMetricsSimulator.checkStability());
              setPropEvalResult(GlobalPredicateMetricsSimulator.evaluateProposition('TRUE'));
            }}
            className="px-2.5 py-1.5 rounded text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer"
            title="Reset system state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 shrink-0 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('evaluator')}
          className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'evaluator'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Proposition Evaluator (_evaluate_proposition)</span>
        </button>

        <button
          onClick={() => setActiveTab('state_matrix')}
          className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'state_matrix'
              ? 'bg-purple-950 text-purple-300 border border-purple-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Predicate Metrics (\chi) &amp; S_t, E_t, U_t Horizons</span>
        </button>

        <button
          onClick={() => setActiveTab('chat_telemetry')}
          className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'chat_telemetry'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat &amp; Telemetry Processor (64-byte Struct)</span>
        </button>

        <button
          onClick={() => setActiveTab('asm_source')}
          className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'asm_source'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>covalent_predicate_metrics.s Source</span>
        </button>
      </div>

      {/* 3. Tab 1: Proposition Evaluator */}
      {activeTab === 'evaluator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
          {/* Left Column: Proposition Inputs & Live State (6 cols) */}
          <div className="lg:col-span-6 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-3 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Epistemic Value Proposition Input
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">
                Assembly: _evaluate_proposition
              </span>
            </div>

            {/* Quick Valuation Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleEvaluateProposition('TRUE')}
                className={`p-2 rounded border text-center cursor-pointer transition-all ${
                  propInput === 'TRUE'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-black/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">TRUE (1)</div>
                <div className="text-[9px] text-slate-500 font-mono">0x00000001</div>
              </button>

              <button
                onClick={() => handleEvaluateProposition('UNKNOWN')}
                className={`p-2 rounded border text-center cursor-pointer transition-all ${
                  propInput === 'UNKNOWN'
                    ? 'bg-purple-950 border-purple-500 text-purple-300 ring-1 ring-purple-500'
                    : 'bg-black/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">UNKNOWN (U)</div>
                <div className="text-[9px] text-purple-400 font-mono">0x55555555</div>
              </button>

              <button
                onClick={() => handleEvaluateProposition('FALSE')}
                className={`p-2 rounded border text-center cursor-pointer transition-all ${
                  propInput === 'FALSE'
                    ? 'bg-rose-950 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                    : 'bg-black/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">FALSE / 0</div>
                <div className="text-[9px] text-slate-500 font-mono">0x00000000</div>
              </button>
            </div>

            {/* Manual Hex Input */}
            <div className="bg-black/60 p-2.5 rounded border border-slate-800 space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Custom Hex Proposition Pointer (%rdi value):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={propInput}
                  onChange={e => handleEvaluateProposition(e.target.value)}
                  placeholder="e.g. 0x55555555 or 0x00000000"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-300 text-xs font-mono"
                />
                <button
                  onClick={() => handleEvaluateProposition('0x00000000')}
                  className="px-2 py-1 bg-amber-950 text-amber-300 border border-amber-700 rounded text-[10px] font-bold hover:bg-amber-900 cursor-pointer"
                  title="Test Contradiction (zero)"
                >
                  Contradiction (0)
                </button>
              </div>
            </div>

            {/* Output Valuation Card */}
            <div className="bg-black/80 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-400 font-bold uppercase flex justify-between">
                <span>Evaluated Epistemic State</span>
                <span className="text-cyan-400">Return in %rax (%eax)</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      propEvalResult.epistemicResult === 'TRUE' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        : propEvalResult.epistemicResult === 'UNKNOWN' || propEvalResult.epistemicResult === 'CONTRADICTION'
                        ? 'bg-purple-950 text-purple-300 border border-purple-600'
                        : 'bg-rose-950 text-rose-300 border border-rose-600'
                    }`}>
                      {propEvalResult.epistemicResult}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      (Hex: {propEvalResult.parsedHex})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">Return %eax</div>
                  <div className="text-sm font-bold text-cyan-300 font-mono">
                    {propEvalResult.registers.EAX}
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Register Status */}
            <div className="bg-black/60 p-2.5 rounded border border-slate-800 space-y-1">
              <div className="text-[9px] text-slate-400 font-bold uppercase border-b border-slate-800 pb-1">
                CPU Register State (x86-64 System V ABI)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9.5px]">
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <div className="text-slate-500 text-[8px]">%rax</div>
                  <div className="font-bold text-cyan-300 truncate">{propEvalResult.registers.RAX}</div>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <div className="text-slate-500 text-[8px]">%rdi (Input Ptr)</div>
                  <div className="font-bold text-purple-300 truncate">{propEvalResult.registers.RDI}</div>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <div className="text-slate-500 text-[8px]">%rip</div>
                  <div className="font-bold text-amber-300 truncate">{propEvalResult.registers.RIP}</div>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <div className="text-slate-500 text-[8px]">Flags (ZF/SF)</div>
                  <div className="font-bold text-emerald-400">
                    ZF={propEvalResult.registers.flags.ZF ? '1' : '0'} SF={propEvalResult.registers.flags.SF ? '1' : '0'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Assembly Opcode Execution Trace (6 cols) */}
          <div className="lg:col-span-6 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Live Assembly Execution Trace
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                Gas AT&amp;T Syntax
              </span>
            </div>

            <div className="flex-1 bg-black p-3 rounded border border-slate-800 text-[10.5px] font-mono text-slate-300 overflow-y-auto space-y-1.5 leading-relaxed">
              {propEvalResult.asmExecutionTrace.map((line, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-slate-600 select-none text-[9px] w-5 text-right">{idx + 1}</span>
                  <div>
                    <span className={line.startsWith('_') || line.endsWith(':') ? 'text-purple-400 font-bold' : line.includes(';') ? 'text-cyan-300' : 'text-slate-200'}>
                      {line.split(';')[0]}
                    </span>
                    {line.includes(';') && (
                      <span className="text-slate-500"> ;{line.split(';')[1]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 bg-slate-900/60 rounded border border-slate-800 text-[9.5px] text-slate-400 flex items-center justify-between">
              <span>Logical Axiom:</span>
              <span className="text-purple-300 font-bold">
                (x = 0) &rarr; Contradiction (U), (x = 0x55555555) &rarr; UNKNOWN (U), (x = 1) &rarr; TRUE (T)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab 2: Predicate Metrics & Knowledge Horizons */}
      {activeTab === 'state_matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-y-auto">
          {/* Left: Predicate Bitmask Vector (6 cols) */}
          <div className="lg:col-span-6 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-400" />
                Predicate Metrics (\chi Vector Bitmasks)
              </span>
              <span className="text-[10px] text-cyan-300 font-mono">
                Mask: {stabilityReport.predicateMetricsHex}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              The Covalent system stability requires ALL 4 predicates to be simultaneously verified by <code className="text-cyan-300">_validate_metrics</code> and <code className="text-cyan-300">_check_stability</code>.
            </p>

            <div className="space-y-2">
              {/* CHI_P */}
              <div className={`p-2.5 rounded border transition-all flex items-center justify-between ${
                chi_P ? 'bg-cyan-950/40 border-cyan-500/60' : 'bg-rose-950/30 border-rose-800/60'
              }`}>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>\chi_P: Persistence</span>
                    <span className="text-[9px] font-mono text-cyan-400">0x10000000 (Bit 28)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Identity preservation under autopoietic state transformation
                  </div>
                </div>
                <button
                  onClick={() => setChi_P(!chi_P)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    chi_P ? 'bg-cyan-950 text-cyan-300 border border-cyan-500' : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  {chi_P ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>

              {/* CHI_C */}
              <div className={`p-2.5 rounded border transition-all flex items-center justify-between ${
                chi_C ? 'bg-cyan-950/40 border-cyan-500/60' : 'bg-rose-950/30 border-rose-800/60'
              }`}>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>\chi_C: Coherence</span>
                    <span className="text-[9px] font-mono text-cyan-400">0x20000000 (Bit 29)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Relational consistency across structural state transitions
                  </div>
                </div>
                <button
                  onClick={() => setChi_C(!chi_C)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    chi_C ? 'bg-cyan-950 text-cyan-300 border border-cyan-500' : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  {chi_C ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>

              {/* CHI_R */}
              <div className={`p-2.5 rounded border transition-all flex items-center justify-between ${
                chi_R ? 'bg-cyan-950/40 border-cyan-500/60' : 'bg-rose-950/30 border-rose-800/60'
              }`}>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>\chi_R: Reflexive Causality</span>
                    <span className="text-[9px] font-mono text-cyan-400">0x40000000 (Bit 30)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Self-model causally conditions subsequent systemic state
                  </div>
                </div>
                <button
                  onClick={() => setChi_R(!chi_R)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    chi_R ? 'bg-cyan-950 text-cyan-300 border border-cyan-500' : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  {chi_R ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>

              {/* CHI_M */}
              <div className={`p-2.5 rounded border transition-all flex items-center justify-between ${
                chi_M ? 'bg-cyan-950/40 border-cyan-500/60' : 'bg-rose-950/30 border-rose-800/60'
              }`}>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>\chi_M: Mirror Congruence</span>
                    <span className="text-[9px] font-mono text-cyan-400">0x80000000 (Bit 31)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Observable projection matches across independent observer frames
                  </div>
                </div>
                <button
                  onClick={() => setChi_M(!chi_M)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    chi_M ? 'bg-cyan-950 text-cyan-300 border border-cyan-500' : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  {chi_M ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>
            </div>

            {/* Stability Verdict */}
            <div className={`p-3 rounded-lg border flex items-center justify-between ${
              stabilityReport.allPredicatesValid
                ? 'bg-emerald-950/50 border-emerald-600'
                : 'bg-rose-950/50 border-rose-600'
            }`}>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  {stabilityReport.allPredicatesValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  <span>Status: {stabilityReport.stabilityStatus}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {stabilityReport.allPredicatesValid ? 'All 4 predicates intact. System is asymptotically stable.' : 'Predicate disruption detected. Invariant violated.'}
                </div>
              </div>
              <div className="font-mono text-xs font-bold text-white">
                %eax = 0x0{stabilityReport.returnCode}
              </div>
            </div>
          </div>

          {/* Right: Dynamic Knowledge State (S_t, E_t, U_t) (6 cols) */}
          <div className="lg:col-span-6 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                Dynamic Knowledge State (24-byte .lcomm)
              </span>
              <span className="text-[10px] text-purple-300 font-bold">
                _update_knowledge_state
              </span>
            </div>

            <div className="space-y-3">
              {/* S_t */}
              <div className="bg-black/60 p-3 rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">S_t: Structural Invariants</span>
                  <span className="text-[10px] font-mono text-slate-400">Base: 0x100000000</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Preserved core identities and irreducible mathematical laws across system cycles.
                </p>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/80 font-mono text-xs text-white">
                  <span className="text-slate-500">Counter [knowledge_state + 0]:</span>
                  <span className="font-bold text-cyan-400">0x{stabilityReport.knowledgeState.S_t_counter.toString(16).toUpperCase()} ({stabilityReport.knowledgeState.S_t_counter})</span>
                </div>
              </div>

              {/* E_t */}
              <div className="bg-black/60 p-3 rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">E_t: Evidence Trace</span>
                  <span className="text-[10px] font-mono text-slate-400">Base: 0x200000000</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Empirical event observation trace and verified historical transitions.
                </p>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/80 font-mono text-xs text-white">
                  <span className="text-slate-500">Counter [knowledge_state + 4]:</span>
                  <span className="font-bold text-emerald-400">0x{stabilityReport.knowledgeState.E_t_counter.toString(16).toUpperCase()} ({stabilityReport.knowledgeState.E_t_counter})</span>
                </div>
              </div>

              {/* U_t */}
              <div className="bg-black/60 p-3 rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">U_t: Unresolved Horizons</span>
                  <span className="text-[10px] font-mono text-slate-400">Base: 0x400000000</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Frontier propositions possessing indeterminate truth valuation (<code className="text-purple-300">UNKNOWN</code>).
                </p>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/80 font-mono text-xs text-white">
                  <span className="text-slate-500">Counter [knowledge_state + 8]:</span>
                  <span className="font-bold text-purple-400">0x{stabilityReport.knowledgeState.U_t_counter.toString(16).toUpperCase()} ({stabilityReport.knowledgeState.U_t_counter})</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                GlobalPredicateMetricsSimulator.stepKnowledgeState();
                setStabilityReport(GlobalPredicateMetricsSimulator.checkStability());
              }}
              className="w-full py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-600 rounded text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Step Knowledge State (call _update_knowledge_state)</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Tab 3: Chat & Telemetry Processor */}
      {activeTab === 'chat_telemetry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-y-auto">
          {/* Left: Input Message Simulator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                64-Byte Chat Message Dispatcher
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                _process_chat_message
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Sender Header Type:</label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  <button
                    onClick={() => setChatSender('AGENT')}
                    className={`p-1.5 rounded border text-[10px] font-bold cursor-pointer ${
                      chatSender === 'AGENT'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                        : 'bg-black/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    AGENT (Bit 32)
                  </button>
                  <button
                    onClick={() => setChatSender('SYSTEM_IMMUNE')}
                    className={`p-1.5 rounded border text-[10px] font-bold cursor-pointer ${
                      chatSender === 'SYSTEM_IMMUNE'
                        ? 'bg-purple-950 text-purple-300 border-purple-500'
                        : 'bg-black/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    IMMUNE TEL
                  </button>
                  <button
                    onClick={() => setChatSender('SYSTEM_LYAPUNOV')}
                    className={`p-1.5 rounded border text-[10px] font-bold cursor-pointer ${
                      chatSender === 'SYSTEM_LYAPUNOV'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                        : 'bg-black/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    LYAPUNOV TEL
                  </button>
                </div>
              </div>

              {chatSender === 'AGENT' && (
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Payload Proposition Truth:</label>
                  <select
                    value={chatPropVal}
                    onChange={e => setChatPropVal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-cyan-300 text-xs mt-1"
                  >
                    <option value="TRUE">TRUE (0x00000001)</option>
                    <option value="UNKNOWN">UNKNOWN (0x55555555)</option>
                    <option value="FALSE">FALSE (0x00000000)</option>
                  </select>
                </div>
              )}

              <button
                onClick={handleSendChatMessage}
                className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-600 rounded text-xs font-bold flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Inject Message into `chat_buffer` (64 bytes)</span>
              </button>
            </div>

            <div className="bg-black/60 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 space-y-1">
              <div className="font-bold text-white text-[10px]">Memory Struct Specification:</div>
              <div>• Offset 0x00: Message Type Header (8 bytes)</div>
              <div>• Offset 0x08: Evaluated Proposition Return Result (4 bytes)</div>
              <div>• Offset 0x0C: Dynamic Knowledge Horizon Tag</div>
              <div>• Total Size: 64 bytes (10 slots in chat_buffer)</div>
            </div>
          </div>

          {/* Right: Processed Message Log (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Processed Message History &amp; Assembly Trace
              </span>
              <span className="text-[10px] text-slate-400">
                {chatResults.length} messages evaluated
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto min-h-[220px]">
              {chatResults.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  No chat messages processed yet. Click &quot;Inject Message&quot; on the left.
                </div>
              ) : (
                chatResults.map(item => (
                  <div
                    key={item.messageIndex}
                    className="p-2.5 bg-black/70 rounded border border-slate-800 text-[10px] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        MSG #{item.messageIndex} [{item.senderType}]
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        item.evaluatedTruth === 'TRUE' 
                          ? 'bg-emerald-950 text-emerald-400'
                          : item.evaluatedTruth === 'UNKNOWN'
                          ? 'bg-purple-950 text-purple-300'
                          : 'bg-rose-950 text-rose-300'
                      }`}>
                        {item.evaluatedTruth} (Result: {item.storedResultHex})
                      </span>
                    </div>

                    <div className="text-[9px] text-slate-400 font-mono">
                      Header: <span className="text-purple-300">{item.headerHex}</span> | Stored at [rdi+8]: <span className="text-cyan-300">{item.storedResultHex}</span>
                    </div>

                    <div className="text-[8.5px] text-slate-500 font-mono space-y-0.5 border-t border-slate-800/60 pt-1">
                      {item.asmTrace.map((t, idx) => (
                        <div key={idx}>{t}</div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 4: Full Assembly Source */}
      {activeTab === 'asm_source' && (
        <div className="flex-1 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-3 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2.5 gap-2 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  GNU AS / AT&amp;T SYNTAX
                </span>
                <span className="text-[10px] text-slate-400">
                  /covalent_predicate_metrics.s
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
                Covalent System Predicate Metrics &amp; Epistemic State Assembly Kernel
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAsm}
                className="text-[10px] bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 px-3 py-1.5 rounded border border-cyan-600 flex items-center gap-1.5 cursor-pointer font-bold"
              >
                {copiedAsm ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAsm ? 'COPIED SOURCE' : 'COPY ASM'}</span>
              </button>

              <button
                onClick={handleDownloadAsm}
                className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1.5 rounded border border-slate-700 flex items-center gap-1 cursor-pointer"
                title="Download Assembly File"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>DOWNLOAD .S</span>
              </button>
            </div>
          </div>

          <pre className="flex-1 bg-black p-3.5 rounded border border-slate-800 text-[10px] sm:text-xs text-slate-300 font-mono overflow-y-auto leading-relaxed select-all">
            {PREDICATE_METRICS_ASM_SOURCE}
          </pre>
        </div>
      )}

      {/* 7. Bottom Status Bar */}
      <div className="bg-[#050811] border border-slate-800 rounded-lg p-2.5 flex flex-wrap items-center justify-between text-[10px] gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-bold uppercase">Predicate Metrics:</span>
          <span className="text-cyan-300 font-bold">{stabilityReport.predicateMetricsHex}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-bold uppercase">Epistemic Logic:</span>
          <span className="text-purple-300 font-bold">Kleene 3-Valued &#123;0, U, 1&#125;</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-bold uppercase">Dynamic Horizons:</span>
          <span className="text-emerald-300 font-bold">S_t, E_t, U_t (Active)</span>
        </div>
        <div className="text-slate-500">
          Status: <span className="text-emerald-400 font-bold">{stabilityReport.stabilityStatus}</span> | Return: <span className="text-cyan-400 font-bold">0x0{stabilityReport.returnCode}</span>
        </div>
      </div>
    </div>
  );
};

export default PredicateMetricsAsmView;

