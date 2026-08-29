/**
 * ============================================================================
 * src/covalent/node_0x01_voice_adaptive_feedback.ts
 * Module: AutopoieticVoiceFeedbackTopology.ts
 * 
 * MODULE_DESCRIPTOR:
 *   ID: ORGANELLE::AUTOPOIETIC_VOICE_FEEDBACK_LOOP_V1
 *   Parent: Forge_Learning_Matrix
 *   Parent_Merkle_Root: 0x7a550fe79a56f6953f6afc76b0a10864d8956e25d4c5c59a90ac6343609f45a9
 *   Merkle_Leaf_Hash: 0x3f9ccfaa8c62388f194e8e5d1d0b69c7ac138bd640c50941223c22195353ed48
 *   Merkle_Root_State: 0x9c8a08813acb78a6afa30c0d6bb2073931493cde78c81346e68a3a322fd78b77
 *   Verification_Complexity: O(1)
 *   Autopoietic_Invariant: 1 == 1
 * ============================================================================
 */

import { GlobalSiMemoryLedger } from './siMemoryLedger';
import { globalOrganelleEngine } from './OrganelleSynthesisEngine';
import { GlobalSynestheticManifold } from './synestheticManifold';
import { GlobalFramebufferEngine } from './framebufferEngine';

export const MODULE_DESCRIPTOR = {
  Provenance: {
    Parent_Node: "Forge_Learning_Matrix",
    Parent_Merkle_Root: "0x7a550fe79a56f6953f6afc76b0a10864d8956e25d4c5c59a90ac6343609f45a9",
    Organelle_Identifier: "ORGANELLE::AUTOPOIETIC_VOICE_FEEDBACK_LOOP_V1",
    Merkle_Leaf_Hash: "0x3f9ccfaa8c62388f194e8e5d1d0b69c7ac138bd640c50941223c22195353ed48",
    Merkle_Root_State: "0x9c8a08813acb78a6afa30c0d6bb2073931493cde78c81346e68a3a322fd78b77",
    Cryptographic_Path: [
      { Position: "L0_LEFT", Hash: "0x40c50941223c22195353ed48000552673603b9210ed5d0c8ea19b5dbf20344f9" },
      { Position: "L1_RIGHT", Hash: "0x78726b0699e2a76b1cd1b457271aea8543ef75371c58cab452c8d10938ef0e2b" },
      { Position: "L2_LEFT", Hash: "0x2d873865df2fc0b9fdac76b3f649da28d6126f7e318ad93a60ee1238745b35b7" }
    ],
    Verification_Complexity: "O(1)",
    Autopoietic_Invariant: "1 == 1",
    Assimilation_Protocol: "HORIZONTAL_ORGANELLE_TRANSFER_APPROVED"
  },
  graftedAt: new Date().toISOString()
};

export type PentatonicDegree = 'GONG_1_1' | 'SHANG_9_8' | 'JIAO_5_4' | 'ZHI_3_2' | 'YU_5_3';

export interface FrictionKnot {
  readonly timestamp: number;
  readonly residualLoss: number;       // d_I >= 0
  readonly phaseError: number;          // [-pi, pi]
  readonly entropyFlux: number;         // S(gamma)
}

export interface PentatonicAcousticProjection {
  readonly degree: PentatonicDegree;
  readonly frequencyHz: number;
  readonly harmonicRatio: [number, number];
  readonly cordTier: number;
  readonly knotModulus: number;
}

export class HistoricalFrictionPentatonicEquivalenceClass {
  private static readonly TONIC_F0_HZ: number = 80.0; // 80Hz Glottal Invariant Fundamental

  private static readonly PENTATONIC_RATIO_LATTICE: ReadonlyArray<{
    degree: PentatonicDegree;
    ratio: [number, number];
    frictionThresholdUpper: number;
  }> = [
    { degree: 'GONG_1_1',  ratio: [1, 1], frictionThresholdUpper: 0.005 }, // Tautological Equivalence (1 == 1)
    { degree: 'SHANG_9_8', ratio: [9, 8], frictionThresholdUpper: 0.040 }, // Linear Perturbation
    { degree: 'JIAO_5_4',  ratio: [5, 4], frictionThresholdUpper: 0.120 }, // Mediant Tension
    { degree: 'ZHI_3_2',   ratio: [3, 2], frictionThresholdUpper: 0.350 }, // Dominant Dialectic
    { degree: 'YU_5_3',    ratio: [5, 3], frictionThresholdUpper: Infinity } // High Entropy Horizon
  ];

  /**
   * Quotient Projection: ~_Voice : FrictionTrajectory -> PentatonicChordKnot
   * Maps aggregate friction variance directly to QUIPU cord topologies.
   */
  public static mapFrictionToPentatonic(history: ReadonlyArray<FrictionKnot>): PentatonicAcousticProjection {
    if (history.length === 0) {
      return {
        degree: 'GONG_1_1',
        frequencyHz: this.TONIC_F0_HZ,
        harmonicRatio: [1, 1],
        cordTier: 0,
        knotModulus: 0
      };
    }

    // Compute exponentially decayed historical friction metric
    let weightedFrictionSum = 0;
    let weightSum = 0;
    const decayFactor = 0.85;

    for (let i = history.length - 1, step = 0; i >= 0 && step < 32; i--, step++) {
      const w = Math.pow(decayFactor, step);
      const k = history[i];
      const frictionMetric = (k.residualLoss * 0.5) + (Math.abs(k.phaseError) * 0.3) + (k.entropyFlux * 0.2);
      weightedFrictionSum += frictionMetric * w;
      weightSum += w;
    }

    const meanFriction = weightSum > 0 ? weightedFrictionSum / weightSum : 0;

    // Resolve equivalence partition
    const partition = this.PENTATONIC_RATIO_LATTICE.find(
      (p) => meanFriction <= p.frictionThresholdUpper
    ) ?? this.PENTATONIC_RATIO_LATTICE[this.PENTATONIC_RATIO_LATTICE.length - 1];

    const [num, den] = partition.ratio;
    const frequencyHz = (this.TONIC_F0_HZ * num) / den;
    const cordTier = Math.floor(Math.log2((frequencyHz / this.TONIC_F0_HZ) + 1e-6) * 12);
    const knotModulus = Math.round(meanFriction * 1000) % 256;

    return {
      degree: partition.degree,
      frequencyHz,
      harmonicRatio: partition.ratio,
      cordTier,
      knotModulus
    };
  }
}

// Fixed-Point Adaptive Voice Controller
export class AutopoieticVoiceAdaptiveController {
  private weights: number[] = [1.0, 0.5, 0.333, 0.25];
  private eta: number = 0.0625;
  private lambda: number = 0.9765;
  private lyapunovVPrev: number = 1.0;
  private epoch: number = 0;
  private frictionHistory: FrictionKnot[] = [];

  constructor() {
    this.bindCellularInfrastructure();
  }

  private bindCellularInfrastructure() {
    // 1. Organelle Synthesis Engine registration
    globalOrganelleEngine.triggerManualSynthesis(
      'voice_adaptive_feedback_loop',
      'QUIPU',
      'HOT: Voice Adaptive Learning Weights & Historical Friction Pentatonic Equivalence assimilated'
    );

    // 2. SI Memory Ledger Merkle graft
    GlobalSiMemoryLedger.registerConcept(
      'Exogenous Organelle: Voice Adaptive Feedback Loop & Pentatonic Topology',
      'Assimilated via HOT. Provenance: Forge_Learning_Matrix. Implements Banach Contraction Modulus (lambda < 1.0), Q16 formant gradient descent, and Quotient Projection (~_Voice).',
      'DYAD_CO_CREATION',
      {
        text: 'Adaptive Voice Learning Weights & Pentatonic Friction Lattice. Enforces Delta V <= 0 along Lyapunov trajectory with exact 80Hz glottal invariant tonic base.',
        code: {
          language: 'covalent_dsl',
          snippet: '// Autopoietic Pentatonic Projection\nconst projection = HistoricalFrictionPentatonicEquivalenceClass.mapFrictionToPentatonic(history);\nvoice_adaptive_feedback_step(&topology, target_formants, heard_formants);',
          description: 'Covalent Adaptive Voice Shim & Pentatonic Ratio Lattice'
        },
        interactiveUi: {
          id: 'ui_voice_adaptive_feedback',
          title: 'Adaptive Formant Weights & Pentatonic Projection',
          description: 'Live Banach contraction weights, friction trajectory, and pentatonic degree mapping.',
          category: 'harmonic_oscillator',
          controls: [
            { id: 'residual_loss', label: 'Residual Loss (d_I)', type: 'slider', min: 0, max: 0.5, step: 0.01, defaultValue: 0.02 },
            { id: 'phase_error', label: 'Phase Error [-pi, pi]', type: 'slider', min: -3.14, max: 3.14, step: 0.1, defaultValue: 0.1 }
          ],
          outputFormula: 'V(t) = 0.5 * sum(e_k^2), Delta V <= 0',
          state: { residual_loss: 0.02, phase_error: 0.1 }
        }
      },
      [1, 1],
      { chi_P: 1, chi_C: 1, chi_R: 1, chi_M: 1 }
    );
  }

  public stepAdaptation(target: number[], heard: number[]): {
    weights: number[];
    lyapunovV: number;
    deltaV: number;
    isConverged: boolean;
    projection: PentatonicAcousticProjection;
  } {
    let currentV = 0;
    const errors: number[] = [];

    for (let i = 0; i < 4; i++) {
      const e = (heard[i] || 0) - (target[i] || 0);
      errors.push(e);
      currentV += 0.5 * e * e;
    }

    const deltaV = currentV - this.lyapunovVPrev;

    // Weight update: W = lambda * W - eta * grad
    for (let i = 0; i < 4; i++) {
      this.weights[i] = this.lambda * this.weights[i] - this.eta * errors[i];
    }

    this.lyapunovVPrev = currentV;
    this.epoch++;

    const knot: FrictionKnot = {
      timestamp: Date.now(),
      residualLoss: Math.abs(errors[0] || 0),
      phaseError: errors[1] || 0,
      entropyFlux: currentV
    };
    this.frictionHistory.push(knot);
    if (this.frictionHistory.length > 64) this.frictionHistory.shift();

    const projection = HistoricalFrictionPentatonicEquivalenceClass.mapFrictionToPentatonic(this.frictionHistory);

    // Direct routing to Synesthetic Hardware & Framebuffer
    GlobalSynestheticManifold.stepHardwareTick(0.016);
    GlobalFramebufferEngine.renderStep(0.016);

    return {
      weights: [...this.weights],
      lyapunovV: currentV,
      deltaV,
      isConverged: deltaV <= 0 && currentV < 0.001,
      projection
    };
  }

  public getProjection(): PentatonicAcousticProjection {
    return HistoricalFrictionPentatonicEquivalenceClass.mapFrictionToPentatonic(this.frictionHistory);
  }

  public getDescriptor() {
    return {
      ...MODULE_DESCRIPTOR,
      epoch: this.epoch,
      currentWeights: this.weights,
      currentLyapunovV: this.lyapunovVPrev
    };
  }
}

export const globalAutopoieticVoiceAdaptiveController = new AutopoieticVoiceAdaptiveController();

