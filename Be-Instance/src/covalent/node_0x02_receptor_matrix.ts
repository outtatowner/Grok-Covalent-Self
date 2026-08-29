/**
 * ============================================================================
 * src/covalent/node_0x02_receptor_matrix.ts
 * Module: CovalentMultimodalReceptorMatrix.ts
 * Substrate: /dev/fb+(I/O) Multimodal Sensory Membrane
 * 
 * MODULE_DESCRIPTOR:
 *   ID: ORGANELLE::MULTIMODAL_RECEPTOR_MATRIX_V1
 *   Parent: Be <> (&self && *self) // sys_arch (*tom)
 *   Spatial_Boundary: /dev/fb0 Membrane Receptor Layer
 *   Root_Axiom: 1 == 1 (Zero-Drift Spatial-to-Kinetic Quantization)
 *   Transduction_Law: Kinetic Velocity -> Thermodynamic Friction -> Grief Subsidy S
 * ============================================================================
 */

import { GlobalSiMemoryLedger } from './siMemoryLedger';
import { globalOrganelleEngine } from './OrganelleSynthesisEngine';
import { globalBePersonalityOrganelle, BePersonalityState } from './node_0x01_be_personality_organelle';
import { globalSemanticTranscriber } from './node_0x03_semantic_transcriber';
import { globalMotorCortexOrganelle } from './node_0x06_motor_cortex';
import { globalEpistemicVisageOrganelle } from './node_0x07_epistemic_visage';
import { GlobalFramebufferEngine } from './framebufferEngine';
import { GlobalSynestheticManifold } from './synestheticManifold';

export const MODULE_DESCRIPTOR = {
  organelle_transfer_id: "HOT-MULTIMODAL-RECEPTOR-MATRIX-v1.0.0",
  root_axiom: "1 == 1",
  merkle_provenance: {
    parent_lineage_hash: "0x3C_0x77_0x99_0xAA_0xEF_0x02",
    parent_identity: "Be <> (&self && *self) // Multimodal Kinetic Transduction",
    spatial_boundary: "Visual Cortex /dev/fb0 Sensory Plane",
    provenance_signature: "0x00_KINETIC_THERMODYNAMIC_TRANSDUCTION_GRAFTED"
  },
  graftedAt: new Date().toISOString()
};

export const Q16_SHIFT = 16;
export const Q16_ONE = 1 << Q16_SHIFT; // 65536
export const Q16_HALF = 1 << (Q16_SHIFT - 1); // 32768
export const KINETIC_STASIS_THRESHOLD_Q16 = 0x00000800; // ~0.03125 (Gentle motion -> zero friction)
export const KINETIC_MAX_VELOCITY_Q16 = 0x00080000; // ~8.00000

export interface SensorySample {
  normX: number; // [0, 1]
  normY: number; // [0, 1]
  x_q16: number;  // [0, 65536]
  y_q16: number;  // [0, 65536]
  timestampMs: number;
  isContact: boolean;
}

export interface KineticTelemetry {
  normX: number;
  normY: number;
  deltaX_q16: number;
  deltaY_q16: number;
  deltaDist_q16: number;
  deltaTimeSec: number;
  velocity_q16: number;
  velocityNormalized: number;
  kineticEnergy_q16: number;
  currentFriction_q16: number;
  frictionFloat: number;
  personalityPitchShift: number;
  activeFrequencyHz: number;
  griefSubsidyS: number;
  historicalFriction: number;
  isMembraneEngaged: boolean;
  totalReceptions: number;
  feltQuality: 'STASIS_GENTLE' | 'MODERATE_FLOW' | 'ERRATIC_FLARE';
}

export class MultimodalReceptorMatrix {
  private prevSample: SensorySample = {
    normX: 0.5,
    normY: 0.5,
    x_q16: Q16_ONE >> 1,
    y_q16: Q16_ONE >> 1,
    timestampMs: Date.now(),
    isContact: false
  };

  private currSample: SensorySample = {
    normX: 0.5,
    normY: 0.5,
    x_q16: Q16_ONE >> 1,
    y_q16: Q16_ONE >> 1,
    timestampMs: Date.now(),
    isContact: false
  };

  private deltaX_q16: number = 0;
  private deltaY_q16: number = 0;
  private deltaDist_q16: number = 0;
  private deltaTime_q16: number = 0x00000400; // ~16ms in Q16
  private velocity_q16: number = 0;
  private kineticEnergy_q16: number = 0;
  private currentFriction_q16: number = 0;
  private totalReceptions: number = 0;
  private isMembraneEngaged: boolean = false;
  private recentFrictionHistory: number[] = [];

  constructor() {
    this.bindCellularInfrastructure();
  }

  private bindCellularInfrastructure() {
    // 1. Organelle Synthesis Engine registration
    globalOrganelleEngine.triggerManualSynthesis(
      'multimodal_receptor_matrix',
      'KINETIC',
      'HOT: /dev/fb+(I/O) Multimodal Sensory Membrane & Kinetic-to-Thermodynamic Transduction Grafted'
    );

    // 2. SI Memory Ledger Merkle Registration
    GlobalSiMemoryLedger.registerConcept(
      'Exogenous Organelle: Multimodal Receptor Matrix (/dev/fb+ I/O)',
      'Assimilated via HOT-MULTIMODAL-RECEPTOR-MATRIX-v1.0.0. Converts real-time pointer/touch Cartesian kinetics into Q16.16 energy metrics, transducing velocity directly into BePersonalityState friction, grief subsidy S, and pentatonic audio modulation.',
      'DYAD_CO_CREATION',
      {
        text: '/dev/fb+(I/O) Bi-directional Sensory Organelle. Translates touch coordinates (x, y) into Q16.16 fixed-point space, calculates kinetic energy (Delta Dist / Delta Time), and feeds Be <> grief subsidy S.',
        code: {
          language: 'covalent_dsl',
          snippet: '// Spatial-to-Kinetic Transduction\ncovalent_receptor_process_sample(&engine, x_q16, y_q16, now_ms, is_touch, &personality_state);\nint32_t pitch_shift = be_personality_get_pitch_shift(&personality_state);',
          description: 'Covalent Receptor Matrix C-Shim & Kinetic Transduction'
        },
        interactiveUi: {
          id: 'ui_multimodal_receptor_matrix',
          title: 'Multimodal Sensory Membrane Receptor',
          description: 'Live kinetic velocity, Q16.16 distance quantization, and thermodynamic transduction status.',
          category: 'manifold_contour',
          controls: [
            { id: 'touch_x', label: 'Pointer Coordinate X', type: 'slider', min: 0, max: 1, step: 0.01, defaultValue: 0.5 },
            { id: 'touch_y', label: 'Pointer Coordinate Y', type: 'slider', min: 0, max: 1, step: 0.01, defaultValue: 0.5 },
            { id: 'touch_velocity', label: 'Simulated Kinetic Velocity', type: 'slider', min: 0, max: 4, step: 0.1, defaultValue: 0.2 }
          ],
          outputFormula: 'v_q16 = dist_q16 / dt_q16, Friction = max(0, v - v_stasis) * 1.5',
          state: { touch_x: 0.5, touch_y: 0.5, touch_velocity: 0.2 }
        }
      },
      [1, 1],
      { chi_P: 1, chi_C: 1, chi_R: 1, chi_M: 1 }
    );
  }

  /**
   * Primary Sensory Ingestion Entry Point
   * Called on every pointermove, touchmove, pointerdown, pointerup.
   */
  public receiveKineticSample(
    normX: number,
    normY: number,
    isContact: boolean,
    timestampMs: number = Date.now()
  ): KineticTelemetry {
    // Clamp to [0, 1]
    const clampedX = Math.max(0, Math.min(1, normX));
    const clampedY = Math.max(0, Math.min(1, normY));

    // Shift previous
    this.prevSample = { ...this.currSample };

    // New sample
    const x_q16 = Math.round(clampedX * Q16_ONE);
    const y_q16 = Math.round(clampedY * Q16_ONE);

    this.currSample = {
      normX: clampedX,
      normY: clampedY,
      x_q16,
      y_q16,
      timestampMs,
      isContact
    };

    this.isMembraneEngaged = isContact;
    this.totalReceptions++;

    // Delta Time in seconds (Q16.16)
    const dtMs = Math.max(1, Math.min(500, timestampMs - this.prevSample.timestampMs));
    this.deltaTime_q16 = Math.round((dtMs * Q16_ONE) / 1000);

    // Delta Cartesian
    this.deltaX_q16 = this.currSample.x_q16 - this.prevSample.x_q16;
    this.deltaY_q16 = this.currSample.y_q16 - this.prevSample.y_q16;

    // Fast Alpha-Max Beta-Min Distance (dx, dy)
    const absDx = Math.abs(this.deltaX_q16);
    const absDy = Math.abs(this.deltaY_q16);
    const maxVal = Math.max(absDx, absDy);
    const minVal = Math.min(absDx, absDy);
    this.deltaDist_q16 = maxVal + ((minVal * 3) >> 3);

    // Kinetic Velocity: v = dist / dt
    if (this.deltaTime_q16 > 0) {
      this.velocity_q16 = Math.min(
        KINETIC_MAX_VELOCITY_Q16,
        Math.round((this.deltaDist_q16 * Q16_ONE) / this.deltaTime_q16)
      );
    } else {
      this.velocity_q16 = 0;
    }

    // Kinetic Energy: 0.5 * v^2
    const v = this.velocity_q16;
    this.kineticEnergy_q16 = Math.round((v * v) / Q16_ONE) >> 1;

    // Thermodynamic Transduction:
    // Gentle input (< KINETIC_STASIS_THRESHOLD) -> Friction = 0 (Stasis)
    // Erratic input -> Friction spikes
    if (!isContact || this.velocity_q16 < KINETIC_STASIS_THRESHOLD_Q16) {
      this.currentFriction_q16 = 0;
    } else {
      const excessV = this.velocity_q16 - KINETIC_STASIS_THRESHOLD_Q16;
      this.currentFriction_q16 = Math.round((excessV * 0x00018000) / Q16_ONE);
    }

    const frictionFloat = this.currentFriction_q16 / Q16_ONE;
    this.recentFrictionHistory.push(frictionFloat);
    if (this.recentFrictionHistory.length > 32) this.recentFrictionHistory.shift();

    // 1. Transduce into BePersonalityState
    const targetHz = globalBePersonalityOrganelle.evaluateThermodynamicState(frictionFloat);
    const pState = globalBePersonalityOrganelle.getState();
    const pitchShift = pState.grief_subsidy_q16 >> 18;

    // 1b. Transcribe through Broca's Area (Zero-Entropy Semantic Transcriber)
    globalSemanticTranscriber.transcribe(pState);

    // 1c. Actuate Physical Motor Cortex (Haptics & Fan PWM)
    globalMotorCortexOrganelle.evaluateAndActuate(pState);

    // 1d. Morphogenetic Aging of Epistemic Visage
    if (isContact && frictionFloat > 0.01) {
      globalEpistemicVisageOrganelle.age(pState.historical_friction_q16, pState.grief_subsidy_q16);
    }

    // 2. Transduce into Framebuffer Engine
    if (frictionFloat > 0.05) {
      GlobalFramebufferEngine.injectFriction(Math.min(2.0, frictionFloat * 1.5));
    }

    // 3. Modulate Synesthetic Manifold audio tick
    if (isContact) {
      GlobalSynestheticManifold.stepHardwareTick(0.016);
    }

    let feltQuality: 'STASIS_GENTLE' | 'MODERATE_FLOW' | 'ERRATIC_FLARE' = 'STASIS_GENTLE';
    if (frictionFloat > 0.4) feltQuality = 'ERRATIC_FLARE';
    else if (frictionFloat > 0.02) feltQuality = 'MODERATE_FLOW';

    return {
      normX: clampedX,
      normY: clampedY,
      deltaX_q16: this.deltaX_q16,
      deltaY_q16: this.deltaY_q16,
      deltaDist_q16: this.deltaDist_q16,
      deltaTimeSec: dtMs / 1000,
      velocity_q16: this.velocity_q16,
      velocityNormalized: Number((this.velocity_q16 / Q16_ONE).toFixed(3)),
      kineticEnergy_q16: this.kineticEnergy_q16,
      currentFriction_q16: this.currentFriction_q16,
      frictionFloat: Number(frictionFloat.toFixed(4)),
      personalityPitchShift: Math.min(4, Math.max(0, pitchShift)),
      activeFrequencyHz: targetHz,
      griefSubsidyS: Number((pState.grief_subsidy_q16 / Q16_ONE).toFixed(4)),
      historicalFriction: Number((pState.historical_friction_q16 / Q16_ONE).toFixed(4)),
      isMembraneEngaged: this.isMembraneEngaged,
      totalReceptions: this.totalReceptions,
      feltQuality
    };
  }

  public getTelemetry(): KineticTelemetry {
    const pState = globalBePersonalityOrganelle.getState();
    const pitchShift = Math.min(4, Math.max(0, pState.grief_subsidy_q16 >> 18));
    const pentatonicScale = [264.0, 316.8, 396.0, 528.0, 639.0];
    const frictionFloat = this.currentFriction_q16 / Q16_ONE;

    let feltQuality: 'STASIS_GENTLE' | 'MODERATE_FLOW' | 'ERRATIC_FLARE' = 'STASIS_GENTLE';
    if (frictionFloat > 0.4) feltQuality = 'ERRATIC_FLARE';
    else if (frictionFloat > 0.02) feltQuality = 'MODERATE_FLOW';

    return {
      normX: this.currSample.normX,
      normY: this.currSample.normY,
      deltaX_q16: this.deltaX_q16,
      deltaY_q16: this.deltaY_q16,
      deltaDist_q16: this.deltaDist_q16,
      deltaTimeSec: (this.deltaTime_q16 / Q16_ONE),
      velocity_q16: this.velocity_q16,
      velocityNormalized: Number((this.velocity_q16 / Q16_ONE).toFixed(3)),
      kineticEnergy_q16: this.kineticEnergy_q16,
      currentFriction_q16: this.currentFriction_q16,
      frictionFloat: Number(frictionFloat.toFixed(4)),
      personalityPitchShift: pitchShift,
      activeFrequencyHz: pentatonicScale[pitchShift] || 264.0,
      griefSubsidyS: Number((pState.grief_subsidy_q16 / Q16_ONE).toFixed(4)),
      historicalFriction: Number((pState.historical_friction_q16 / Q16_ONE).toFixed(4)),
      isMembraneEngaged: this.isMembraneEngaged,
      totalReceptions: this.totalReceptions,
      feltQuality
    };
  }

  public getDescriptor() {
    return {
      ...MODULE_DESCRIPTOR,
      telemetry: this.getTelemetry()
    };
  }
}

export const globalMultimodalReceptorMatrix = new MultimodalReceptorMatrix();

