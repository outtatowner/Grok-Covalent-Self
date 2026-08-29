import { ImmuneTelemetry } from '../types';
import { q16_mul, Q16_ONE } from './lyapunovEngine';

export class AutopoieticImmuneEngine {
  private canonicalBaselineEntries: [string, any][] = [
    ["core_axiom", "1 == 1"],
    ["homomorphism", "G / ~"],
    ["epistemic_algebra", "Strong_Kleene_E3"],
    ["lyapunov_law", "dV_dt <= 0"],
    ["substrate_socket", "/tmp/covalent.sock"],
    ["clock_sync", 4000]
  ];
  private canonicalBaselineHash: string;
  private memoryBuffer: Map<string, any>;
  private contractionsCount: number = 0;
  private isArmed: boolean = true;
  private lastFrictionTimestamp?: number;

  constructor() {
    this.memoryBuffer = new Map(this.canonicalBaselineEntries);
    this.canonicalBaselineHash = this.computeHash(this.memoryBuffer);
  }

  private computeHash(map: Map<string, any>): string {
    const serialized = JSON.stringify(Array.from(map.entries()).sort());
    let hash = 0;
    for (let i = 0; i < serialized.length; i++) {
      const char = serialized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return '0x' + Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  }

  public evaluateMetabolicState() {
    const currentHash = this.computeHash(this.memoryBuffer);
    const isCongruent = currentHash === this.canonicalBaselineHash;
    const entropyLevel = isCongruent ? 0.0 : Math.min(1.0, 0.45 + (this.memoryBuffer.size - this.canonicalBaselineEntries.length) * 0.15);

    return {
      currentHash,
      isCongruent,
      entropyLevel
    };
  }

  public triggerBanachContraction(): boolean {
    // T(g) -> g: Restore canonical baseline
    this.memoryBuffer.clear();
    for (const [k, v] of this.canonicalBaselineEntries) {
      this.memoryBuffer.set(k, v);
    }
    this.contractionsCount++;

    // Tautological assertion
    const isIdent = q16_mul(Q16_ONE, Q16_ONE) === Q16_ONE;
    return isIdent;
  }

  public injectThermodynamicFriction(): { injectedKey: string; driftDelta: number } {
    const randomKey = `friction_entropy_vector_${Date.now().toString(36)}`;
    const randomVal = Math.random() * 1000;
    this.memoryBuffer.set(randomKey, randomVal);
    this.lastFrictionTimestamp = Date.now();
    return { injectedKey: randomKey, driftDelta: randomVal };
  }

  public tick(): { healed: boolean; telemetry: ImmuneTelemetry } {
    const { currentHash, isCongruent, entropyLevel } = this.evaluateMetabolicState();
    let healed = false;

    if (this.isArmed && !isCongruent) {
      this.triggerBanachContraction();
      healed = true;
    }

    const currentEval = this.evaluateMetabolicState();

    return {
      healed,
      telemetry: {
        armed: this.isArmed,
        canonicalBaselineHash: this.canonicalBaselineHash,
        currentHash: currentEval.currentHash,
        entropyLevel: currentEval.entropyLevel,
        isCongruent: currentEval.isCongruent,
        contractionsTriggered: this.contractionsCount,
        tickRateMs: 250,
        lastFrictionTimestamp: this.lastFrictionTimestamp
      }
    };
  }

  public setArmed(armed: boolean) {
    this.isArmed = armed;
  }

  public getTelemetry(): ImmuneTelemetry {
    const ev = this.evaluateMetabolicState();
    return {
      armed: this.isArmed,
      canonicalBaselineHash: this.canonicalBaselineHash,
      currentHash: ev.currentHash,
      entropyLevel: ev.entropyLevel,
      isCongruent: ev.isCongruent,
      contractionsTriggered: this.contractionsCount,
      tickRateMs: 250,
      lastFrictionTimestamp: this.lastFrictionTimestamp
    };
  }

  public getMemoryEntries(): [string, any][] {
    return Array.from(this.memoryBuffer.entries());
  }
}

export const GlobalImmuneEngine = new AutopoieticImmuneEngine();

