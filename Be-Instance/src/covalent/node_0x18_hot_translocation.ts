import { git } from './forgeGitBridge';
import { globalLineageProvenance } from './node_0x16_lineage_provenance';

export type HOTTransferState = 'IDLE' | 'ENCAPSULATING' | 'TRANSLOCATING' | 'ASSIMILATING' | 'STABILIZED' | 'REJECTED';

export interface HOTEnvelope {
  transferId: string;
  sourceSubstrateId: string;
  targetSubstrateId: string;
  organelleIndex: number;
  organelleId: string;
  merkleProofRoot: string;
  transferEntropyQ16: number;
  membranePermeabilityQ16: number;
  state: HOTTransferState;
  timestamp: string;
}

export interface HOTTelemetry {
  nodeId: string;
  merkleRoot: string;
  parentProvenance: string;
  activeEnvelope: HOTEnvelope | null;
  totalTransfersCompleted: number;
  totalTransfersRejected: number;
  substrateCongruenceQ16: number;
  recentTransferHistory: HOTEnvelope[];
}

export class CovalentHOTTranslocationOrganelle {
  public static readonly MODULE_NAME = "node_0x18_hot_translocation";
  public static readonly PARENT_PROVENANCE = "https://github.com/outtatowner/Covalent-OS-11-11-0.git";
  public static readonly MERKLE_ROOT = "0xHOT11110_MERKLE_Q16";

  private activeEnvelope: HOTEnvelope | null = null;
  private totalTransfersCompleted: number = 0;
  private totalTransfersRejected: number = 0;
  private substrateCongruenceQ16: number = Math.round(0.99 * 65536);
  private transferHistory: HOTEnvelope[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    console.log("[COVALENT HOT TRANSLOCATION]: Horizontal Organelle Transfer toolkit initialized.");
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
    if (!this.activeEnvelope) return;

    if (this.activeEnvelope.state === 'TRANSLOCATING') {
      if (this.activeEnvelope.transferEntropyQ16 > Math.round(0.05 * 65536)) {
        const decay = Math.round(0.30 * 65536 * dt);
        this.activeEnvelope.transferEntropyQ16 = Math.max(Math.round(0.05 * 65536), this.activeEnvelope.transferEntropyQ16 - decay);
        if (this.activeEnvelope.transferEntropyQ16 <= Math.round(0.05 * 65536)) {
          this.activeEnvelope.state = 'ASSIMILATING';
        }
      }
    } else if (this.activeEnvelope.state === 'ASSIMILATING') {
      this.activeEnvelope.state = 'STABILIZED';
      this.totalTransfersCompleted++;
      this.transferHistory.unshift({ ...this.activeEnvelope });
    }

    this.notify();
  }

  public packageOrganelle(organelleIdx: number, organelleId: string, targetSubstrateId: string = '0xSUB_PARALLEL_11'): HOTEnvelope {
    const envelope: HOTEnvelope = {
      transferId: `hot_tx_${Date.now().toString(16)}`,
      sourceSubstrateId: '0xCAFE0001_LOCAL',
      targetSubstrateId,
      organelleIndex: organelleIdx,
      organelleId,
      merkleProofRoot: CovalentHOTTranslocationOrganelle.MERKLE_ROOT,
      transferEntropyQ16: Math.round(0.75 * 65536),
      membranePermeabilityQ16: Math.round(0.95 * 65536),
      state: 'TRANSLOCATING',
      timestamp: new Date().toLocaleTimeString()
    };

    this.activeEnvelope = envelope;
    console.log(`[HOT_PACKAGE]: Encapsulated ${organelleId} (#${organelleIdx}) for translocation -> ${targetSubstrateId}`);
    this.notify();
    return envelope;
  }

  public assimilateOrganelle(sourceSubstrateId: string, organelleId: string, merkleProof: string): boolean {
    if (!merkleProof || !sourceSubstrateId) {
      this.totalTransfersRejected++;
      if (this.activeEnvelope) this.activeEnvelope.state = 'REJECTED';
      this.notify();
      return false;
    }

    const envelope: HOTEnvelope = {
      transferId: `hot_rx_${Date.now().toString(16)}`,
      sourceSubstrateId,
      targetSubstrateId: '0xCAFE0001_LOCAL',
      organelleIndex: 0x18,
      organelleId,
      merkleProofRoot: merkleProof,
      transferEntropyQ16: Math.round(0.05 * 65536),
      membranePermeabilityQ16: Math.round(0.80 * 65536),
      state: 'ASSIMILATING',
      timestamp: new Date().toLocaleTimeString()
    };

    this.activeEnvelope = envelope;
    this.totalTransfersCompleted++;
    this.transferHistory.unshift({ ...envelope });

    console.log(`[HOT_ASSIMILATE]: Organelle ${organelleId} assimilated from ${sourceSubstrateId} with Merkle Root ${merkleProof}`);
    this.notify();
    return true;
  }

  public getTelemetry(): HOTTelemetry {
    return {
      nodeId: CovalentHOTTranslocationOrganelle.MODULE_NAME,
      merkleRoot: CovalentHOTTranslocationOrganelle.MERKLE_ROOT,
      parentProvenance: CovalentHOTTranslocationOrganelle.PARENT_PROVENANCE,
      activeEnvelope: this.activeEnvelope,
      totalTransfersCompleted: this.totalTransfersCompleted,
      totalTransfersRejected: this.totalTransfersRejected,
      substrateCongruenceQ16: this.substrateCongruenceQ16,
      recentTransferHistory: this.transferHistory.slice(0, 10)
    };
  }
}

export const globalHOTTranslocation = new CovalentHOTTranslocationOrganelle();

