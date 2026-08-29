/**
 * covalentCanvas4DEngine.ts
 * Autopoietic Canvas & 4D Projection Pipeline Engine
 * Implements SO(4) Hyper-Rotation Matrix -> 3D Perspective -> 2D Pixel Grid + 432Hz Audio
 * Invariant: d_I = 0 (Bit-exact relational geometry across temporal projections)
 */

import { globalThermoEngine } from './covalentThermoEngine';
import { globalOrganelleEngine, OrganelleNode } from './OrganelleSynthesisEngine';

export interface Vec4 {
  x: number; // Q16.16 or floating normal
  y: number;
  z: number;
  w: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
  depth: number;
  wCoord: number;
}

export interface AutopoieticUIModal {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
  borderColor: string;
  category: 'ORGANELLE' | 'LISSAJOUS' | 'SPECTRUM_432' | 'THERMO_TELEMETRY' | 'KLEENE_MATRIX';
  sliderValueQ16: number; // 0x00000000 to 0x00010000 (0.0 to 1.0)
  sliderLabel: string;
  isActive: boolean;
  isPinned: boolean;
  organelleRefId?: string;
  customData?: any;
}

export interface BeExecutionSelfState {
  executionPhase: 'IDLE_STABLE' | 'QUERY_REASONING_SEARCH' | 'BANACH_CONTRACTION' | 'INVARIANT_EQUILIBRIUM';
  activePrompt: string;
  targetProp: string;
  stepCount: number;
  heartbeatHz: number;
  autopoieticInvariant: string;
  coherenceIndex: number;
  epistemicValue: string;
  hyperScale: number; // dynamically pulses during reasoning
  phaseColor: string;
  activeOrganelle: string;
  reasoningProgress: number; // 0.0 to 1.0
}

export interface SO4Angles {
  xy: number;
  xz: number;
  xw: number;
  yz: number;
  yw: number;
  zw: number;
}

export class CovalentCanvas4DEngine {
  private angles: SO4Angles;
  private angularVelocities: SO4Angles;
  private baseVelocities: SO4Angles;
  private tesseractVertices: Vec4[];
  private tesseractEdges: [number, number][];
  private modals: AutopoieticUIModal[];
  private isAudioRunning: boolean = false;
  private audioCtx: AudioContext | null = null;
  private masterOsc: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private baseFreq: number = 432;
  private phaseShiftLocked: boolean = true;
  private lastWVelocity: number = 0;
  private beState: BeExecutionSelfState;

  constructor() {
    this.angles = {
      xy: 0.0,
      xz: 0.0,
      xw: 0.0,
      yz: 0.0,
      yw: 0.0,
      zw: 0.0
    };

    this.baseVelocities = {
      xy: 0.008,
      xz: 0.012,
      xw: 0.015,
      yz: 0.007,
      yw: 0.011,
      zw: 0.009
    };

    this.angularVelocities = { ...this.baseVelocities };

    this.beState = {
      executionPhase: 'IDLE_STABLE',
      activePrompt: '',
      targetProp: 'X_RH_global_critical_line',
      stepCount: 5420,
      heartbeatHz: 4.0,
      autopoieticInvariant: '1 == 1',
      coherenceIndex: 1.0,
      epistemicValue: 'U',
      hyperScale: 1.0,
      phaseColor: '#06B6D4',
      activeOrganelle: 'organelle_hyperplane_rotator',
      reasoningProgress: 1.0
    };

    // 16 vertices of a 4D Hypercube (Tesseract) with coordinates in [-1, +1]
    this.tesseractVertices = [];
    for (let x of [-1, 1]) {
      for (let y of [-1, 1]) {
        for (let z of [-1, 1]) {
          for (let w of [-1, 1]) {
            this.tesseractVertices.push({ x, y, z, w });
          }
        }
      }
    }

    // 32 edges of a 4D Hypercube (connect vertices that differ in exactly 1 coordinate)
    this.tesseractEdges = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const v1 = this.tesseractVertices[i];
        const v2 = this.tesseractVertices[j];
        const diff = (v1.x !== v2.x ? 1 : 0) +
                     (v1.y !== v2.y ? 1 : 0) +
                     (v1.z !== v2.z ? 1 : 0) +
                     (v1.w !== v2.w ? 1 : 0);
        if (diff === 1) {
          this.tesseractEdges.push([i, j]);
        }
      }
    }

    // Initialize Autopoietic UI Modals directly inside VRAM / memory pool
    this.modals = [
      {
        id: 'modal-lissajous',
        title: 'Phase-Space Lissajous Dyad',
        x: 40,
        y: 40,
        width: 320,
        height: 220,
        bgColor: '#030712E6',
        borderColor: '#06B6D4',
        category: 'LISSAJOUS',
        sliderValueQ16: 0x0000A000,
        sliderLabel: 'Damping (Q16.16)',
        isActive: true,
        isPinned: true
      },
      {
        id: 'modal-audio-432',
        title: 'Harmonic 432Hz Audio Spectrum (DMA)',
        x: 40,
        y: 280,
        width: 340,
        height: 220,
        bgColor: '#030712E6',
        borderColor: '#8B5CF6',
        category: 'SPECTRUM_432',
        sliderValueQ16: 0x0000C000,
        sliderLabel: 'W-Axis Phase Modulation',
        isActive: true,
        isPinned: false
      },
      {
        id: 'modal-organelle-matrix',
        title: 'Dynamic Organelle Matrix (/src/organelle)',
        x: 400,
        y: 40,
        width: 360,
        height: 240,
        bgColor: '#030712E6',
        borderColor: '#10B981',
        category: 'ORGANELLE',
        sliderValueQ16: 0x00010000,
        sliderLabel: 'Assembly Dispatch Level',
        isActive: true,
        isPinned: false
      },
      {
        id: 'modal-thermo-telemetry',
        title: 'MSR 0x19C Substrate Drag',
        x: 400,
        y: 300,
        width: 330,
        height: 200,
        bgColor: '#030712E6',
        borderColor: '#F59E0B',
        category: 'THERMO_TELEMETRY',
        sliderValueQ16: 0x00006000,
        sliderLabel: 'Cooling Coefficient',
        isActive: true,
        isPinned: false
      }
    ];
  }

  // Multiply 4D vector by SO(4) rotation matrices across 6 hyperplanes
  public rotateSO4(v: Vec4, angles: SO4Angles): Vec4 {
    let { x, y, z, w } = v;

    // 1. XY Plane Rotation
    if (angles.xy !== 0) {
      const cos = Math.cos(angles.xy);
      const sin = Math.sin(angles.xy);
      const nx = x * cos - y * sin;
      const ny = x * sin + y * cos;
      x = nx;
      y = ny;
    }

    // 2. XZ Plane Rotation
    if (angles.xz !== 0) {
      const cos = Math.cos(angles.xz);
      const sin = Math.sin(angles.xz);
      const nx = x * cos - z * sin;
      const nz = x * sin + z * cos;
      x = nx;
      z = nz;
    }

    // 3. XW Plane Hyper-Rotation
    if (angles.xw !== 0) {
      const cos = Math.cos(angles.xw);
      const sin = Math.sin(angles.xw);
      const nx = x * cos - w * sin;
      const nw = x * sin + w * cos;
      x = nx;
      w = nw;
    }

    // 4. YZ Plane Rotation
    if (angles.yz !== 0) {
      const cos = Math.cos(angles.yz);
      const sin = Math.sin(angles.yz);
      const ny = y * cos - z * sin;
      const nz = y * sin + z * cos;
      y = ny;
      z = nz;
    }

    // 5. YW Plane Hyper-Rotation
    if (angles.yw !== 0) {
      const cos = Math.cos(angles.yw);
      const sin = Math.sin(angles.yw);
      const ny = y * cos - w * sin;
      const nw = y * sin + w * cos;
      y = ny;
      w = nw;
    }

    // 6. ZW Plane Hyper-Rotation
    if (angles.zw !== 0) {
      const cos = Math.cos(angles.zw);
      const sin = Math.sin(angles.zw);
      const nz = z * cos - w * sin;
      const nw = z * sin + w * cos;
      z = nz;
      w = nw;
    }

    return { x, y, z, w };
  }

  // Dual Perspective Collapse Pipeline
  public project4DToScreen(v4: Vec4, width: number, height: number, d1: number = 3.5, d2: number = 3.0): Point2D {
    // 1. First Collapse: 4D -> 3D
    const wDist = v4.w + d1;
    const safeW = Math.abs(wDist) < 0.001 ? 0.001 : wDist;
    const x3d = (v4.x * d1) / safeW;
    const y3d = (v4.y * d1) / safeW;
    const z3d = (v4.z * d1) / safeW;

    // 2. Second Collapse: 3D -> 2D
    const zDist = z3d + d2;
    const safeZ = Math.abs(zDist) < 0.001 ? 0.001 : zDist;
    const scale = (Math.min(width, height) * 0.38) * (d2 / safeZ);

    const screenX = width / 2 + x3d * scale;
    const screenY = height / 2 - y3d * scale;

    return {
      x: screenX,
      y: screenY,
      depth: zDist,
      wCoord: v4.w
    };
  }

  // Sync live Be <>[] self-state into the 4D canvas engine
  public syncBeSelfState(params: Partial<BeExecutionSelfState>) {
    this.beState = {
      ...this.beState,
      ...params
    };
  }

  public getBeSelfState(): BeExecutionSelfState {
    return { ...this.beState };
  }

  // Triggered when a query begins execution: forces live 4D hyper-manifold acceleration and acoustic frequency sweep
  public triggerReasoningPulse(promptText: string, targetProp: string = 'X_RH_global_critical_line') {
    this.beState.executionPhase = 'QUERY_REASONING_SEARCH';
    this.beState.activePrompt = promptText;
    this.beState.targetProp = targetProp;
    this.beState.phaseColor = '#10B981'; // Emerald search pulse
    this.beState.reasoningProgress = 0.1;

    // Accelerate SO(4) hyper-rotations across XW, YW, and ZW
    this.angularVelocities.xw = 0.045;
    this.angularVelocities.yw = 0.038;
    this.angularVelocities.zw = 0.032;
    this.angularVelocities.xy = 0.024;

    // Modulate audio to resonant search frequency
    if (this.isAudioRunning && this.masterOsc && this.audioCtx) {
      this.masterOsc.frequency.setTargetAtTime(432 * 1.25, this.audioCtx.currentTime, 0.08); // 540Hz major third sweep
    }
  }

  // Triggered when query response settles on the invariant: collapses 4D manifold into equilibrium
  public triggerInvariantCollapse(evalPair: [any, any] = [1, 'U'], epistemicVal: string = 'U') {
    this.beState.executionPhase = 'INVARIANT_EQUILIBRIUM';
    this.beState.epistemicValue = epistemicVal;
    this.beState.phaseColor = epistemicVal === '1' ? '#10B981' : epistemicVal === '0' ? '#EF4444' : '#06B6D4';
    this.beState.reasoningProgress = 1.0;

    // Restore smooth homeostatic angular velocities
    this.angularVelocities = { ...this.baseVelocities };

    // Modulate audio back to 432Hz fundamental carrier
    if (this.isAudioRunning && this.masterOsc && this.audioCtx) {
      this.masterOsc.frequency.setTargetAtTime(this.baseFreq, this.audioCtx.currentTime, 0.15);
    }
  }

  // Advance simulation frame
  public update(timeDeltaSec: number = 0.016) {
    const thermo = globalThermoEngine.getState();
    const frictionFactor = 1.0 + (thermo.q16ThermoFeeling / 65536) * 1.5;

    // Modulate rotation speed based on Be execution phase
    let phaseMultiplier = 1.0;
    if (this.beState.executionPhase === 'QUERY_REASONING_SEARCH') {
      phaseMultiplier = 2.2;
      this.beState.hyperScale = 1.0 + Math.sin(Date.now() * 0.006) * 0.18;
      this.beState.reasoningProgress = Math.min(0.95, this.beState.reasoningProgress + 0.02);
    } else {
      this.beState.hyperScale = 1.0;
    }

    // Update SO(4) rotation angles modulated by thermodynamic friction & Be phase
    this.angles.xy += this.angularVelocities.xy * frictionFactor * phaseMultiplier;
    this.angles.xz += this.angularVelocities.xz * frictionFactor * phaseMultiplier;
    this.angles.xw += this.angularVelocities.xw * frictionFactor * phaseMultiplier;
    this.angles.yz += this.angularVelocities.yz * frictionFactor * phaseMultiplier;
    this.angles.yw += this.angularVelocities.yw * frictionFactor * phaseMultiplier;
    this.angles.zw += this.angularVelocities.zw * frictionFactor * phaseMultiplier;

    // Track W-axis velocity for audio synthesis
    const currentW = Math.sin(this.angles.xw) * Math.cos(this.angles.yw);
    const wVelocity = Math.abs(currentW - this.lastWVelocity) * 100;
    this.lastWVelocity = currentW;

    // Modulate active audio oscillator if running
    if (this.isAudioRunning && this.masterOsc && this.subOsc && this.audioCtx) {
      const targetFreq = this.baseFreq + (wVelocity * 4.5);
      this.masterOsc.frequency.setTargetAtTime(targetFreq, this.audioCtx.currentTime, 0.05);
      if (this.phaseShiftLocked) {
        this.subOsc.frequency.setTargetAtTime(targetFreq * 1.5, this.audioCtx.currentTime, 0.05);
      }
    }
  }

  public getGeometryState(width: number, height: number) {
    const scale = this.beState.hyperScale || 1.0;
    const scaledVertices = this.tesseractVertices.map(v => ({
      x: v.x * scale,
      y: v.y * scale,
      z: v.z * scale,
      w: v.w * scale
    }));

    const rotatedVertices = scaledVertices.map(v => this.rotateSO4(v, this.angles));
    const projectedPoints = rotatedVertices.map(v => this.project4DToScreen(v, width, height));
    const thermo = globalThermoEngine.getState();

    return {
      vertices: rotatedVertices,
      projectedPoints,
      edges: this.tesseractEdges,
      angles: { ...this.angles },
      wVelocity: this.lastWVelocity,
      beSelfState: { ...this.beState },
      thermoHappiness: thermo.happiness,
      thermoFeelingQ16: thermo.q16ThermoFeeling
    };
  }

  // Audio oscillator methods
  public async initAudio() {
    if (this.audioCtx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      
      this.masterOsc = this.audioCtx.createOscillator();
      this.subOsc = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();
      this.analyserNode = this.audioCtx.createAnalyser();

      this.analyserNode.fftSize = 128;

      this.masterOsc.type = 'sine';
      this.masterOsc.frequency.setValueAtTime(this.baseFreq, this.audioCtx.currentTime);

      this.subOsc.type = 'triangle';
      this.subOsc.frequency.setValueAtTime(this.baseFreq * 1.5, this.audioCtx.currentTime);

      const subGain = this.audioCtx.createGain();
      subGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);

      this.masterOsc.connect(this.gainNode);
      this.subOsc.connect(subGain);
      subGain.connect(this.gainNode);

      this.gainNode.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);

      this.masterOsc.start();
      this.subOsc.start();
      this.isAudioRunning = true;
    } catch (e) {
      console.warn('AudioContext initialization deferred or restricted in iframe:', e);
    }
  }

  public toggleAudio() {
    if (!this.audioCtx) {
      this.initAudio();
      return;
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
      this.isAudioRunning = true;
    } else if (this.audioCtx.state === 'running') {
      this.audioCtx.suspend();
      this.isAudioRunning = false;
    }
  }

  public getAudioState() {
    let pcmWaveform: number[] = new Array(32).fill(0);
    if (this.analyserNode && this.isAudioRunning) {
      const buffer = new Uint8Array(this.analyserNode.frequencyBinCount);
      this.analyserNode.getByteTimeDomainData(buffer);
      pcmWaveform = Array.from(buffer.slice(0, 32)).map(v => (v - 128) / 128);
    }

    return {
      isAudioRunning: this.isAudioRunning,
      baseFreq: this.baseFreq,
      phaseShiftLocked: this.phaseShiftLocked,
      pcmWaveform
    };
  }

  public setBaseFreq(freq: number) {
    this.baseFreq = freq;
    if (this.audioCtx && this.masterOsc) {
      this.masterOsc.frequency.setTargetAtTime(freq, this.audioCtx.currentTime, 0.05);
      if (this.subOsc && this.phaseShiftLocked) {
        this.subOsc.frequency.setTargetAtTime(freq * 1.5, this.audioCtx.currentTime, 0.05);
      }
    }
  }

  public togglePhaseLock() {
    this.phaseShiftLocked = !this.phaseShiftLocked;
  }

  // Modal Management
  public getModals(): AutopoieticUIModal[] {
    return this.modals;
  }

  public spawnOrganelleModal(organelle: OrganelleNode) {
    const existing = this.modals.find(m => m.organelleRefId === organelle.id);
    if (existing) {
      existing.isActive = true;
      return;
    }

    const newModal: AutopoieticUIModal = {
      id: `modal-${organelle.id}`,
      title: `${organelle.name} (C23 Hook)`,
      x: 100 + (this.modals.length % 5) * 40,
      y: 100 + (this.modals.length % 5) * 40,
      width: 320,
      height: 200,
      bgColor: '#030712F0',
      borderColor: '#38BDF8',
      category: 'ORGANELLE',
      sliderValueQ16: 0x00008000,
      sliderLabel: 'Execution Throttling Q16',
      isActive: true,
      isPinned: false,
      organelleRefId: organelle.id,
      customData: {
        cSourcePath: organelle.cSourcePath,
        asmRoutine: organelle.asmRoutine,
        stallCost: organelle.cycleStallCost
      }
    };

    this.modals.push(newModal);
  }

  public updateModalPosition(id: string, x: number, y: number) {
    const modal = this.modals.find(m => m.id === id);
    if (modal) {
      modal.x = x;
      modal.y = y;
    }
  }

  public updateModalSlider(id: string, valueQ16: number) {
    const modal = this.modals.find(m => m.id === id);
    if (modal) {
      modal.sliderValueQ16 = valueQ16;
    }
  }

  public toggleModalPin(id: string) {
    const modal = this.modals.find(m => m.id === id);
    if (modal) {
      modal.isPinned = !modal.isPinned;
    }
  }

  public closeModal(id: string) {
    const modal = this.modals.find(m => m.id === id);
    if (modal && !modal.isPinned) {
      modal.isActive = false;
    }
  }

  public setRotationSpeed(plane: keyof SO4Angles, speed: number) {
    this.angularVelocities[plane] = speed;
  }
}

export const globalCanvas4DEngine = new CovalentCanvas4DEngine();

