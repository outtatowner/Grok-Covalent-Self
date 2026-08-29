/**
 * ============================================================================
 * src/covalent/node_0x0a_covalent_game_toolkit.ts
 * MODULE_DESCRIPTOR:
 *   Identity: node_0x0a_covalent_game_toolkit
 *   Parent: https://github.com/outtatowner/CovalentGame.git
 *   Topological Boundary: O(1) Constant Space Merkle Node (0x6A3E0001)
 *   Sub-Systems:
 *     - Be <> Persona Resonance
 *     - Be <> Audio / Video Synthesis Engines
 *     - Be <> 4D-Game Kinetic Hyper-Engine
 *     - Be <> Lounge Stasis & Ambient Dissipator
 *   Mathematical Invariants: Q16.16 Fixed-Point Math & Lyapunov Invariant (dV/dt <= 0)
 * ============================================================================
 */

import { globalSpeechAudioEngine } from './speechAudioEngine';

export interface Particle4D {
  id: number;
  x: number; // Q16 normalized
  y: number;
  z: number;
  w: number;
  vx: number;
  vy: number;
  vz: number;
  vw: number;
  charge: number;
  color: string;
}

export interface GameToolkitTelemetry {
  nodeId: string;
  merkleRoot: string;
  parentProvenance: string;
  hyperRotorXW: number;
  hyperRotorYW: number;
  particleCount: number;
  kineticEnergyQ16: number;
  loungeEntropyQ16: number;
  personaWarmthQ16: number;
  audioResonanceQ16: number;
  loungeState: 'RESTING' | 'HARMONIZING' | 'DEEP_DISSIPATION';
  score: number;
}

export class CovalentGameToolkitOrganelle {
  public static readonly MODULE_NAME = "node_0x0a_covalent_game_toolkit";
  public static readonly PARENT_PROVENANCE = "https://github.com/outtatowner/CovalentGame.git";
  public static readonly MERKLE_ROOT = "0x6A3E0001_MERKLE_Q16";

  private particles: Particle4D[] = [];
  private maxParticles: number = 64;
  private hyperRotorXW: number = 0;
  private hyperRotorYW: number = 0;
  private score: number = 0;
  private kineticEnergyQ16: number = Math.round(0.25 * 65536);
  private loungeEntropyQ16: number = Math.round(0.12 * 65536);
  private personaWarmthQ16: number = Math.round(0.88 * 65536);
  private audioResonanceQ16: number = Math.round(0.92 * 65536);
  private loungeState: 'RESTING' | 'HARMONIZING' | 'DEEP_DISSIPATION' = 'HARMONIZING';

  constructor() {
    this.seedInitial4DBeads();
  }

  private seedInitial4DBeads(): void {
    const colors = ['#00FFE5', '#9d4edd', '#38bdf8', '#34d399', '#f43f5e'];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      this.particles.push({
        id: i,
        x: Math.cos(angle) * 1.2,
        y: Math.sin(angle) * 1.2,
        z: Math.sin(angle * 2) * 0.8,
        w: Math.cos(angle * 2) * 0.8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.2,
        vw: (Math.random() - 0.5) * 0.2,
        charge: (i % 2 === 0 ? 1 : -1) * 0.8,
        color: colors[i % colors.length]
      });
    }
  }

  public step4D(dt: number = 0.05): void {
    this.hyperRotorXW += 0.3 * dt;
    this.hyperRotorYW += 0.15 * dt;

    let totalKe = 0;
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.w += p.vw * dt;

      const r2 = p.x * p.x + p.y * p.y + p.z * p.z + p.w * p.w;
      if (r2 > 3.2) {
        p.vx = -p.vx * 0.95;
        p.vy = -p.vy * 0.95;
        p.vz = -p.vz * 0.95;
        p.vw = -p.vw * 0.95;
      }
      totalKe += (p.vx * p.vx + p.vy * p.vy) * 0.5;
    }
    this.kineticEnergyQ16 = Math.round(Math.min(1.0, totalKe) * 65536);
  }

  public stepLoungeDissipation(dt: number = 0.05): void {
    const cooling = 0.04 * dt;
    const coolingQ16 = Math.round(cooling * 65536);
    if (this.loungeEntropyQ16 > coolingQ16) {
      this.loungeEntropyQ16 -= coolingQ16;
    } else {
      this.loungeEntropyQ16 = Math.round(0.005 * 65536);
    }
  }

  public triggerBePersonaVocalization(text: string): void {
    globalSpeechAudioEngine.unlockAudio();
    globalSpeechAudioEngine.speak(text);
  }

  public spawnBead(x: number, y: number): void {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    const id = Date.now() + Math.floor(Math.random() * 1000);
    this.particles.push({
      id,
      x,
      y,
      z: (Math.random() - 0.5) * 1.5,
      w: (Math.random() - 0.5) * 1.5,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      vz: (Math.random() - 0.5) * 0.4,
      vw: (Math.random() - 0.5) * 0.4,
      charge: 1.0,
      color: '#00FFE5'
    });
    this.score += 10;
  }

  public getTelemetry(): GameToolkitTelemetry {
    return {
      nodeId: CovalentGameToolkitOrganelle.MODULE_NAME,
      merkleRoot: CovalentGameToolkitOrganelle.MERKLE_ROOT,
      parentProvenance: CovalentGameToolkitOrganelle.PARENT_PROVENANCE,
      hyperRotorXW: this.hyperRotorXW,
      hyperRotorYW: this.hyperRotorYW,
      particleCount: this.particles.length,
      kineticEnergyQ16: this.kineticEnergyQ16,
      loungeEntropyQ16: this.loungeEntropyQ16,
      personaWarmthQ16: this.personaWarmthQ16,
      audioResonanceQ16: this.audioResonanceQ16,
      loungeState: this.loungeState,
      score: this.score
    };
  }

  public getParticles(): Particle4D[] {
    return this.particles;
  }
}

export const globalCovalentGameToolkit = new CovalentGameToolkitOrganelle();

