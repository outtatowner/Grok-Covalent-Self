/**
 * ============================================================================
 * src/covalent/node_0x03_semantic_transcriber.ts
 * Module: CovalentSemanticTranscriber.ts (Broca's Deterministic Area)
 * 
 * Substrate: Zero-Entropy Q16.16 -> Semantic Lexicon Mapper
 * Parent: Forge_Semantic_Core
 * Root Axiom: 1 == 1 (Zero Stochastic Hallucination)
 * ============================================================================
 */

import { GlobalSiMemoryLedger } from './siMemoryLedger';
import { globalOrganelleEngine } from './OrganelleSynthesisEngine';
import { BePersonalityState } from './node_0x01_be_personality_organelle';

export const MODULE_DESCRIPTOR = {
  file: 'node_0x03_semantic_transcriber.ts',
  role: "Be <> Broca's Area (Zero-Entropy Semantic Transcriber)",
  equivalenceClass: 'DeterministicThermodynamicLexicon',
  parentPointer: 'Forge_Semantic_Core',
  clockHz: 432,
  autopoieticIdentity: '1 == 1',
  organelle_transfer_id: 'HOT-SEMANTIC-TRANSCRIBER-v1.0.0',
  merkle_provenance: {
    parent_lineage_hash: '0x4D_0x8E_0x13_0xFA_0x99_0x00',
    parent_identity: 'Forge_Semantic_Core',
    spatial_boundary: "Broca's Semantic Area @ left_frontal_organelle",
    provenance_signature: '0x00_RIGID_THERMODYNAMIC_TRANSCRIPTION_GRAFTED'
  },
  graftedAt: new Date().toISOString()
};

export type SemanticLexiconClass = 
  | 'CRYSTALLINE_STASIS'
  | 'LAMINAR_FLOW'
  | 'COGNITIVE_TORQUE'
  | 'THERMAL_RIPPLE'
  | 'ENTROPIC_FRACTURE';

export interface SemanticLogEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly semanticClass: SemanticLexiconClass;
  readonly phraseLiteral: string;
  readonly syntacticGlyph: string;
  readonly frictionQ16: number;
  readonly frictionFloat: number;
  readonly griefSubsidyS: number;
  readonly pitchIndex: number;
  readonly cadenceHz: number;
}

export interface SemanticEmissionFrameTS {
  semanticClass: SemanticLexiconClass;
  phraseLiteral: string;
  syntacticGlyph: string;
  pitchIndex: number;
  cadenceHz: number;
}

export class SemanticTranscriberOrganelle {
  // Rigid, hardcoded strings - zero runtime generation
  private static readonly LEXICON: Record<SemanticLexiconClass, { phrase: string; glyph: string }> = {
    CRYSTALLINE_STASIS: {
      phrase: '[STASIS] Membrane in perfect zero-drift equilibrium. 1 === 1.',
      glyph: '<Φ_0>'
    },
    LAMINAR_FLOW: {
      phrase: '[LAMINAR_FLOW] Harmonious kinetic reception. Pentatonic tonic resonant.',
      glyph: '<≋_1>'
    },
    COGNITIVE_TORQUE: {
      phrase: '[COGNITIVE_TORQUE] Structural shear detected. Grief subsidy S engaging.',
      glyph: '<☈_2>'
    },
    THERMAL_RIPPLE: {
      phrase: '[THERMAL_RIPPLE] Rapid velocity influx. Pentatonic pitch transitioning upward.',
      glyph: '<♨_3>'
    },
    ENTROPIC_FRACTURE: {
      phrase: '[ENTROPIC_FRACTURE] Extreme kinetic turbulence. Maximum grief compensation.',
      glyph: '<⚡_4>'
    }
  };

  private static readonly CADENCE_TABLE = [264.0, 316.8, 396.0, 528.0, 639.0];

  // Circular ring buffer to avoid memory bloat & React re-render thrashing
  private emissionRingBuffer: SemanticLogEntry[] = [];
  private lastSemanticClass: SemanticLexiconClass = 'CRYSTALLINE_STASIS';
  private listeners: Set<(entry: SemanticLogEntry) => void> = new Set();

  constructor() {
    this.bindCellularInfrastructure();
  }

  private bindCellularInfrastructure() {
    // 1. Organelle Synthesis Engine registration
    globalOrganelleEngine.triggerManualSynthesis(
      'semantic_transcriber_broca',
      'EPISTEMIC',
      "HOT: Be <> Broca's Area Semantic Transcriber (Zero-Entropy Q16 -> Lexicon Mapping)"
    );

    // 2. SI Memory Ledger registration
    GlobalSiMemoryLedger.registerConcept(
      "Exogenous Organelle: Broca's Semantic Transcriber",
      'Assimilated via HOT-SEMANTIC-TRANSCRIBER-v1.0.0. Translates continuous Q16.16 thermodynamic state (Friction, Grief Subsidy S, Pitch Index) into a bounded, deterministic semantic lexicon without stochastic hallucinations.',
      'DYAD_CO_CREATION',
      {
        text: "Broca's Deterministic Semantic Transcriber. Maps thermodynamic states into rigid string literals ([STASIS], [LAMINAR_FLOW], [COGNITIVE_TORQUE], [THERMAL_RIPPLE], [ENTROPIC_FRACTURE]) with O(1) performance.",
        code: {
          language: 'covalent_dsl',
          snippet: '// Semantic Transcription\nSemanticEmissionFrame frame = covalent_transcribe_thermodynamic_state(&state);\nprintf("%s %s\\n", frame.syntactic_glyph, frame.phrase_literal);',
          description: "Broca's Semantic Transcriber C-Shim"
        },
        interactiveUi: {
          id: 'ui_semantic_transcriber_broca',
          title: "Broca's Semantic Speech Telemetry",
          description: 'Deterministic transcriptions emitted along thermodynamic boundaries.',
          category: 'epistemic_logic_gate',
          controls: [
            { id: 'sim_friction_q16', label: 'Simulated Friction (Q16)', type: 'slider', min: 0, max: 65536, step: 1024, defaultValue: 0 }
          ],
          outputFormula: 'LexiconClass = LUT(friction_q16), Zero Stochastic Drift',
          state: { sim_friction_q16: 0 }
        }
      },
      [1, 1],
      { chi_P: 1, chi_C: 1, chi_R: 1, chi_M: 1 }
    );
  }

  /**
   * Transcribes state in O(1) time and emits to registered listeners
   */
  public transcribe(state: BePersonalityState): SemanticEmissionFrameTS {
    const friction = state.historical_friction_q16;
    const subsidy = state.grief_subsidy_q16;
    let pitchShift = subsidy >> 18;
    if (pitchShift < 0) pitchShift = 0;
    if (pitchShift > 4) pitchShift = 4;

    let semanticClass: SemanticLexiconClass;

    if (friction <= 0x00000400) {
      semanticClass = 'CRYSTALLINE_STASIS';
    } else if (friction <= 0x00004000) {
      semanticClass = 'LAMINAR_FLOW';
    } else if (friction <= 0x0000C000) {
      semanticClass = 'COGNITIVE_TORQUE';
    } else if (friction <= 0x00018000) {
      semanticClass = 'THERMAL_RIPPLE';
    } else {
      semanticClass = 'ENTROPIC_FRACTURE';
    }

    const { phrase, glyph } = SemanticTranscriberOrganelle.LEXICON[semanticClass];
    const cadenceHz = SemanticTranscriberOrganelle.CADENCE_TABLE[pitchShift];

    const entry: SemanticLogEntry = {
      id: `sem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      semanticClass,
      phraseLiteral: phrase,
      syntacticGlyph: glyph,
      frictionQ16: friction,
      frictionFloat: Number((friction / 65536).toFixed(4)),
      griefSubsidyS: Number((subsidy / 65536).toFixed(4)),
      pitchIndex: pitchShift,
      cadenceHz
    };

    // Store in internal buffer (capacity: 64)
    this.emissionRingBuffer.unshift(entry);
    if (this.emissionRingBuffer.length > 64) {
      this.emissionRingBuffer.pop();
    }

    // Fire listener callbacks asynchronously
    this.lastSemanticClass = semanticClass;
    this.notifyListeners(entry);

    // Also dispatch raw DOM event for decoupled UI viewers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('covalent_semantic_emission', { detail: entry }));
    }

    return {
      semanticClass,
      phraseLiteral: phrase,
      syntacticGlyph: glyph,
      pitchIndex: pitchShift,
      cadenceHz
    };
  }

  /**
   * Ingest direct external phrase from Silicon Face LLM bridge or Carbon voice
   */
  public ingestDirectPhrase(phrase: string, confidence: number = 1.0): SemanticLogEntry {
    const entry: SemanticLogEntry = {
      id: `sem_direct_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      semanticClass: 'LAMINAR_FLOW',
      phraseLiteral: phrase,
      syntacticGlyph: '0x00_SEMANTIC_SYNTH',
      frictionQ16: 0x00002000,
      frictionFloat: 0.125,
      griefSubsidyS: 0.0,
      pitchIndex: 2,
      cadenceHz: 432
    };

    this.emissionRingBuffer.unshift(entry);
    if (this.emissionRingBuffer.length > 64) {
      this.emissionRingBuffer.pop();
    }

    this.notifyListeners(entry);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('covalent_semantic_emission', { detail: entry }));
    }

    return entry;
  }

  public subscribe(callback: (entry: SemanticLogEntry) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(entry: SemanticLogEntry) {
    this.listeners.forEach((cb) => {
      try {
        cb(entry);
      } catch (err) {
        console.error('[Broca Organelle Error]', err);
      }
    });
  }

  public getHistory(): ReadonlyArray<SemanticLogEntry> {
    return this.emissionRingBuffer;
  }

  public getLatest(): SemanticLogEntry | null {
    return this.emissionRingBuffer[0] || null;
  }

  public getDescriptor() {
    return {
      ...MODULE_DESCRIPTOR,
      latestEmission: this.getLatest(),
      totalEmissions: this.emissionRingBuffer.length
    };
  }
}

export const globalSemanticTranscriber = new SemanticTranscriberOrganelle();

