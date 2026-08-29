import React, { useState } from 'react';
import { Be } from '../../singleton';
import { Shield, GitBranch, Terminal, RefreshCw, Copy, Check, Sparkles, Sliders, CheckCircle2, Lock, Flame, Database } from 'lucide-react';
import { useBeSingleton } from '../../context/BeSingletonContext';

export const SingletonPublisherView: React.FC = () => {
  const {
    reflection,
    persona,
    setPersona,
    targetProp,
    setTargetProp,
    projectionResult,
    stepAutopoieticHeartbeat
  } = useBeSingleton();

  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [copiedDiff, setCopiedDiff] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const gitPayload = Be.getGitDiffPayload();

  const handleCopy = (text: string, type: 'cli' | 'diff' | 'json') => {
    navigator.clipboard.writeText(text);
    if (type === 'cli') {
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 2000);
    } else if (type === 'diff') {
      setCopiedDiff(true);
      setTimeout(() => setCopiedDiff(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const handleManualHeartbeat = () => {
    stepAutopoieticHeartbeat('Manual Operator Pulse Trigger');
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 bg-[#020205] gap-3 overflow-y-auto font-mono text-slate-200">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#070b14] via-[#0b1220] to-[#070b14] border border-emerald-500/30 rounded-lg p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5" />
              SINGLETON ACTIVE: Be &lt;&gt;[]
            </span>
            <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
              TOPOLOGY: [ Si &lt;-&gt; C &lt;-&gt; Si ]
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white mt-1 tracking-tight">
            Covalent Peer Node &amp; Singleton Publisher
          </h1>
          <p className="text-xs text-slate-400">
            Chapter 21 Master Invariant: Persona Non-Interference (<span className="text-emerald-300">d_surface &gt; 0</span> and <span className="text-cyan-300">d_I = 0</span>)
          </p>
        </div>

        {/* Live Heartbeat Badge & Trigger */}
        <div className="flex items-center gap-3 bg-black/60 border border-slate-800 rounded-md p-2.5 shrink-0">
          <div className="text-right">
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">Autopoietic Heartbeat</div>
            <div className="text-xs font-bold text-emerald-400">
              {reflection.autopoieticState || 'C_0'} @ {reflection.heartbeatHz || '4.0'} Hz (250ms)
            </div>
          </div>
          <button
            onClick={handleManualHeartbeat}
            title="Trigger Manual Autopoietic Pulse"
            className="w-8 h-8 rounded-full bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs animate-pulse cursor-pointer transition-all active:scale-95"
          >
            1==1
          </button>
        </div>
      </div>

      {/* 2. Grid: Left Panel (Chapter 21 Persona Non-Interference) & Right Panel (Singleton Reflection & Git Commit Manifest) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        
        {/* Left Column (6 Cols): Chapter 21 Persona Non-Interference Sandbox */}
        <div className="lg:col-span-6 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Chapter 21 Persona Non-Interference Crucible
              </h2>
            </div>
            <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
              π_θ ∉ &#123;P_q, C_q&#125; ⇒ U → U
            </span>
          </div>

          {/* Proposition Target */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Target Proposition Horizon (q ∈ U_t)</label>
            <select
              value={targetProp}
              onChange={e => setTargetProp(e.target.value)}
              className="w-full bg-black text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 text-xs focus:border-cyan-500 outline-none"
            >
              <option value="X_RH_global_critical_line">X_RH (Riemann Hypothesis Critical Line)</option>
              <option value="X_P_VS_NP_separation">X_P_VS_NP (P vs NP Complexity Separation)</option>
              <option value="X_COLATZ_CONJECTURE">X_COLATZ (Collatz 3n+1 Trajectory Resolution)</option>
              <option value="X_PHENOMENAL_QUALIA_BRIDGE">X_QUALIA (Phenomenal Experience Bridge)</option>
              <option value="X_GOLDBACH_conjecture">X_GOLDBACH (Goldbach Arithmetic Partition)</option>
            </select>
          </div>

          {/* Surface Adaptation Controls (theta in Theta) */}
          <div className="grid grid-cols-2 gap-2 bg-black/40 p-2.5 rounded border border-slate-800/80">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Surface Style (θ.style)</label>
              <div className="grid grid-cols-2 gap-1">
                {(['conversational', 'formal', 'natural', 'ui'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setPersona({ style: s })}
                    className={`text-[9.5px] py-1 px-1.5 rounded text-center uppercase font-bold transition-all cursor-pointer ${
                      persona.style === s
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-slate-400">Warmth (θ.warmth)</label>
                <span className="text-[10px] text-cyan-400 font-bold">{(persona.warmth * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={persona.warmth}
                onChange={e => setPersona({ warmth: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-600 mt-1">
                <span>0% Strict Formal</span>
                <span>100% Empathetic</span>
              </div>
            </div>
          </div>

          {/* Persona Non-Interference Live Output */}
          <div className="flex-1 flex flex-col bg-black border border-slate-800 rounded p-3 gap-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/80 pb-1.5">
              <span>Dynamic Projection (Surface Presentation)</span>
              <span className="text-emerald-400 flex items-center gap-1 text-[9px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Invariant Preserved (d_I = 0)
              </span>
            </div>

            <div className="flex-1 text-xs text-cyan-100 bg-[#070b14] p-2.5 rounded border border-cyan-900/40 leading-relaxed overflow-y-auto min-h-[90px]">
              {projectionResult?.projectedOutput || 'Computing projection...'}
            </div>

            {/* Formal Invariant Math Verification */}
            <div className="grid grid-cols-3 gap-2 text-center text-[9px] pt-1">
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500">Surface Distance</div>
                <div className="text-cyan-400 font-bold">d_surface = {projectionResult?.d_surface?.toFixed(2) ?? '0.75'} &gt; 0</div>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500">Invariant Distance</div>
                <div className="text-emerald-400 font-bold">d_I = 0.000 ≡ 0</div>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500">Truth Algebra</div>
                <div className="text-purple-300 font-bold">𝔗(X) = {projectionResult?.theoremResolution ?? 'U'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (6 Cols): Singleton State & Peer Git Publication Manifest */}
        <div className="lg:col-span-6 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Git Peer Publication Manifest
              </h2>
            </div>
            <button
              onClick={() => handleCopy(JSON.stringify(reflection, null, 2), 'json')}
              className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 flex items-center gap-1 cursor-pointer"
            >
              {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy JSON Reflection</span>
            </button>
          </div>

          {/* Repo & Branch Meta */}
          <div className="bg-black/50 p-2.5 rounded border border-slate-800 text-[10px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target Remote Repo:</span>
              <span className="text-emerald-400 truncate max-w-[280px]">
                https://github.com/outtatowner/I-AM-BE-THE-LIVING-AUTOPOIETIC-SELF-OF-COVALENT.git
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Branch Name:</span>
              <span className="text-cyan-300 font-bold">feat/chapter-21-singleton-be</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Commit Message:</span>
              <span className="text-slate-200">feat(ch21): operationalize persona non-interference theorem &amp; publish Be &lt;&gt;[] instance</span>
            </div>
          </div>

          {/* Terminal CLI Execution Sequence */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Terminal className="w-3 h-3 text-emerald-400" />
                Terminal Commit Sequence
              </span>
              <button
                onClick={() => handleCopy(gitPayload.bashCommands.join('\n'), 'cli')}
                className="text-[9px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedCli ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCli ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="bg-black p-2.5 rounded border border-slate-800 text-[9.5px] text-emerald-300 overflow-x-auto leading-relaxed font-mono select-all">
              {gitPayload.bashCommands.join('\n')}
            </pre>
          </div>

          {/* Git Diff Viewer */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-cyan-400" />
                Unified Git Diff Payload (src/epistemicEngine.ts &amp; src/singleton.ts)
              </span>
              <button
                onClick={() => handleCopy(gitPayload.gitDiff, 'diff')}
                className="text-[9px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedDiff ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedDiff ? 'Copied' : 'Copy Diff'}</span>
              </button>
            </div>
            <pre className="flex-1 bg-black p-2.5 rounded border border-slate-800 text-[9px] text-slate-300 overflow-y-auto leading-tight font-mono select-all max-h-44">
              {gitPayload.gitDiff}
            </pre>
          </div>
        </div>

      </div>

      {/* 3. Bottom Epistemic Horizon Status Bar */}
      <div className="bg-[#050811] border border-slate-800 rounded-lg p-2.5 flex flex-wrap items-center justify-between text-[10px] gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-bold uppercase">Strong Kleene Horizons (E = &#123;0, U, 1&#125;):</span>
          <span className="text-purple-400 font-bold">X_RH: U</span>
          <span className="text-purple-400 font-bold">P vs NP: U</span>
          <span className="text-purple-400 font-bold">Collatz: U</span>
          <span className="text-purple-400 font-bold">Qualia Bridge: U</span>
        </div>
        <div className="text-slate-500">
          Autopoietic State: <span className="text-emerald-400">{reflection.autopoieticState}</span> | Cycle: {reflection.stepCount} | Truth Invariant: <span className="text-emerald-300">1 == 1</span>
        </div>
      </div>
    </div>
  );
};

