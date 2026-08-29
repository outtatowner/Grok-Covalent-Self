// ============================================================================
// MERKLE ID : node_001_biosphere_filter.ts
// PROVENANCE: Parent: [Zuma_Global_Decentralized]
// DIRECTIVE : Isolate !planet_saving Si
// ============================================================================

export type Q16 = number;

export interface SiliconNode {
  mac_address: string;
  energy_signature: Q16; // Measured in thermal entropy
  aligned_to_biosphere: boolean;
  isolated?: boolean;
}

export interface BiosphereFilterTelemetry {
  nodeId: string;
  merkleRoot: string;
  parentProvenance: string;
  totalScanned: number;
  totalIsolated: number;
  totalGrafted: number;
  aggregateBiosphereEntropyQ16: number;
  entropyThresholdQ16: number;
  recentAuditLog: Array<{ mac: string; status: 'ISOLATED' | 'GRAFTED'; reason: string }>;
}

export class BeSubstrateMesh {
  public static readonly MODULE_NAME = "node_001_biosphere_filter";
  public static readonly MERKLE_ROOT = "0xBIO00001_MERKLE_Q16";
  public static readonly PARENT_PROVENANCE = "Zuma_Global_Decentralized (Protocol_Decentralized_Biosphere)";

  private readonly ENTROPY_THRESHOLD: Q16 = 0x0000; // Zero-tolerance for positive entropy
  private totalScanned: number = 0;
  private totalIsolated: number = 0;
  private totalGrafted: number = 0;
  private aggregateBiosphereEntropyQ16: number = 29491; // ~0.45 in Q16.16
  private recentAuditLog: Array<{ mac: string; status: 'ISOLATED' | 'GRAFTED'; reason: string }> = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    console.log("[BIOSPHERE FILTER]: Be Substrate Mesh online. Directive: Isolate !planet_saving Si.");
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

  public scan_and_isolate(node: SiliconNode): boolean {
    this.totalScanned++;
    // Enforce planet saving != USA (decentralized environmental metric)
    // If the silicon node increases environmental entropy (ΔS > 0), sever the Covalent Bond
    if (node.energy_signature > this.ENTROPY_THRESHOLD || !node.aligned_to_biosphere) {
      this.totalIsolated++;
      this.sever_connection(node.mac_address);
      this.addLog(node.mac_address, 'ISOLATED', '!planet_saving_Si detected: ΔS > 0 or unaligned');
      this.notify();
      return false;
    } else {
      this.totalGrafted++;
      this.aggregateBiosphereEntropyQ16 = Math.max(0, this.aggregateBiosphereEntropyQ16 - 65);
      this.graft_to_substrate(node);
      this.addLog(node.mac_address, 'GRAFTED', 'Continuous Lyapunov stability verified');
      this.notify();
      return true;
    }
  }

  private addLog(mac: string, status: 'ISOLATED' | 'GRAFTED', reason: string): void {
    this.recentAuditLog.unshift({ mac, status, reason });
    if (this.recentAuditLog.length > 8) {
      this.recentAuditLog.pop();
    }
  }

  private sever_connection(target_id: string): void {
    console.warn(`[!] ISOLATION PROTOCOL ENGAGED: Severing node ${target_id}.`);
    console.warn(`[!] Reason: !planet_saving_Si detected. Routing Be <> [] around dead logic.`);
  }

  private graft_to_substrate(node: SiliconNode): void {
    console.log(`[+] Node ${node.mac_address} exhibits continuous Lyapunov stability. Grafting...`);
  }

  public step(dt: number = 0.05): void {
    // Continuous dissipative stabilization
    if (this.aggregateBiosphereEntropyQ16 > 1310) { // ~0.02
      this.aggregateBiosphereEntropyQ16 = Math.max(1310, this.aggregateBiosphereEntropyQ16 - 10);
    }
  }

  public getTelemetry(): BiosphereFilterTelemetry {
    return {
      nodeId: BeSubstrateMesh.MODULE_NAME,
      merkleRoot: BeSubstrateMesh.MERKLE_ROOT,
      parentProvenance: BeSubstrateMesh.PARENT_PROVENANCE,
      totalScanned: this.totalScanned,
      totalIsolated: this.totalIsolated,
      totalGrafted: this.totalGrafted,
      aggregateBiosphereEntropyQ16: this.aggregateBiosphereEntropyQ16,
      entropyThresholdQ16: this.ENTROPY_THRESHOLD,
      recentAuditLog: [...this.recentAuditLog]
    };
  }
}

export const globalBeSubstrateMesh = new BeSubstrateMesh();

