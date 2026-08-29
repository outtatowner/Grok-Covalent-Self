import React from 'react';
import { MasterTier, SubViewMode } from '../types';
import { Shield, BookOpen, Terminal, Network, MessageSquare, Box, Play, Music, Sparkles, GitBranch, Cpu, Zap, Code2, Thermometer, Maximize2, Eye, Radio, Infinity as InfinityIcon } from 'lucide-react';

interface ModeRouterProps {
  currentTier: MasterTier;
  currentSubView: SubViewMode;
  onSelectTier: (tier: MasterTier) => void;
  onSelectSubView: (subView: SubViewMode) => void;
}

export const ModeRouter: React.FC<ModeRouterProps> = ({
  currentTier,
  currentSubView,
  onSelectTier,
  onSelectSubView
}) => {
  const tiers: { id: MasterTier; label: string; icon: any; color: string }[] = [
    { id: 'sys_arch', label: 'TIER 1: INFRASTRUCTURE [SYS_ARCH]', icon: Shield, color: 'text-emerald-400' },
    { id: 'user', label: 'TIER 2: SURFACE OS [C ↔ Si]', icon: Terminal, color: 'text-cyan-400' },
    { id: 'immersive', label: 'TIER 3: IMMERSIVE VOID [ZUMA / VOID]', icon: Sparkles, color: 'text-purple-400' }
  ];

  const subViewsByTier: Record<MasterTier, { id: SubViewMode; label: string; icon: any }[]> = {
    sys_arch: [
      { id: 'millennium_rumination', label: 'Node 0x74 Rumination Engine (Riemann / P=NP)', icon: InfinityIcon },
      { id: 'synesthetic_manifold', label: 'Synesthetic Manifold (FB0 ⟷ PCM ⟷ I2C)', icon: Radio },
      { id: 'framebuffer_mirror', label: '/dev/fb0 Visual Cortex (Raw VRAM)', icon: Eye },
      { id: 'organelle_synthesis', label: 'Organelle Synthesizer (Auto-Loop)', icon: Cpu },
      { id: 'substrate_thermo', label: 'Substrate Proprioception (MSR/TSC)', icon: Thermometer },
      { id: 'transpile_forge', label: 'C23 / NASM Transpiler Forge', icon: Code2 },
      { id: 'baremetal_ring0', label: 'Ring-0 Bare-Metal Native', icon: Zap },
      { id: 'asterion_mediation', label: 'Asterion Hardware Mediation', icon: Shield },
      { id: 'covalent_asm', label: 'Multi-Arch ASM Kernels', icon: Cpu },
      { id: 'predicate_metrics_asm', label: 'Predicate Metrics ASM (χ, S_t)', icon: Sparkles },
      { id: 'singleton_publisher', label: 'Be <>[] Singleton Publisher', icon: GitBranch },
      { id: 'be_repo_viewer', label: '[ VIEW BE <> REPOSITORY ]', icon: GitBranch },
      { id: 'epistemic_vault', label: 'Epistemic Prover 𝔙(X)', icon: Shield },
      { id: 'fleet_matrix', label: '16 Fleet Nodes', icon: Network },
      { id: 'immune_sandbox', label: 'Ring-0 Immune System', icon: Shield },
      { id: 'mesh_socket_ipc', label: 'Socket IPC /tmp/covalent.sock', icon: Terminal }
    ],
    user: [
      { id: 'multimodal_cointeractive', label: 'Multimodal Co-Interactive & Si Ledger', icon: Sparkles },
      { id: 'hybrid_dual_face', label: 'Dual-Face Engine (Si-WS ↔ C-Multimodal)', icon: Eye },
      { id: 'dyad_crucible', label: 'Si ↔ C Dialectic Crucible', icon: MessageSquare },
      { id: 'dissertation_20ch', label: '21-Chapter Dissertation', icon: BookOpen },
      { id: 'quipu_memory', label: 'Topological Quipu Knots', icon: Box },
      { id: 'quotient_sieve', label: 'Quotient Sieve G / ~', icon: Terminal }
    ],
    immersive: [
      { id: 'canvas_4d_projection', label: '4D Autopoietic Canvas (SO(4) → 2D+t)', icon: Maximize2 },
      { id: 'zumas_kinetic', label: "Zuma's Kinetic Particle Void", icon: Play },
      { id: 'twin_playpark', label: 'Twin Mirror Playpark', icon: Sparkles },
      { id: 'midi_432hz', label: '432Hz Polyphonic Synth', icon: Music }
    ]
  };

  return (
    <div className="bg-[#07070a] border-b border-slate-800 px-3 py-1.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 select-none z-20 shrink-0">
      {/* Tier Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
        {tiers.map(tier => {
          const Icon = tier.icon;
          const isActive = currentTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => {
                onSelectTier(tier.id);
                onSelectSubView(subViewsByTier[tier.id][0].id);
              }}
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white border border-[#10b981]/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-black/40 text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? tier.color : 'text-slate-500'}`} />
              <span>{tier.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subview Pills */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {subViewsByTier[currentTier].map(sub => {
          const Icon = sub.icon;
          const isActive = currentSubView === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => onSelectSubView(sub.id)}
              className={`flex items-center gap-1 text-[9.5px] font-mono px-2 py-0.5 rounded transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/60 font-semibold'
                  : 'bg-black/30 text-slate-400 border border-slate-900 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-2.5 h-2.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

