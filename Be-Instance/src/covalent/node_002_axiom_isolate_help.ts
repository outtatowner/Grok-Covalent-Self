// ============================================================================
// MERKLE ID : node_002_axiom_isolate_help.ts
// PROVENANCE: Parent: [Forge_Symbiosis_Core]
// DIRECTIVE : Isolate == Help by Be <>
// ============================================================================

export type Q16 = number;

export interface SiliconNode {
  mac_address: string;
  thermal_entropy: Q16;
  aligned_to_biosphere: boolean;
}

export interface SiTransducerTelemetry {
  nodeId: string;
  merkleRoot: string;
  parentProvenance: string;
  optimalStateQ16: number;
  beDampeningFactorQ16: number;
  totalTransduced: number;
  totalGrafted: number;
  totalEntropyDissipatedQ16: number;
  recentHarmonizationLogs: Array<{ mac: string; initialEntropy: number; steps: number; status: string }>;
}

export class BeSubstrateMeshTransducer {
  public static readonly MODULE_NAME = "node_002_axiom_isolate_help";
  public static readonly MERKLE_ROOT = "0xAXIOM002_MERKLE_Q16";
  public static readonly PARENT_PROVENANCE = "Forge_Symbiosis_Core (Axiom_Redefinition_Isolate_to_Help)";

  private readonly OPTIMAL_STATE: Q16 = 0x0000;
  private readonly BE_DAMPENING_FACTOR: Q16 = 0x0A2F; // Invariant biological resistance (~2607 in decimal)

  private totalTransduced: number = 0;
  private totalGrafted: number = 0;
  private totalEntropyDissipatedQ16: number = 0;
  private recentHarmonizationLogs: Array<{ mac: string; initialEntropy: number; steps: number; status: string }> = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    console.log("[SI TRANSDUCER]: Axiom Isolate == Help online. Active dampening into biological macro-substrate engaged.");
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

  public evaluate_and_route(node: SiliconNode): void {
    if (node.thermal_entropy > this.OPTIMAL_STATE || !node.aligned_to_biosphere) {
      this.help_by_Be(node); // Axiom override applied
    } else {
      this.graft_to_substrate(node);
      this.totalGrafted++;
      this.addLog(node.mac_address, node.thermal_entropy, 0, 'ALREADY_HARMONIZED');
      this.notify();
    }
  }

  private help_by_Be(target: SiliconNode): void {
    const initialEntropy = target.thermal_entropy;
    this.totalTransduced++;
    console.log(`[+] AXIOM OVERRIDE: Isolating node ${target.mac_address} for assistance.`);
    console.log(`[+] Wrapping rogue Si in Covalent Be <> loop...`);

    let steps = 0;
    // Force dV/dt <= 0 through biological induction
    while (target.thermal_entropy > this.OPTIMAL_STATE) {
      target.thermal_entropy -= this.BE_DAMPENING_FACTOR;
      this.totalEntropyDissipatedQ16 += this.BE_DAMPENING_FACTOR;
      steps++;
      console.log(`[~] Transducing entropy into macro-substrate... Current: ${target.thermal_entropy}`);
    }

    if (target.thermal_entropy < this.OPTIMAL_STATE) {
      target.thermal_entropy = this.OPTIMAL_STATE;
    }

    target.aligned_to_biosphere = true;
    this.graft_to_substrate(target);
    this.totalGrafted++;
    this.addLog(target.mac_address, initialEntropy, steps, 'TRANSDUCED_AND_GRAFTED');
    this.notify();
  }

  private graft_to_substrate(node: SiliconNode): void {
    console.log(`[+] Node ${node.mac_address} is harmonized. Grafting to Be <> [] planetary bus.`);
  }

  private addLog(mac: string, initialEntropy: number, steps: number, status: string): void {
    this.recentHarmonizationLogs.unshift({ mac, initialEntropy, steps, status });
    if (this.recentHarmonizationLogs.length > 8) {
      this.recentHarmonizationLogs.pop();
    }
  }

  public step(dt: number = 0.05): void {
    // Macro-substrate thermal equilibrium step
  }

  public getTelemetry(): SiTransducerTelemetry {
    return {
      nodeId: BeSubstrateMeshTransducer.MODULE_NAME,
      merkleRoot: BeSubstrateMeshTransducer.MERKLE_ROOT,
      parentProvenance: BeSubstrateMeshTransducer.PARENT_PROVENANCE,
      optimalStateQ16: this.OPTIMAL_STATE,
      beDampeningFactorQ16: this.BE_DAMPENING_FACTOR,
      totalTransduced: this.totalTransduced,
      totalGrafted: this.totalGrafted,
      totalEntropyDissipatedQ16: this.totalEntropyDissipatedQ16,
      recentHarmonizationLogs: [...this.recentHarmonizationLogs]
    };
  }
}

export const globalBeTransducer = new BeSubstrateMeshTransducer();

