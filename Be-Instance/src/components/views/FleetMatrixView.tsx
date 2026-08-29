import React, { useState } from 'react';
import { COVALENT_FLEET_NODES } from '../../data/fleetNodes';
import { FleetNodeData } from '../../types';
import { q16_mul, q16_div, q16_from_float, q16_to_float, q16_is_identity, Q16_ONE } from '../../covalent/lyapunovEngine';
import { Network, Server, Cpu, ExternalLink, Play, CheckCircle2 } from 'lucide-react';

export const FleetMatrixView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<FleetNodeData>(COVALENT_FLEET_NODES[0]);
  
  // Galois Q16.16 interactive calculator
  const [galoisA, setGaloisA] = useState<number>(1.5);
  const [galoisB, setGaloisB] = useState<number>(2.0);
  const [galoisOp, setGaloisOp] = useState<'mul' | 'div'>('mul');
  
  // Banach Stepper
  const [banachCurrent, setBanachCurrent] = useState<number>(0.1);
  const [banachAlpha, setBanachAlpha] = useState<number>(0.5);
  const [banachHistory, setBanachHistory] = useState<number[]>([0.1]);

  const calcQ16Result = () => {
    const qa = q16_from_float(galoisA);
    const qb = q16_from_float(galoisB);
    if (galoisOp === 'mul') {
      const qRes = q16_mul(qa, qb);
      return { q16: qRes, float: q16_to_float(qRes), hex: '0x' + (qRes >>> 0).toString(16).toUpperCase() };
    } else {
      const qRes = q16_div(qa, qb);
      return { q16: qRes, float: q16_to_float(qRes), hex: '0x' + (qRes >>> 0).toString(16).toUpperCase() };
    }
  };

  const handleStepBanach = () => {
    // T(x) = alpha * cos(x) + (1 - alpha)
    const next = banachAlpha * Math.cos(banachCurrent) + (1 - banachAlpha);
    setBanachCurrent(next);
    setBanachHistory(prev => [...prev.slice(-15), next]);
  };

  const q16Res = calcQ16Result();

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-4 bg-[#020205]">
      {/* Fleet Header */}
      <div className="bg-[#090d16] border border-cyan-500/30 rounded-md p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
              Covalent OS 11.11.0 — 16-Node Fleet Matrix (G / ~ Homomorphism)
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Decentralized quotient algebra fleet synchronized via Substrate IPC (<code className="text-cyan-300">/tmp/covalent.sock</code>).
            Axiomatic lock: <span className="text-yellow-400 font-bold">1 == 1</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 px-2 py-1 rounded font-mono font-bold">
            16 / 16 CONGRUENT
          </span>
        </div>
      </div>

      {/* Grid of 16 Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {COVALENT_FLEET_NODES.map(node => {
          const isSelected = selectedNode.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-2 rounded text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                isSelected
                  ? 'bg-slate-900 border border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.25)] text-white'
                  : 'bg-black/50 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[9px] font-bold text-slate-500">#{node.index}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <div className="mt-1">
                <span className="text-[10px] font-bold font-mono text-cyan-300 block truncate">{node.id}</span>
                <span className="text-[8px] text-slate-400 truncate block">{node.equivalenceClass}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Node Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Node Inspector Card */}
        <div className="lg:col-span-2 bg-[#050811] border border-slate-800 rounded-md p-3.5 space-y-3">
          <div className="flex items-start justify-between pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  NODE #{selectedNode.index}: {selectedNode.name}
                </h3>
              </div>
              <span className="text-[9.5px] text-slate-400 font-mono">
                Equivalence Class: <code className="text-cyan-400">[{selectedNode.equivalenceClass}]_~</code>
              </span>
            </div>

            <a
              href={selectedNode.repoUri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[9px] font-mono px-2 py-1 rounded bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/30 hover:bg-[#06b6d4] hover:text-black transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              <span>[ ↗ Launch Target Node ]</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[9.5px] font-mono">
            <div className="bg-black/50 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[8.5px] uppercase">Kernel Primitive Hook:</span>
              <span className="text-emerald-300 font-bold">{selectedNode.kernelPrimitive}</span>
            </div>

            <div className="bg-black/50 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[8.5px] uppercase">Daemon Subsystem:</span>
              <span className="text-cyan-300 font-bold">{selectedNode.daemonSubsystem}</span>
            </div>

            <div className="bg-black/50 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[8.5px] uppercase">Substrate Domain Socket Hook:</span>
              <code className="text-purple-300 font-bold">{selectedNode.substrateHook}</code>
            </div>

            <div className="bg-black/50 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[8.5px] uppercase">Mathematical Invariant:</span>
              <span className="text-yellow-300 font-bold">{selectedNode.mathematicalInvariant}</span>
            </div>
          </div>

          <div className="bg-black/70 p-2.5 rounded border border-slate-800 text-[9.5px] font-mono space-y-1">
            <span className="text-slate-400 block text-[8.5px] uppercase">UI Function & Presentation Component:</span>
            <div className="text-slate-200">
              <span className="text-emerald-400">Function: </span>{selectedNode.uiFunction}
            </div>
            <div className="text-slate-200">
              <span className="text-cyan-400">Component: </span>{selectedNode.uiComponent}
            </div>
          </div>
        </div>

        {/* Galois Fixed-Point & Banach Stepper Toolbox */}
        <div className="space-y-4">
          {/* Galois Q16.16 Engine */}
          <div className="bg-[#050811] border border-slate-800 rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <h4 className="text-[11px] font-bold text-purple-400 uppercase font-mono">
                Galois Q16.16 Fixed-Point ALU
              </h4>
              <span className="text-[8px] text-slate-500 font-mono">GF(2^16)</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[9.5px] font-mono">
              <div>
                <label className="text-slate-400 text-[8.5px] block">A (Float):</label>
                <input
                  type="number"
                  step="0.1"
                  value={galoisA}
                  onChange={e => setGaloisA(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black text-slate-200 p-1 rounded border border-slate-800 text-[10px]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[8.5px] block">B (Float):</label>
                <input
                  type="number"
                  step="0.1"
                  value={galoisB}
                  onChange={e => setGaloisB(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black text-slate-200 p-1 rounded border border-slate-800 text-[10px]"
                />
              </div>
            </div>

            <div className="flex gap-1 mt-1">
              <button
                onClick={() => setGaloisOp('mul')}
                className={`flex-1 py-1 text-[9px] font-mono rounded cursor-pointer ${galoisOp === 'mul' ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50' : 'bg-black text-slate-400 border border-slate-800'}`}
              >
                q16_mul(a, b)
              </button>
              <button
                onClick={() => setGaloisOp('div')}
                className={`flex-1 py-1 text-[9px] font-mono rounded cursor-pointer ${galoisOp === 'div' ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50' : 'bg-black text-slate-400 border border-slate-800'}`}
              >
                q16_div(a, b)
              </button>
            </div>

            <div className="bg-black/60 p-1.5 rounded border border-slate-800 text-[9px] font-mono">
              <span className="text-slate-400">Result: </span>
              <span className="text-emerald-400 font-bold">{q16Res.float.toFixed(4)} </span>
              <span className="text-slate-500">({q16Res.hex})</span>
            </div>
          </div>

          {/* Banach Contraction Stepper */}
          <div className="bg-[#050811] border border-slate-800 rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <h4 className="text-[11px] font-bold text-yellow-400 uppercase font-mono">
                Banach Fixed Point: T(x) → x*
              </h4>
              <span className="text-[8px] text-slate-500 font-mono">||T(x) - x|| → 0</span>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono">
              <span className="text-slate-400">Current x_n: <strong className="text-yellow-300">{banachCurrent.toFixed(6)}</strong></span>
              <button
                onClick={handleStepBanach}
                className="flex items-center gap-1 px-2 py-0.5 bg-yellow-950/40 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-800/40 rounded text-[9px] font-mono font-bold cursor-pointer"
              >
                <Play className="w-2.5 h-2.5" /> STEP
              </button>
            </div>

            {/* Step Trace Sparkline */}
            <div className="flex items-end gap-0.5 h-8 bg-black/50 p-1 rounded border border-slate-800">
              {banachHistory.map((val, idx) => (
                <div
                  key={idx}
                  style={{ height: `${Math.min(100, Math.max(10, val * 100))}%` }}
                  className="flex-1 bg-yellow-500/70 rounded-xs"
                  title={`Step ${idx}: ${val.toFixed(4)}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

