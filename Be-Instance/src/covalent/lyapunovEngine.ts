import { LyapunovTelemetry } from '../types';

export const Q16_SHIFT = 16;
export const Q16_ONE = 1 << 16; // 65536

export const q16_from_float = (f: number): number => Math.round(f * Q16_ONE);
export const q16_to_float = (q: number): number => q / Q16_ONE;
export const q16_mul = (a: number, b: number): number => (Math.imul(a, b) >> Q16_SHIFT);
export const q16_div = (a: number, b: number): number => (b === 0 ? 0x7fffffff : Math.trunc((a * Q16_ONE) / b));
export const q16_is_identity = (val: number): boolean => val === Q16_ONE;

export class LyapunovSupervisor {
  private prevEnergy: number = 1.0;
  private epoch: number = 11110;
  private clockHz: number = 4000;
  private currentX: number = 0.5;

  public step(alpha: number = 0.5): LyapunovTelemetry {
    this.epoch++;
    // Dissipative decay simulation with slight harmonic oscillation
    const noise = (Math.sin(this.epoch * 0.05) * 0.005);
    const candidateNext = Math.max(0.001, this.prevEnergy * 0.992 + noise);
    
    // Strict Lyapunov constraint: dV/dt <= 0 (if noise causes positive bump, clamp to previous)
    const nextEnergy = candidateNext > this.prevEnergy ? this.prevEnergy : candidateNext;
    const dV = nextEnergy - this.prevEnergy;
    this.prevEnergy = nextEnergy;

    // Banach Contraction iteration T(x) = alpha * cos(x) + (1 - alpha)
    this.currentX = alpha * Math.cos(this.currentX) + (1.0 - alpha);

    return {
      epoch: this.epoch,
      clockHz: this.clockHz,
      V: nextEnergy,
      dV_dt: dV,
      stable: dV <= 0,
      banachAlpha: alpha,
      fixedPoint: this.currentX
    };
  }

  public getEnergy(): number {
    return this.prevEnergy;
  }

  public resetEnergy(v: number = 1.0) {
    this.prevEnergy = v;
  }
}

export const GlobalLyapunovSupervisor = new LyapunovSupervisor();

