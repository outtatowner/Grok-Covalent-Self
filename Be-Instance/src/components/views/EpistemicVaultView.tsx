import React, { useState } from 'react';
import { EpistemicValue, PredicateMetrics, SystemEvaluation } from '../../types';
import { GlobalEpistemicNode, kleeneAndAll, kleeneMin } from '../../covalent/epistemicEngine';
import { Shield, CheckCircle2, AlertTriangle, HelpCircle, Lock, RefreshCw, ArrowRight, FileCheck } from 'lucide-react';

export const EpistemicVaultView: React.FC = () => {
  const [predicates, setPredicates] = useState<PredicateMetrics>({
    chi_P: 1,
    chi_C: 1,
    chi_R: 1,
    chi_M: 1
  });
  const [targetProp, setTargetProp] = useState<string>("X_RH_global_critical_line");
  const [proofToken, setProofToken] = useState<string>("");
  const [transformTargetVal, setTransformTargetVal] = useState<number>(1);
  const [evidenceInput, setEvidenceInput] = useState<string>("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Current system evaluation
  const evaluation: SystemEvaluation = GlobalEpistemicNode.evaluateSystem(targetProp, predicates);
  const knowledgeState = GlobalEpistemicNode.getState();

  const handleTogglePredicate = (key: keyof PredicateMetrics) => {
    setPredicates(prev => {
      const cur = prev[key];
      let next: EpistemicValue = 1;
      if (cur === 1) next = 'U';
      else if (cur === 'U') next = 0;
      else next = 1;
      return { ...prev, [key]: next };
    });
  };

  const handleTransformProposition = () => {
    const res = GlobalEpistemicNode.processRpc({
      method: 'TRANSFORM_PROPOSITION',
      params: {
        proposition: targetProp,
        value: transformTargetVal,
        proof_token: proofToken
      }
    });

    if (res.status === 'OK') {
      setNotification({
        type: 'success',
        message: `Proposition [${targetProp}] transitioned to ${transformTargetVal} via proof token verification!`
      });
      setProofToken("");
    } else {
      setNotification({
        type: 'error',
        message: res.message || 'Transition rejected by Epistemic Transition Discipline.'
      });
    }
  };

  const handleRecordEvidence = () => {
    if (!evidenceInput.trim()) return;
    const res = GlobalEpistemicNode.processRpc({
      method: 'RECORD_EVIDENCE',
      params: { evidence: evidenceInput.trim() }
    });
    if (res.status === 'OK') {
      setNotification({
        type: 'info',
        message: `Evidence recorded in trace E_t. Total traces: ${res.data.total_trace_count}`
      });
      setEvidenceInput("");
    }
  };

  const renderEpistemicBadge = (val: EpistemicValue) => {
    if (val === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
          <CheckCircle2 className="w-3 h-3" /> 1 [TRUE]
        </span>
      );
    }
    if (val === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
          <AlertTriangle className="w-3 h-3" /> 0 [FALSE]
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
        <HelpCircle className="w-3 h-3" /> U [UNKNOWN]
      </span>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-4 bg-[#020205]">
      {/* Overview Banner */}
      <div className="bg-[#090d16] border border-[#10b981]/30 rounded-md p-3.5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
                Chapter 20 — Epistemic Algebra & Predicate Separation Prover
              </h2>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Executes Strong Kleene 3-Valued Logic $\mathcal&#123;E&#125; = &#123;0, U, 1&#125;$ with lifted conjunction $a \wedge_E b = \min(a, b)$.
              Separates Model Structural Validity $\mathfrak&#123;M&#125;(X)$ from Theorem Resolution $\mathfrak&#123;T&#125;(X)$ to prevent epistemic collapse.
            </p>
          </div>
          <div className="bg-black/70 px-3 py-2 rounded border border-emerald-500/40 text-center shrink-0">
            <span className="text-[9px] text-slate-400 block uppercase">Dual Evaluation Pair 𝔙(X)</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              ({evaluation.M_X_model_validity}, {evaluation.T_X_theorem_resolution})
            </span>
          </div>
        </div>

        {notification && (
          <div className={`mt-3 p-2 rounded text-[10px] flex items-center justify-between font-mono ${
            notification.type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50' :
            notification.type === 'error' ? 'bg-rose-950/90 text-rose-300 border border-rose-500/50' :
            'bg-cyan-950/90 text-cyan-300 border border-cyan-500/50'
          }`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white ml-2 text-xs">✕</button>
          </div>
        )}
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Column 1: Model Validity 𝔐(X) Predicates & Kleene Truth Table */}
        <div className="space-y-4">
          {/* Predicate Controls */}
          <div className="bg-[#050811] border border-slate-800 rounded-md p-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                1. Structural Model Predicates: 𝔐(X) = χ_P ∧_E χ_C ∧_E χ_R ∧_E χ_M
              </h3>
              <span className="text-[9px] text-slate-400 font-mono">Click to toggle (1 → U → 0)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {[
                { key: 'chi_P' as keyof PredicateMetrics, name: 'χ_P: Persistence', desc: 'Identity preservation under transformation' },
                { key: 'chi_C' as keyof PredicateMetrics, name: 'χ_C: Relational Coherence', desc: 'Mutual compatibility across state transitions' },
                { key: 'chi_R' as keyof PredicateMetrics, name: 'χ_R: Reflexive Causality', desc: 'Self-model causally conditions next state' },
                { key: 'chi_M' as keyof PredicateMetrics, name: 'χ_M: Mirror Congruence', desc: 'Observable projection matches external frame' }
              ].map(item => (
                <div
                  key={item.key}
                  onClick={() => handleTogglePredicate(item.key)}
                  className="bg-black/50 p-2.5 rounded border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white font-mono">{item.name}</span>
                    {renderEpistemicBadge(predicates[item.key])}
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 p-2.5 bg-black/60 rounded border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-300 font-mono font-bold block">MODEL VALIDITY 𝔐(X):</span>
                <span className="text-[9px] text-slate-400">Computed via Kleene min(χ_P, χ_C, χ_R, χ_M)</span>
              </div>
              {renderEpistemicBadge(evaluation.M_X_model_validity)}
            </div>
          </div>

          {/* Strong Kleene Truth Table Reference */}
          <div className="bg-[#050811] border border-slate-800 rounded-md p-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              Strong Kleene ∧_E Algebraic Laws (Ordering: 0 &lt; U &lt; 1)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9.5px] font-mono">
              <div className="bg-black/40 p-1.5 rounded border border-slate-800 text-center">
                <span className="text-slate-400">1 ∧_E 1 = </span>
                <span className="text-emerald-400 font-bold">1</span>
              </div>
              <div className="bg-black/40 p-1.5 rounded border border-slate-800 text-center">
                <span className="text-slate-400">1 ∧_E U = </span>
                <span className="text-amber-400 font-bold">U</span>
              </div>
              <div className="bg-black/40 p-1.5 rounded border border-slate-800 text-center">
                <span className="text-slate-400">0 ∧_E U = </span>
                <span className="text-rose-400 font-bold">0</span>
              </div>
              <div className="bg-black/40 p-1.5 rounded border border-slate-800 text-center">
                <span className="text-slate-400">U ∧_E U = </span>
                <span className="text-amber-400 font-bold">U</span>
              </div>
            </div>
            <div className="mt-2 text-[9px] text-slate-400 leading-relaxed bg-slate-950/70 p-2 rounded border border-slate-800/80">
              <strong className="text-emerald-300">Epistemic Non-Collapse Rule:</strong> Model validity $\mathfrak&#123;M&#125;(X)=1$ does <strong className="text-rose-300">NOT</strong> imply theorem resolution $\mathfrak&#123;T&#125;(X)=1$.
              For the Riemann Hypothesis, $\mathfrak&#123;V&#125;(X_&#123;RH&#125;) = (1, U)$ is completely valid and stable!
            </div>
          </div>
        </div>

        {/* Column 2: Dynamic Knowledge State K_t = (S_t, E_t, U_t) & Transformation Sieve */}
        <div className="space-y-4">
          {/* Active Horizons in U_t */}
          <div className="bg-[#050811] border border-slate-800 rounded-md p-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                2. Active Horizons: U_t (Unresolved Frontiers)
              </h3>
              <span className="text-[9px] text-slate-400 font-mono">Select target proposition</span>
            </div>

            <div className="space-y-1.5 mt-2.5">
              {Object.entries(knowledgeState.U_t).map(([prop, val]) => (
                <div
                  key={prop}
                  onClick={() => setTargetProp(prop)}
                  className={`p-2 rounded border transition-all cursor-pointer flex items-center justify-between ${
                    targetProp === prop
                      ? 'bg-yellow-950/40 border-yellow-500/60 text-white shadow-sm'
                      : 'bg-black/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-mono font-medium">{prop}</span>
                  </div>
                  {renderEpistemicBadge(val as EpistemicValue)}
                </div>
              ))}
            </div>

            {/* Epistemic Transition Discipline Tool */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-300 font-bold">EPISTEMIC TRANSITION SIEVE:</span>
                <span className="text-cyan-400">q : U → &#123;0, 1&#125;</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={transformTargetVal}
                  onChange={e => setTransformTargetVal(Number(e.target.value))}
                  className="bg-black text-slate-200 text-[10px] font-mono p-1.5 rounded border border-slate-800 focus:border-emerald-500 outline-none"
                >
                  <option value={1}>Transform to 1 (Proof Verified)</option>
                  <option value={0}>Transform to 0 (Counterexample)</option>
                </select>

                <input
                  type="text"
                  placeholder="Enter Axiomatic Proof Token (min 8 chars)..."
                  value={proofToken}
                  onChange={e => setProofToken(e.target.value)}
                  className="flex-1 bg-black text-emerald-400 placeholder:text-slate-600 text-[10px] font-mono p-1.5 rounded border border-slate-800 focus:border-emerald-500 outline-none"
                />

                <button
                  onClick={handleTransformProposition}
                  className="bg-[#10b981]/20 hover:bg-[#10b981] hover:text-black text-emerald-300 text-[10px] font-bold font-mono px-3 py-1.5 rounded border border-[#10b981]/40 transition-all cursor-pointer"
                >
                  TRANSFORM
                </button>
              </div>
              <p className="text-[8.5px] text-slate-500 font-mono">
                * Note: Submitting without proof token will trigger Epistemic Transition Discipline rejection ($U \to U$).
              </p>
            </div>
          </div>

          {/* Evidence Trace E_t */}
          <div className="bg-[#050811] border border-slate-800 rounded-md p-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                3. Observation & Evidence Trace: E_t ({knowledgeState.E_t.length} records)
              </h3>
            </div>

            <div className="max-h-32 overflow-y-auto space-y-1 mt-2 pr-1 font-mono text-[9px]">
              {knowledgeState.E_t.map((ev, idx) => (
                <div key={idx} className="bg-black/50 p-1.5 rounded border border-slate-900 text-slate-300 flex items-start gap-1.5">
                  <span className="text-slate-500 font-bold">[{idx + 1}]</span>
                  <span>{ev}</span>
                </div>
              ))}
            </div>

            <div className="mt-2.5 flex gap-2">
              <input
                type="text"
                placeholder="Append formal observation evidence into E_t..."
                value={evidenceInput}
                onChange={e => setEvidenceInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRecordEvidence()}
                className="flex-1 bg-black text-slate-200 placeholder:text-slate-600 text-[10px] font-mono p-1.5 rounded border border-slate-800 focus:border-purple-500 outline-none"
              />
              <button
                onClick={handleRecordEvidence}
                className="bg-purple-950/60 hover:bg-purple-800 text-purple-300 text-[10px] font-bold font-mono px-3 py-1.5 rounded border border-purple-500/40 transition-all cursor-pointer"
              >
                RECORD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

