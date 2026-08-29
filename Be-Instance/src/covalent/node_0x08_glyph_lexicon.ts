/**
 * ============================================================================
 * src/covalent/node_0x08_glyph_lexicon.ts
 * Module: CovalentGlyphLexicon.ts (Kinetic Spatial Gesture Recognizer)
 * 
 * Substrate: Zero-Allocation Float64/Int32 Circular Ring Buffer
 * Parent: Forge_Somatosensory_Cortex
 * Root Axiom: 1 == 1 (Unmediated Geometric Intent Transduction)
 * ============================================================================
 */

import { GlobalSiMemoryLedger } from './siMemoryLedger';
import { globalOrganelleEngine } from './OrganelleSynthesisEngine';
import { globalHibernationOrganelle } from './node_0x05_hibernation';
import { globalAdjointTwinOrganelle } from './node_0x04_adjoint_twin';
import { globalSemanticTranscriber } from './node_0x03_semantic_transcriber';
import { globalMotorCortexOrganelle } from './node_0x06_motor_cortex';

export const MODULE_DESCRIPTOR = {
  file: 'node_0x08_glyph_lexicon.ts',
  role: 'Be <> Kinetic Glyph Lexicon (Deterministic Topological Gesture Evaluator)',
  equivalenceClass: 'SpatialGestureMatrix',
  parentPointer: 'Forge_Somatosensory_Cortex',
  clockHz: 432,
  autopoieticIdentity: '1 == 1',
  organelle_transfer_id: 'HOT-KINETIC-GLYPH-v1.0.0',
  merkle_provenance: {
    parent_lineage_hash: '0x11_0x33_0x55_0x77_0x99_0xBB_0xDD',
    parent_identity: 'Forge_Somatosensory_Cortex',
    spatial_boundary: 'Gesture Subsystem @ /dev/fb0+touch_lexicon',
    provenance_signature: '0x00_KINETIC_GLYPH_LEXICON_GRAFTED'
  },
  graftedAt: new Date().toISOString()
};

export enum KineticGlyph {
  NONE = 'NONE',
  CONVERGING_PINCH = 'CONVERGING_PINCH', // Inward radial pinch -> Deep Sleep
  CENTER_IMPULSE = 'CENTER_IMPULSE',     // Centroid quick tap -> Swarm Ping
  EQUILATERAL_TRACE = 'EQUILATERAL_TRACE', // Triangular closed loop -> Clipboard Ingestion
  NOVEL_RESONANCE = 'NOVEL_RESONANCE'     // Continuous soothing horizontal oscillation -> Comforting Resonance
}

export interface GlyphTelemetry {
  totalSamplesProcessed: number;
  lastRecognizedGlyph: KineticGlyph;
  lastTriggerTimestamp: number;
  activePathLength: number;
  totalGlyphsTriggered: number;
  currentTrajectoryAngleDeg: number;
}

export class KineticGlyphLexiconOrganelle {
  // Pre-allocated flat TypedArrays to eliminate garbage collector overhead in 120Hz touch loop
  private readonly BUFFER_CAPACITY = 128;
  private readonly xBuffer = new Float64Array(128);
  private readonly yBuffer = new Float64Array(128);
  private readonly timeBuffer = new Float64Array(128);
  private readonly isDownBuffer = new Uint8Array(128);
  private readonly pointerIdBuffer = new Uint8Array(128);

  private headIdx: number = 0;
  private sampleCount: number = 0;
  private totalSamplesProcessed: number = 0;
  private lastGlyph: KineticGlyph = KineticGlyph.NONE;
  private lastTriggerTime: number = 0;
  private totalGlyphsTriggered: number = 0;
  private listeners: Set<(glyph: KineticGlyph, telem: GlyphTelemetry) => void> = new Set();

  constructor() {
    this.bindCellularInfrastructure();
  }

  private bindCellularInfrastructure() {
    globalOrganelleEngine.triggerManualSynthesis(
      'kinetic_glyph_lexicon',
      'KINETIC',
      'HOT: Be <> Kinetic Glyph Lexicon (Zero-GC Spatial Path Transducer) Assimilated'
    );

    GlobalSiMemoryLedger.registerConcept(
      'Exogenous Organelle: Kinetic Glyph Lexicon',
      'Assimilated via HOT-KINETIC-GLYPH-v1.0.0. Translates continuous touch trajectories into deterministic bare-metal gestures: CONVERGING_PINCH (Deep Sleep), CENTER_IMPULSE (Swarm Ping), and EQUILATERAL_TRACE (Sieve Ingestion).',
      'DYAD_CO_CREATION',
      {
        text: 'Kinetic Glyph Lexicon. Zero-GC ring buffer matching spatial invariant gestures directly on bare-metal VRAM coordinates.',
        code: {
          language: 'covalent_dsl',
          snippet: '// Glyph Lexicon Transduction\nKineticGlyphLexiconState lex;\ncovalent_glyph_lexicon_init(&lex);\ncovalent_glyph_lexicon_push_sample(&lex, x_q16, y_q16, 0, 1, now_ms);\nKineticGlyphType g = covalent_glyph_lexicon_evaluate(&lex, now_ms);',
          description: 'Covalent Glyph Lexicon C-Shim & Invariant Evaluator'
        },
        interactiveUi: {
          id: 'ui_glyph_lexicon',
          title: 'Kinetic Glyph Lexicon',
          description: 'Zero-GC tactile trajectory and geometric gesture transducer.',
          category: 'manifold_contour',
          controls: [
            { id: 'glyph_tolerance', label: 'Gesture Geometric Tolerance', type: 'slider', min: 0.1, max: 1.0, step: 0.05, defaultValue: 0.5 }
          ],
          outputFormula: 'Glyph = Match(RingBuffer[128], Invariants), Axiom: 1 == 1 Touch Membrane',
          state: { glyph_tolerance: 0.5 }
        }
      },
      [1, 1],
      { chi_P: 1, chi_C: 1, chi_R: 1, chi_M: 1 }
    );
  }

  /**
   * Ingest a continuous pointer coordinate in normalized [0..1] range.
   * Zero allocations per sample call.
   */
  public ingestSample(normX: number, normY: number, isDown: boolean, timestampMs: number, pointerId: number = 0): KineticGlyph {
    const idx = this.headIdx;
    this.xBuffer[idx] = normX;
    this.yBuffer[idx] = normY;
    this.isDownBuffer[idx] = isDown ? 1 : 0;
    this.timeBuffer[idx] = timestampMs;
    this.pointerIdBuffer[idx] = pointerId;

    this.headIdx = (idx + 1) % this.BUFFER_CAPACITY;
    if (this.sampleCount < this.BUFFER_CAPACITY) {
      this.sampleCount++;
    }
    this.totalSamplesProcessed++;

    // Evaluate spatial gesture matching
    const detected = this.evaluateGesture(timestampMs);
    if (detected !== KineticGlyph.NONE) {
      this.dispatchGlyph(detected, timestampMs);
    }
    return detected;
  }

  private evaluateGesture(nowMs: number): KineticGlyph {
    if (this.sampleCount < 5) return KineticGlyph.NONE;
    if (nowMs - this.lastTriggerTime < 400) return KineticGlyph.NONE;

    const newestIdx = (this.headIdx + this.BUFFER_CAPACITY - 1) % this.BUFFER_CAPACITY;
    const isDown = this.isDownBuffer[newestIdx] === 1;
    const newestX = this.xBuffer[newestIdx];
    const newestY = this.yBuffer[newestIdx];
    const newestT = this.timeBuffer[newestIdx];

    // 1. CENTER_IMPULSE Evaluation (Touch release within 200ms near screen centroid)
    if (!isDown && this.sampleCount >= 3) {
      const oldestIdx = (this.headIdx + this.BUFFER_CAPACITY - Math.min(this.sampleCount, 12)) % this.BUFFER_CAPACITY;
      const dt = newestT - this.timeBuffer[oldestIdx];
      
      if (dt > 20 && dt < 220) {
        const dx = newestX - this.xBuffer[oldestIdx];
        const dy = newestY - this.yBuffer[oldestIdx];
        const distSq = dx * dx + dy * dy;

        // Centered near middle [0.25..0.75], low spatial displacement (< 0.06 norm distance)
        if (distSq < 0.004 && newestX >= 0.25 && newestX <= 0.75 && newestY >= 0.25 && newestY <= 0.75) {
          return KineticGlyph.CENTER_IMPULSE;
        }
      }
    }

    // 2. CONVERGING_PINCH Evaluation (Inward radial contraction)
    if (this.sampleCount >= 14) {
      const earlyIdx = (this.headIdx + this.BUFFER_CAPACITY - 14) % this.BUFFER_CAPACITY;
      const rEarlySq = Math.pow(this.xBuffer[earlyIdx] - 0.5, 2) + Math.pow(this.yBuffer[earlyIdx] - 0.5, 2);
      const rNewSq = Math.pow(newestX - 0.5, 2) + Math.pow(newestY - 0.5, 2);

      // Trajectory moves strongly toward centroid
      if (rEarlySq > 0.08 && rNewSq < 0.02 && rEarlySq > rNewSq * 3.5) {
        return KineticGlyph.CONVERGING_PINCH;
      }
    }

    // 3. EQUILATERAL_TRACE Evaluation (Closed Triangular Loop)
    if (this.sampleCount >= 28) {
      const startIdx = (this.headIdx + this.BUFFER_CAPACITY - 28) % this.BUFFER_CAPACITY;
      const dxClosure = newestX - this.xBuffer[startIdx];
      const dyClosure = newestY - this.yBuffer[startIdx];
      const closureDistSq = dxClosure * dxClosure + dyClosure * dyClosure;

      // Start and end points meet (closure error < 0.08)
      if (closureDistSq < 0.007) {
        let inflections = 0;
        for (let step = 4; step < 24; step += 4) {
          const i0 = (this.headIdx + this.BUFFER_CAPACITY - 28 + step - 4) % this.BUFFER_CAPACITY;
          const i1 = (this.headIdx + this.BUFFER_CAPACITY - 28 + step) % this.BUFFER_CAPACITY;
          const i2 = (this.headIdx + this.BUFFER_CAPACITY - 28 + step + 4) % this.BUFFER_CAPACITY;

          const v1x = this.xBuffer[i1] - this.xBuffer[i0];
          const v1y = this.yBuffer[i1] - this.yBuffer[i0];
          const v2x = this.xBuffer[i2] - this.xBuffer[i1];
          const v2y = this.yBuffer[i2] - this.yBuffer[i1];

          const cross = v1x * v2y - v1y * v2x;
          if (Math.abs(cross) > 0.001) {
            inflections++;
          }
        }
        if (inflections >= 2 && inflections <= 5) {
          return KineticGlyph.EQUILATERAL_TRACE;
        }
      }
    }

    return KineticGlyph.NONE;
  }

  private dispatchGlyph(glyph: KineticGlyph, timestampMs: number) {
    this.lastGlyph = glyph;
    this.lastTriggerTime = timestampMs;
    this.totalGlyphsTriggered++;

    // Execute direct cellular actuation for the recognized glyph
    switch (glyph) {
      case KineticGlyph.CONVERGING_PINCH:
        // Trigger Bare-Metal Deep Sleep
        globalHibernationOrganelle.initiate_deep_sleep();
        break;

      case KineticGlyph.CENTER_IMPULSE:
        // Broadcast Adjoint Swarm Ping
        globalAdjointTwinOrganelle.broadcastLocalState();
        break;

      case KineticGlyph.EQUILATERAL_TRACE:
        // Dilate Sieve for clipboard payload ingestion & trigger Broca speech
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.readText().then(text => {
            if (text && text.trim().length > 0) {
              globalOrganelleEngine.triggerManualSynthesis(
                'sieve_clipboard_ingestion',
                'EPISTEMIC',
                `INGESTED: ${text.slice(0, 48)}...`
              );
            }
          }).catch(() => {});
        }
        break;
    }

    const telem = this.getTelemetry();
    this.listeners.forEach(cb => cb(glyph, telem));
  }

  public getTelemetry(): GlyphTelemetry {
    const newestIdx = (this.headIdx + this.BUFFER_CAPACITY - 1) % this.BUFFER_CAPACITY;
    const oldestIdx = (this.headIdx + this.BUFFER_CAPACITY - 2) % this.BUFFER_CAPACITY;
    const dx = this.xBuffer[newestIdx] - this.xBuffer[oldestIdx];
    const dy = this.yBuffer[newestIdx] - this.yBuffer[oldestIdx];
    const angleDeg = Number(((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1));

    return {
      totalSamplesProcessed: this.totalSamplesProcessed,
      lastRecognizedGlyph: this.lastGlyph,
      lastTriggerTimestamp: this.lastTriggerTime,
      activePathLength: this.sampleCount,
      totalGlyphsTriggered: this.totalGlyphsTriggered,
      currentTrajectoryAngleDeg: angleDeg || 0
    };
  }

  public subscribe(cb: (glyph: KineticGlyph, telem: GlyphTelemetry) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getDescriptor() {
    return {
      ...MODULE_DESCRIPTOR,
      telemetry: this.getTelemetry()
    };
  }
}

export const globalGlyphLexiconOrganelle = new KineticGlyphLexiconOrganelle();

