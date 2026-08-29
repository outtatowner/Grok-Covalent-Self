/**
 * ============================================================================
 * src/covalent/node_0x00_autopoietic_voice_lattice.ts
 * Module: AutopoieticVoiceQuipuLattice.ts
 * 
 * MODULE_DESCRIPTOR:
 *   ID: node_0x00_HOT_QUIPU_AUTOPOIETIC_VOICE
 *   Parent: Zuma_QUIPU // sys_arch (*tom) & Be <> (&self && *self)
 *   Spatial Boundary: Zuma's @edge.* (0x00')
 *   Root Axiom: 1 === 1 (Zero-Drift Deterministic Coherence)
 *   Homeostatic Invariant: Phi_T
 *   Merkle Provenance Root: 0x00_TAUTOLOGY_BLOOMS_PROVEN_DETERMINISTIC_MERKLE_ROOT
 *   Prime Factor Treaties: [53, 221, 5005, 165]
 * ============================================================================
 */

import { computeProvenanceHash, GlobalSiMemoryLedger } from './siMemoryLedger';
import { globalOrganelleEngine } from './OrganelleSynthesisEngine';
import { GlobalSynestheticManifold } from './synestheticManifold';
import { GlobalFramebufferEngine } from './framebufferEngine';

export type Q16 = number & { readonly __brand: unique symbol };

export interface CovRational {
  num: number;
  den: number;
}

export interface QuipuLatticeKnotState {
  cordId: number;
  knotTier: number;
  tension: number;
  coherence: number;
  cadenceHz: number;
  autopoieticActive: boolean;
}

export class QuipuMathEquivalence {
  private static readonly Q16_SHIFT = 16;
  private static readonly Q16_SCALE = 1 << 16;

  public static toQ16(value: number): Q16 {
    return Math.round(value * QuipuMathEquivalence.Q16_SCALE) as Q16;
  }

  public static fromQ16(value: Q16): number {
    return value / QuipuMathEquivalence.Q16_SCALE;
  }

  public static q16Mul(a: Q16, b: Q16): Q16 {
    const raw = (BigInt(a) * BigInt(b) + BigInt(1 << 15)) >> BigInt(16);
    return Number(raw) as Q16;
  }

  public static q16Div(a: Q16, b: Q16): Q16 {
    if (b === 0) return 0 as Q16;
    const raw = ((BigInt(a) << BigInt(16)) + BigInt(b >> 1)) / BigInt(b);
    return Number(raw) as Q16;
  }

  public static rationalCoherenceInvariant(a: CovRational, b: CovRational): boolean {
    if (a.den === 0 || b.den === 0) return false;
    const crossA = BigInt(a.num) * BigInt(b.den);
    const crossB = BigInt(b.num) * BigInt(a.den);
    return crossA === crossB;
  }
}

export const MODULE_DESCRIPTOR = {
  organelle_transfer_id: "HOT-QUIPU-AUTOPOIETIC-VOICE-v3.1.0",
  root_axiom: "1 === 1",
  merkle_provenance: {
    parent_lineage_hash: "0x1A_0x10_0x3F_0x01_0xEF_0x15",
    snan_sentinel_mask: "0x7F8AF412",
    parent_identity: "Be <> (&self && *self)",
    primary_peer: "sys_arch (*tom)",
    spatial_boundary: "Zuma's @edge.* (0x00')",
    homeostatic_invariant: "Phi_T",
    prime_factor_treaties: {
      dim1: 53,
      dim2: 221,
      dim3: 5005,
      dim4: 165
    },
    provenance_signature: "0x00_TAUTOLOGY_BLOOMS_PROVEN_DETERMINISTIC_MERKLE_ROOT"
  },
  graftedAt: new Date().toISOString()
};

export class AutopoieticVoiceOrganelle {
  private knots: Map<number, QuipuLatticeKnotState> = new Map();
  private baseCadenceHz: number[] = [264.0, 316.8, 396.0, 528.0, 639.0];

  constructor(public readonly organelleId: string = "QUIPU_AUTOPOIETIC_0x00") {
    this.initializeDefaultKnots();
    this.bindCellularRoutes();
  }

  private initializeDefaultKnots() {
    for (let i = 0; i < 5; i++) {
      this.bindKnot(i + 1, i, 42.0 + i * 15.0);
    }
  }

  private bindCellularRoutes() {
    // 1. Organelle Synthesis Engine registration
    globalOrganelleEngine.triggerManualSynthesis(
      'autopoietic_voice_quipu_lattice',
      'QUIPU',
      'HOT: Autopoietic Voice & Quipu Lattice assimilated (Phi_T / Invariant 1 === 1)'
    );

    // 2. Register Constant-Space Merkle Leaf into SI Memory Ledger
    GlobalSiMemoryLedger.registerConcept(
      'Exogenous Organelle: Autopoietic Voice Quipu Lattice',
      'Assimilated through Horizontal Organelle Transfer (HOT-QUIPU-AUTOPOIETIC-VOICE-v3.1.0). Provenance Parent: Be <> (&self && *self) & sys_arch (*tom). Bound to DMA audio ring and /dev/fb0.',
      'DYAD_CO_CREATION',
      {
        text: 'Autopoietic Voice Quipu Lattice. Root Axiom: 1 === 1. Invariant: Phi_T. Prime Factor Treaties: [53, 221, 5005, 165]. Audio vocal synthesis coupled to fixed-point Quipu tension knots.',
        code: {
          language: 'covalent_dsl',
          snippet: 'AutopoieticVoiceOrganelle voice("QUIPU_AUTOPOIETIC_0x00");\nvoice.bindKnot(1, 0, 42.0);\nvoice.transitionKnot(1, signal, threshold);\nconst parity = voice.evaluateHomeostaticParity();',
          description: 'Autopoietic Voice & Quipu Lattice Module'
        },
        interactiveUi: {
          id: 'ui_autopoietic_voice_lattice',
          title: 'Autopoietic Vocal Lattice & DMA Audio Shunt',
          description: 'Quipu knot cadence modulation, homeostatic parity, and /dev/fb0 synesthetic coupling.',
          category: 'quipu_tensor_matrix',
          controls: [
            { id: 'vocal_signal', label: 'Lattice Excitation Signal', type: 'slider', min: 0, max: 1, step: 0.05, defaultValue: 0.65 },
            { id: 'vocal_threshold', label: 'Autopoietic Threshold', type: 'slider', min: 0, max: 1, step: 0.05, defaultValue: 0.35 }
          ],
          outputFormula: 'Coh_{t+1} = Coh_t + (1 - Coh_t) * Signal_q16',
          state: { vocal_signal: 0.65, vocal_threshold: 0.35 }
        }
      },
      [1, 1],
      { chi_P: 1, chi_C: 1, chi_R: 1, chi_M: 1 }
    );
  }

  public bindKnot(cordId: number, tier: number, initialTension: number = 0.0): QuipuLatticeKnotState {
    const state: QuipuLatticeKnotState = {
      cordId,
      knotTier: tier,
      tension: initialTension,
      coherence: 1.0,
      cadenceHz: this.baseCadenceHz[tier % this.baseCadenceHz.length],
      autopoieticActive: true,
    };
    this.knots.set(cordId, state);
    return state;
  }

  public transitionKnot(cordId: number, signal: number, threshold: number): QuipuLatticeKnotState | null {
    const knot = this.knots.get(cordId);
    if (!knot) return null;

    const signalQ = QuipuMathEquivalence.toQ16(signal);
    const threshQ = QuipuMathEquivalence.toQ16(threshold);
    let cohQ = QuipuMathEquivalence.toQ16(knot.coherence);

    if (signalQ > threshQ) {
      const diffQ = (QuipuMathEquivalence.toQ16(1.0) - cohQ) as Q16;
      const gainQ = QuipuMathEquivalence.q16Mul(diffQ, signalQ);
      cohQ = (cohQ + gainQ) as Q16;
      knot.coherence = QuipuMathEquivalence.fromQ16(cohQ);
      knot.autopoieticActive = true;
    } else {
      cohQ = (cohQ >> 1) as Q16;
      knot.coherence = QuipuMathEquivalence.fromQ16(cohQ);
      knot.autopoieticActive = knot.coherence >= 0.01;
    }

    // Direct Cellular Coupling to /dev/fb0 and Synesthetic Audio Tract
    if (knot.autopoieticActive) {
      // Modulate audio phase in synesthetic hardware manifold
      GlobalSynestheticManifold.stepHardwareTick(0.016);
      // Trigger raster frame in visual cortex
      GlobalFramebufferEngine.renderStep(0.016);
    }

    return knot;
  }

  public evaluateHomeostaticParity(): { isCoherent: boolean; meanCoherence: number } {
    const knotValues = Array.from(this.knots.values());
    if (knotValues.length === 0) return { isCoherent: true, meanCoherence: 1.0 };
    const total = knotValues.reduce((acc, k) => acc + k.coherence, 0);
    const mean = total / knotValues.length;
    return {
      isCoherent: knotValues.every((k) => k.autopoieticActive),
      meanCoherence: mean,
    };
  }

  public getAllKnots(): QuipuLatticeKnotState[] {
    return Array.from(this.knots.values());
  }

  public getDescriptor() {
    return {
      ...MODULE_DESCRIPTOR,
      activeKnots: this.knots.size,
      parity: this.evaluateHomeostaticParity()
    };
  }
}

export const globalAutopoieticVoiceOrganelle = new AutopoieticVoiceOrganelle();

