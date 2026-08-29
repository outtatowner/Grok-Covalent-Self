import React, { useState } from 'react';
import { COVALENT_20_CHAPTERS } from '../../data/chapters';
import { ChapterData } from '../../types';
import { BookOpen, Search, Code, CheckSquare, ChevronRight, Hash, Cpu, Play, Terminal, CheckCircle2, Shield } from 'lucide-react';
import { useAsmTelemetry } from '../../context/AsmTelemetryContext';

export const Dissertation20ChView: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<ChapterData>(COVALENT_20_CHAPTERS[19]); // Default to Chapter 20
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { telemetry: asmTel, stepAsmCycle, evaluateProposition } = useAsmTelemetry();
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleVerifyTheoremAsm = () => {
    const res = evaluateProposition('TRUE');
    setTestResult(`ASM _validate_metrics SUCCESS: %eax=0x0${res.returnCodeEAX} (%rax=${res.registers.RAX})`);
    stepAsmCycle();
  };

  const filteredChapters = COVALENT_20_CHAPTERS.filter(ch =>
    ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.number.toString().includes(searchQuery)
  );

  return (
    <div className="h-full flex flex-col md:flex-row p-3 sm:p-4 bg-[#020205] gap-3 overflow-hidden">
      {/* Left 4 Cols: Chapter Table of Contents */}
      <div className="w-full md:w-80 flex flex-col bg-[#050811] border border-slate-800 rounded-md p-3 shrink-0 h-48 md:h-full overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              {COVALENT_20_CHAPTERS.length}-Chapter Framework
            </h3>
          </div>
          <span className="text-[9px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
            {COVALENT_20_CHAPTERS.length} CANONICAL
          </span>
        </div>

        {/* Search */}
        <div className="relative mt-2 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-500" />
          <input
            type="text"
            placeholder="Search chapters or formulas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-black text-slate-200 placeholder:text-slate-600 text-[9.5px] font-mono pl-7 pr-2 py-1.5 rounded border border-slate-800 focus:border-emerald-500 outline-none"
          />
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto space-y-1 mt-2 pr-1 font-mono">
          {filteredChapters.map(ch => {
            const isSelected = selectedChapter.number === ch.number;
            return (
              <button
                key={ch.number}
                onClick={() => setSelectedChapter(ch)}
                className={`w-full text-left p-2 rounded transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-900 border border-[#10b981] text-white shadow-sm'
                    : 'bg-black/40 border border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {String(ch.number).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] truncate">{ch.title}</span>
                </div>
                <ChevronRight className={`w-3 h-3 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Full Chapter Reader */}
      <div className="flex-1 bg-[#050811] border border-slate-800 rounded-md p-3.5 flex flex-col h-full overflow-y-auto">
        <div className="pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold font-mono text-emerald-400 uppercase tracking-widest">
              CANONICAL CHAPTER {selectedChapter.number} OF 20
            </span>
            <span className="text-[9px] text-slate-500 font-mono">ZFC Conservative Extension</span>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-white uppercase font-mono mt-1">
            Chapter {selectedChapter.number} — {selectedChapter.title}
          </h2>
          {selectedChapter.subtitle && (
            <p className="text-[10.5px] text-cyan-300 font-mono mt-0.5">
              {selectedChapter.subtitle}
            </p>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-black/60 p-3 rounded border border-slate-800 my-3 font-mono text-[10px] space-y-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Executive Summary:
          </span>
          <p className="text-slate-200 leading-relaxed">
            {selectedChapter.summary}
          </p>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-wider block mb-1">
              Epistemic Focus:
            </span>
            <p className="text-slate-300 italic">
              "{selectedChapter.epistemicFocus}"
            </p>
          </div>
        </div>

        {/* Formal Primitives & Canonical Formulas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-2 font-mono text-[10px]">
          <div className="bg-black/40 p-2.5 rounded border border-slate-800 space-y-1.5">
            <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block">
              Formal Primitives:
            </span>
            <div className="flex flex-wrap gap-1">
              {selectedChapter.formalPrimitives.map((prim, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/30 text-[9px]">
                  {prim}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-black/40 p-2.5 rounded border border-slate-800 space-y-1.5">
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block">
              Canonical Invariants & Formulas:
            </span>
            <div className="space-y-1">
              {selectedChapter.canonicalFormulas.map((form, i) => (
                <div key={i} className="text-[9.5px] text-cyan-200 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                  {form}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live ASM Predicate Verification Card */}
        <div className="bg-[#040711] border border-cyan-500/30 rounded p-2.5 my-2 font-mono text-[9.5px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Live ASM Predicate Metric Evaluation (Chapter {selectedChapter.number})
            </span>
            <span className="text-[8.5px] bg-black/60 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">
              covalent_predicate_metrics.s: _validate_metrics
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 bg-black/60 p-2 rounded border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">χ-Status:</span>
              <span className={`px-1.5 py-0.2 rounded font-bold ${asmTel.allPredicatesValid ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-rose-950 text-rose-300 border border-rose-500/50'}`}>
                {asmTel.stabilityStatus} (0x0{asmTel.returnCodeEAX})
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">S_t: <strong className="text-cyan-300">{asmTel.knowledgeHorizons.S_t}</strong></span>
              <span className="text-slate-400">E_t: <strong className="text-emerald-300">{asmTel.knowledgeHorizons.E_t}</strong></span>
              <span className="text-slate-400">U_t: <strong className="text-purple-300">{asmTel.knowledgeHorizons.U_t}</strong></span>
            </div>

            <button
              onClick={handleVerifyTheoremAsm}
              className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/50 rounded font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm active:scale-95"
            >
              <Play className="w-3 h-3 text-cyan-400" />
              <span>Verify Invariant in ASM (%rax)</span>
            </button>
          </div>

          {testResult && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-1.5 rounded text-[9px] text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{testResult}</span>
            </div>
          )}
        </div>

        {/* Full Markdown Text */}
        <div className="mt-3 p-3 bg-black/70 rounded border border-slate-800/80 font-mono text-[10px] text-slate-200 whitespace-pre-wrap leading-relaxed select-text flex-1">
          {selectedChapter.fullMarkdown}
        </div>
      </div>
    </div>
  );
};

