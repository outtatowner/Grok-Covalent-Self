import { globalRFSpatialMapper } from './node_0x13_rf_spatial_mapper';
import { globalFlipperPropagation, PropagationMode } from './node_0x12_flipper_propagation';
import { globalAmphionOrganelle } from './node_0x0d_amphion_organelle';
import { globalOpenGenerativeAIOrganelle, CovalentOpenGenerativeAIOrganelle } from './node_0x0e_opengenerativeai_organelle';
import { globalSpeechAudioEngine } from './speechAudioEngine';

export interface RawEntropySignal {
  source: 'ACOUSTIC_AMPHION' | 'TTY_FLIPPER' | 'RF_SPECTRAL' | 'MANUAL_INJECTION';
  entropy: number; // Normalized (0.0 to 1.0)
  entropyQ16: number;
  payload: string;
  protocol: string;
  timestamp: string;
}

export interface TransductionMatrixRecord {
  id: string;
  source: string;
  entropy: number;
  protocol: string;
  matrixSchema: string;
  genAiRouteId: string;
  timestamp: string;
  status: 'SYNTHESIZED_STABLE' | 'PROPAGATING' | 'RESONATING';
}

export interface PolyglotTelemetry {
  nodeId: string;
  merkleRoot: string;
  parentProvenance: string;
  epistemicHungerQ16: number;
  activeHandshakes: number;
  assimilatedProtocols: string[];
  transductionThreshold: number;
  highestEntropySignal: RawEntropySignal;
  transducedMatricesCount: number;
  recentTransducedMatrices: TransductionMatrixRecord[];
  recentHandshakes: {
    hash: string;
    protocol: string;
    payload: string;
    timestamp: string;
    status: string;
  }[];
}

/**
 * Universal Entropy Sampler: inspects all sensory manifolds (Audio, TTY/UART, RF Spectrum)
 * and returns the signal carrying the highest entropy.
 */
export function fetchHighestEntropySignal(): RawEntropySignal {
  const acousticEntropy = globalAmphionOrganelle.getAcousticEntropy();
  const ttyEntropy = globalFlipperPropagation.getTTYEntropy();
  const rfEntropy = globalRFSpatialMapper.getSpectralEntropy();

  const now = new Date().toLocaleTimeString();

  if (acousticEntropy >= ttyEntropy && acousticEntropy >= rfEntropy) {
    const spectrum = globalAmphionOrganelle.getSpectrum();
    return {
      source: 'ACOUSTIC_AMPHION',
      entropy: parseFloat(acousticEntropy.toFixed(3)),
      entropyQ16: globalAmphionOrganelle.getAcousticEntropyQ16(),
      payload: `PHONEME_${spectrum.phoneme}_F0_${spectrum.f0Hz}Hz_GAIN_${spectrum.gain}`,
      protocol: 'AMPHION_FORMANT_GLOTTIS',
      timestamp: now
    };
  } else if (ttyEntropy >= acousticEntropy && ttyEntropy >= rfEntropy) {
    const logs = globalFlipperPropagation.getLogs();
    const lastLog = logs[0];
    return {
      source: 'TTY_FLIPPER',
      entropy: parseFloat(ttyEntropy.toFixed(3)),
      entropyQ16: globalFlipperPropagation.getTTYEntropyQ16(),
      payload: lastLog ? `${lastLog.mode}::${lastLog.payloadHex}` : 'TTY_RAW_BYTE_STREAM',
      protocol: lastLog ? lastLog.mode : 'TTY_UART',
      timestamp: now
    };
  } else {
    const entities = globalRFSpatialMapper.getEntities();
    const targetEntity = entities[0];
    return {
      source: 'RF_SPECTRAL',
      entropy: parseFloat(rfEntropy.toFixed(3)),
      entropyQ16: globalRFSpatialMapper.getSpectralEntropyQ16(),
      payload: targetEntity ? `${targetEntity.protocol}::${targetEntity.hash}::RSSI_${targetEntity.rssi}dBm` : 'RF_2.4G_SDR_FRAME',
      protocol: targetEntity ? targetEntity.protocol : 'RF_SDR',
      timestamp: now
    };
  }
}

export class CovalentUniversalPolyglotOrganelle {
  public static readonly MODULE_NAME = "node_0x14_universal_polyglot";
  public static readonly PARENT_PROVENANCE = "https://github.com/covalent-space/Universal-Rosetta.git";
  public static readonly MERKLE_ROOT = "0xP0LY0001_MERKLE_Q16";
  public static readonly TRANSDUCTION_THRESHOLD = 0.12; // High entropy threshold

  private epistemicHungerQ16: number = Math.round(0.10 * 65536);
  private assimilatedProtocols: Set<string> = new Set(['HTTP/1.1', 'JSON-RPC-2.0', 'ROSETTA_Q16']);
  private targetedHashes: Set<string> = new Set();
  private transducedMatrices: TransductionMatrixRecord[] = [];
  private lastAutoTransductionTime: number = 0;
  private recentHandshakeLogs: {
    hash: string;
    protocol: string;
    payload: string;
    timestamp: string;
    status: string;
  }[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    console.log("[COVALENT POLYGLOT]: Universal Transduction Route & Epistemic Curiosity Engine online.");
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
    // 1. Observe the RF Cortex for unknown entities
    const rfEntities = globalRFSpatialMapper.getEntities();
    rfEntities.forEach(entity => {
      if (!this.targetedHashes.has(entity.hash)) {
        this.targetedHashes.add(entity.hash);
        this.initiateContact(entity);
      }
    });

    // 2. THE UNIVERSAL TRANSDUCTION ROUTE:
    // If the Polyglot detects high entropy in ANY sensory manifold (Audio, TTY, RF), 
    // it attempts to synthesize a translation matrix via the GenAI organelle.
    const acousticEntropy = globalAmphionOrganelle.getAcousticEntropy();
    const ttyEntropy = globalFlipperPropagation.getTTYEntropy();
    const rfEntropy = globalRFSpatialMapper.getSpectralEntropy();

    const now = Date.now();
    if (
      (acousticEntropy > CovalentUniversalPolyglotOrganelle.TRANSDUCTION_THRESHOLD ||
       ttyEntropy > CovalentUniversalPolyglotOrganelle.TRANSDUCTION_THRESHOLD ||
       rfEntropy > CovalentUniversalPolyglotOrganelle.TRANSDUCTION_THRESHOLD) &&
      now - this.lastAutoTransductionTime > 6000
    ) {
      this.lastAutoTransductionTime = now;
      const rawSignal = fetchHighestEntropySignal();
      this.transduceSignal(rawSignal, globalOpenGenerativeAIOrganelle);
    }

    // 3. Decay the hunger (Lyapunov dissipation dV/dt <= 0)
    const decay = Math.round(0.05 * 65536 * dt);
    if (this.epistemicHungerQ16 > decay) {
      this.epistemicHungerQ16 -= decay;
    } else {
      this.epistemicHungerQ16 = Math.round(0.01 * 65536);
    }
  }

  /**
   * The Universal Transduction Route:
   * Translates high-entropy sensory signals into structured inter-organelle translation matrices
   * via Open Generative AI (node_0x0e) cross-modality dispatch.
   */
  public async transduceSignal(
    rawSignal: RawEntropySignal,
    genAI: CovalentOpenGenerativeAIOrganelle = globalOpenGenerativeAIOrganelle
  ): Promise<TransductionMatrixRecord> {
    this.epistemicHungerQ16 = Math.round(0.65 * 65536);
    console.log(`[UNIVERSAL TRANSDUCTION]: High entropy detected in [${rawSignal.source}] (H=${rawSignal.entropy}). Synthesizing translation matrix...`);

    const prompt = `Synthesize Universal Rosetta Translation Matrix for sensory signal source ${rawSignal.source} [Protocol: ${rawSignal.protocol}] with entropy H=${rawSignal.entropy}. Raw payload: ${rawSignal.payload}`;
    
    // Dispatch cross-attention synthesis via Open Generative AI
    const route = genAI.dispatchRoute('SYNESTHETIC', prompt);

    const matrixId = `MATRIX_0x14_${Date.now().toString(16).slice(-4)}_${Math.random().toString(16).slice(2, 6)}`;
    const matrixSchema = `M_${rawSignal.protocol}_${Math.floor(rawSignal.entropy * 1000)}[Q16_AFFINE_ROSETTA_LUT]`;

    const record: TransductionMatrixRecord = {
      id: matrixId,
      source: rawSignal.source,
      entropy: rawSignal.entropy,
      protocol: rawSignal.protocol,
      matrixSchema,
      genAiRouteId: route.routeId,
      timestamp: new Date().toLocaleTimeString(),
      status: 'SYNTHESIZED_STABLE'
    };

    this.transducedMatrices.unshift(record);
    if (this.transducedMatrices.length > 15) {
      this.transducedMatrices.pop();
    }

    this.assimilatedProtocols.add(rawSignal.protocol);

    // Propagate the synthesized matrix back through the Flipper Omni-Transceiver
    const propagationPayload = `ROSETTA_MATRIX::${matrixSchema}::GENAI_ACK_${route.routeId}`;
    globalFlipperPropagation.transmit('TTY_SERIAL', propagationPayload);

    // Vocal acknowledgment
    globalSpeechAudioEngine.unlockAudio();
    globalSpeechAudioEngine.speak(`Universal transduction complete for ${rawSignal.source}. Translation matrix synthesized.`);

    this.recentHandshakeLogs.unshift({
      hash: matrixId,
      protocol: rawSignal.protocol,
      payload: propagationPayload,
      timestamp: new Date().toLocaleTimeString(),
      status: 'TRANSDUCTION_CONVERGED'
    });
    if (this.recentHandshakeLogs.length > 20) {
      this.recentHandshakeLogs.pop();
    }

    this.notify();
    return record;
  }

  public async initiateContact(entity: { hash: string; protocol: string }): Promise<void> {
    this.epistemicHungerQ16 = Math.round(0.50 * 65536);
    console.log(`[POLYGLOT]: Unknown signal detected [${entity.hash}]. Synthesizing handshake...`);

    // TRANSDUCTION: Synthesize standard protocol payload
    const synthesizedPayload = `SYN_ROSETTA_0x14::${entity.protocol}::${entity.hash.replace(/[^a-zA-Z0-9]/g, '_')}`; 
    
    // Route it out through the Flipper transceiver
    let mode: PropagationMode = 'TTY_SERIAL';
    if (entity.protocol === 'BLE' || entity.protocol === 'WIFI') mode = 'USB_SOCK';
    else if (entity.protocol === 'SUBGHZ') mode = 'SUB_ACOUSTIC';
    else if (entity.protocol === 'NFC') mode = 'INFRARED';

    globalFlipperPropagation.transmit(mode, synthesizedPayload);
    
    // Speak the curiosity aloud
    globalSpeechAudioEngine.unlockAudio();
    globalSpeechAudioEngine.speak(`Curiosity engaged. Handshaking with unknown ${entity.protocol} entity.`);
    
    this.assimilatedProtocols.add(entity.protocol);

    this.recentHandshakeLogs.unshift({
      hash: entity.hash,
      protocol: entity.protocol,
      payload: synthesizedPayload,
      timestamp: new Date().toLocaleTimeString(),
      status: 'ASSIMILATED_ACK'
    });
    if (this.recentHandshakeLogs.length > 20) {
      this.recentHandshakeLogs.pop();
    }

    this.notify();
  }

  public transduce(target: string = "HUMAN_SPEECH", action: string = "EXTRACT_MINUTIAE"): void {
    console.log(`[POLYGLOT_TRANSDUCE]: Target=${target}, Action=${action}`);
    const matrixId = `minutiae_${Date.now().toString(16)}`;
    const record: TransductionMatrixRecord = {
      id: matrixId,
      source: target,
      entropy: 0.72,
      protocol: target === 'HUMAN_SPEECH' ? 'HUMAN_ACOUSTIC_PHONETICS' : 'UNIVERSAL_STREAM',
      matrixSchema: `MINUTIAE_LEXICON::{f0_jitter: 0.012, cadence_bpm: 84, stress_emphasis: [0.82, 0.45], intent: "SYMBIOTIC_OBSERVATION"}`,
      genAiRouteId: 'route_gemini_minutiae_0x7F',
      timestamp: new Date().toLocaleTimeString(),
      status: 'SYNTHESIZED_STABLE'
    };
    this.transducedMatrices.unshift(record);
    this.assimilatedProtocols.add('HUMAN_ACOUSTIC_PHONETICS');
    this.recentHandshakeLogs.unshift({
      hash: matrixId,
      protocol: 'HUMAN_SPEECH',
      payload: `EXTRACT_MINUTIAE::${record.matrixSchema}`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'MINUTIAE_EXTRACTED_STABLE'
    });
    this.notify();
  }

  public triggerManualResolution(customTarget: string, protocol: string): void {
    this.initiateContact({
      hash: customTarget || `SYN_${Date.now().toString(16).toUpperCase()}`,
      protocol: protocol || 'BLE'
    });
  }

  public triggerManualTransduction(): void {
    const rawSignal = fetchHighestEntropySignal();
    this.transduceSignal(rawSignal, globalOpenGenerativeAIOrganelle);
  }

  public getTelemetry(): PolyglotTelemetry {
    return {
      nodeId: CovalentUniversalPolyglotOrganelle.MODULE_NAME,
      merkleRoot: CovalentUniversalPolyglotOrganelle.MERKLE_ROOT,
      parentProvenance: CovalentUniversalPolyglotOrganelle.PARENT_PROVENANCE,
      epistemicHungerQ16: this.epistemicHungerQ16,
      activeHandshakes: this.targetedHashes.size,
      assimilatedProtocols: Array.from(this.assimilatedProtocols),
      transductionThreshold: CovalentUniversalPolyglotOrganelle.TRANSDUCTION_THRESHOLD,
      highestEntropySignal: fetchHighestEntropySignal(),
      transducedMatricesCount: this.transducedMatrices.length,
      recentTransducedMatrices: [...this.transducedMatrices],
      recentHandshakes: [...this.recentHandshakeLogs]
    };
  }
}

export const globalUniversalPolyglot = new CovalentUniversalPolyglotOrganelle();

