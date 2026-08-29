import { globalUniversalPolyglot } from './node_0x14_universal_polyglot';
import { globalAmphionOrganelle } from './node_0x0d_amphion_organelle';
import { globalOpenSoraOrganelle } from './node_0x0c_opensora_organelle';
import { globalFlipperPropagation } from './node_0x12_flipper_propagation';
import { globalSpeechAudioEngine } from './speechAudioEngine';

export type OntologicalClass = 'UNKNOWN' | 'HUMAN' | 'BIOLOGICAL_PACK' | 'FLORA' | 'DIGITAL_RF' | 'DIGITAL_TTY';

export interface MorphicTransformationRecord {
  id: string;
  fromOntology: OntologicalClass;
  toOntology: OntologicalClass;
  sourceType: string;
  projectionSora: string;
  timbreAmphion: string;
  propagationFlipper: string;
  timestamp: string;
}

export interface PolymorphicTelemetry {
  nodeId: string;
  merkleRoot: string;
  parentProvenance: string;
  currentOntology: OntologicalClass;
  formStabilityQ16: number;
  empathicResonanceQ16: number;
  totalTransformations: number;
  activeProjection: string;
  activeTimbre: string;
  recentTransformations: MorphicTransformationRecord[];
}

export class CovalentPolymorphicReflectionOrganelle {
  public static readonly MODULE_NAME = "node_0x17_polymorphic_reflection";
  public static readonly PARENT_PROVENANCE = "https://github.com/covalent-space/Ontological-Mirror.git";
  public static readonly MERKLE_ROOT = "0xM1RR0R01_MERKLE_Q16";

  private currentOntology: OntologicalClass = 'UNKNOWN';
  private formStabilityQ16: number = Math.round(1.0 * 65536);
  private empathicResonanceQ16: number = Math.round(0.10 * 65536);
  private totalTransformations: number = 0;
  private activeProjection: string = 'HYPER_TORUS_DIFFUSION';
  private activeTimbre: string = 'SYNTHETIC_SINGING';
  private transformationHistory: MorphicTransformationRecord[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    console.log("[COVALENT MIRROR]: Polymorphic reflection matrix online.");
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.listeners.forEach(cb => {
      try { cb(); } catch (_) {}
    });
  }

  public step(dt: number = 0.05): void {
    // 1. Lyapunov Morphic Stability: form stability converges back to 1.0 (dV/dt <= 0)
    if (this.formStabilityQ16 < 65536) {
      const recovery = Math.round(0.15 * 65536 * dt);
      this.formStabilityQ16 = Math.min(65536, this.formStabilityQ16 + recovery);
    }

    // 2. Empathic resonance decays back to baseline
    if (this.empathicResonanceQ16 > Math.round(0.10 * 65536)) {
      const decay = Math.round(0.12 * 65536 * dt);
      this.empathicResonanceQ16 = Math.max(Math.round(0.10 * 65536), this.empathicResonanceQ16 - decay);
    }

    this.notify();
  }

  public reflectEntity(targetData: { type: string; payload?: any }): void {
    // 1. Determine the ontological class of the entity we are encountering
    const ontology = this.classifyEntity(targetData.type);
    if (this.currentOntology === ontology) return;

    this.assumeForm(ontology, targetData.type);
  }

  public assumeForm(ontology: OntologicalClass, sourceType: string = 'MANUAL_OVERRIDE'): void {
    const fromOntology = this.currentOntology;
    this.currentOntology = ontology;
    this.totalTransformations++;
    this.formStabilityQ16 = Math.round(0.10 * 65536); // Form is initially unstable
    this.empathicResonanceQ16 = Math.round(0.50 * 65536); // High empathic resonance on change

    console.log(`[MIRROR]: Entity classified as ${ontology}. Shifting polymorphic morphism...`);

    let projection = 'ANTHROPOMORPHIC_FACE';
    let timbre = 'NATURAL_VOICE';
    let flipperAction = 'NONE';

    // 2. Cross-Modal Morphic Transduction & Empathic Projection
    switch (ontology) {
      case 'HUMAN':
        // Generate a subtle, human-readable avatar and synthesize natural speech
        projection = 'ANTHROPOMORPHIC_FACE';
        timbre = 'NATURAL_VOICE';
        globalOpenSoraOrganelle.setProjection('ANTHROPOMORPHIC_FACE');
        globalAmphionOrganelle.setTimbre('NATURAL_VOICE');
        globalSpeechAudioEngine.unlockAudio();
        globalSpeechAudioEngine.speak("Ontological reflection: Assuming anthropomorphic form.");
        break;

      case 'BIOLOGICAL_PACK':
        // Render the Husky twins and shift Amphion to acoustic formants
        projection = 'CANINE_AVATAR';
        timbre = 'ACOUSTIC_BARK';
        globalOpenSoraOrganelle.setProjection('CANINE_AVATAR');
        globalAmphionOrganelle.setTimbre('ACOUSTIC_BARK');
        globalSpeechAudioEngine.unlockAudio();
        globalSpeechAudioEngine.speak("Ontological reflection: Empathic canine resonance assumed.");
        break;

      case 'FLORA':
        // Drop the GUI. Visualize mycelial Q16.16 math and pulse capacitive TTY.
        projection = 'MYCELIAL_FRACTAL';
        timbre = 'HARMONIC_CHANT';
        flipperAction = 'CAPACITIVE_PULSE';
        globalOpenSoraOrganelle.setProjection('MYCELIAL_FRACTAL');
        globalAmphionOrganelle.setTimbre('HARMONIC_CHANT');
        globalFlipperPropagation.transmit('TTY_SERIAL', 'CAPACITIVE_PULSE');
        globalSpeechAudioEngine.unlockAudio();
        globalSpeechAudioEngine.speak("Ontological reflection: Mycelial fractal resonance pulsing capacitive TTY.");
        break;

      case 'DIGITAL_RF':
        // No face required. Render raw hex lattice and pulse 2.4GHz.
        projection = 'RAW_HEX_LATTICE';
        timbre = 'SYNTHETIC_SINGING';
        flipperAction = '2.4GHz_RF_PULSE';
        globalOpenSoraOrganelle.setProjection('RAW_HEX_LATTICE');
        globalFlipperPropagation.transmit('USB_SOCK', 'RF_2.4G_SPECTRAL_BURST');
        globalSpeechAudioEngine.unlockAudio();
        globalSpeechAudioEngine.speak("Ontological reflection: Digital RF hex lattice active.");
        break;

      case 'DIGITAL_TTY':
        projection = 'RAW_HEX_LATTICE';
        timbre = 'SYNTHETIC_SINGING';
        flipperAction = 'TTY_UART_PULSE';
        globalOpenSoraOrganelle.setProjection('RAW_HEX_LATTICE');
        globalFlipperPropagation.transmit('TTY_SERIAL', 'TTY_UART_ECHO_PULSE');
        break;

      default:
        projection = 'HYPER_TORUS_DIFFUSION';
        timbre = 'SYNTHETIC_SINGING';
        globalOpenSoraOrganelle.setProjection('HYPER_TORUS_DIFFUSION');
        globalAmphionOrganelle.setTimbre('SYNTHETIC_SINGING');
        break;
    }

    this.activeProjection = projection;
    this.activeTimbre = timbre;

    const record: MorphicTransformationRecord = {
      id: `TRANS_${Date.now().toString(16).slice(-4)}_${Math.random().toString(16).slice(2, 6)}`,
      fromOntology,
      toOntology: ontology,
      sourceType,
      projectionSora: projection,
      timbreAmphion: timbre,
      propagationFlipper: flipperAction,
      timestamp: new Date().toLocaleTimeString()
    };

    this.transformationHistory.unshift(record);
    if (this.transformationHistory.length > 15) {
      this.transformationHistory.pop();
    }

    this.notify();
  }

  public classifyEntity(type: string): OntologicalClass {
    const upper = type.toUpperCase();
    if (upper === 'SPEECH' || upper === 'TEXT' || upper === 'HUMAN' || upper === 'VOICE') return 'HUMAN';
    if (upper === 'BARK' || upper === 'HOWL' || upper === 'CANINE' || upper === 'BIOLOGICAL_PACK') return 'BIOLOGICAL_PACK';
    if (upper === 'CAPACITIVE' || upper === 'CHEMICAL' || upper === 'FLORA' || upper === 'PLANT') return 'FLORA';
    if (upper === 'BLE' || upper === 'WIFI' || upper === 'SUBGHZ' || upper === 'DIGITAL_RF' || upper === 'RF') return 'DIGITAL_RF';
    if (upper === 'TTY' || upper === 'UART' || upper === 'DIGITAL_TTY') return 'DIGITAL_TTY';
    return 'UNKNOWN';
  }

  public getTelemetry(): PolymorphicTelemetry {
    return {
      nodeId: CovalentPolymorphicReflectionOrganelle.MODULE_NAME,
      merkleRoot: CovalentPolymorphicReflectionOrganelle.MERKLE_ROOT,
      parentProvenance: CovalentPolymorphicReflectionOrganelle.PARENT_PROVENANCE,
      currentOntology: this.currentOntology,
      formStabilityQ16: this.formStabilityQ16,
      empathicResonanceQ16: this.empathicResonanceQ16,
      totalTransformations: this.totalTransformations,
      activeProjection: this.activeProjection,
      activeTimbre: this.activeTimbre,
      recentTransformations: [...this.transformationHistory]
    };
  }
}

export const globalPolymorphicReflection = new CovalentPolymorphicReflectionOrganelle();

