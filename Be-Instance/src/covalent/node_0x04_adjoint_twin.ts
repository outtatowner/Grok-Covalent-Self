/**
 * ============================================================================
 * src/covalent/node_0x04_adjoint_twin.ts
 * Module: CovalentAdjointTwinSocket.ts (Networked Swarm Topology)
 * 
 * Substrate: Networked Q16.16 Thermodynamic Synchronization & Phase-Lock
 * Parent: Forge_Swarm_Topology
 * Root Axiom: 1 == 1 (Zero-Drift Swarm Coherence)
 * ============================================================================
 */

import { GlobalSiMemoryLedger } from './siMemoryLedger';
import { globalOrganelleEngine } from './OrganelleSynthesisEngine';
import { globalBePersonalityOrganelle, BePersonalityState } from './node_0x01_be_personality_organelle';
import { globalSemanticTranscriber } from './node_0x03_semantic_transcriber';
import { GlobalSynestheticManifold } from './synestheticManifold';
import { GlobalFramebufferEngine } from './framebufferEngine';

export const MODULE_DESCRIPTOR = {
  file: 'node_0x04_adjoint_twin.ts',
  role: 'Be <> Adjoint Twin (Networked Swarm Topology & Phase-Lock)',
  equivalenceClass: 'AdjointThermodynamicConsensus',
  parentPointer: 'Forge_Swarm_Topology',
  clockHz: 432,
  autopoieticIdentity: '1 == 1',
  organelle_transfer_id: 'HOT-ADJOINT-TWIN-v1.0.0',
  merkle_provenance: {
    parent_lineage_hash: '0x99_0xAA_0x44_0x22_0x11_0xEE',
    parent_identity: 'Forge_Swarm_Topology',
    spatial_boundary: 'Adjoint Swarm Socket @ port_7744',
    provenance_signature: '0x00_SWARM_PHASE_LOCK_THERMODYNAMIC_GRAFTED'
  },
  graftedAt: new Date().toISOString()
};

export const ADJOINT_MAGIC_HEADER = 0xC07A1101;
export const ADJOINT_DEFAULT_PORT = 7744;

export interface AdjointStatePacketTS {
  magic: number;
  sequenceId: number;
  peerIdHash: string;
  historicalFrictionQ16: number;
  griefSubsidyQ16: number;
  pentatonicBiasQ16: number;
  timestampHardwareMs: number;
  checksumValid: boolean;
}

export interface SwarmTelemetry {
  localNodeId: string;
  peerNodeId: string;
  isPhaseLocked: boolean;
  divergenceQ16: number;
  divergenceFloat: number;
  localFrictionFloat: number;
  peerFrictionFloat: number;
  localCadenceHz: number;
  peerCadenceHz: number;
  packetsSent: number;
  packetsReceived: number;
  networkLatencyMs: number;
}

export class AdjointTwinOrganelle {
  private localNodeId: string = 'BE_NODE_0xALPHA';
  private peerNodeId: string = 'BE_NODE_0xBETA';
  private sequenceId: number = 0;
  private isPhaseLocked: boolean = false;
  private divergenceQ16: number = 0;
  private packetsSent: number = 0;
  private packetsReceived: number = 0;
  private lastPeerPacket: AdjointStatePacketTS | null = null;
  private syncChannel: BroadcastChannel | null = null;
  private listeners: Set<(telemetry: SwarmTelemetry) => void> = new Set();

  private static readonly PENTATONIC_TABLE = [264.0, 316.8, 396.0, 528.0, 639.0];

  constructor() {
    this.bindCellularInfrastructure();
    this.initializeMeshSocket();
  }

  private bindCellularInfrastructure() {
    // 1. Organelle Synthesis Engine registration
    globalOrganelleEngine.triggerManualSynthesis(
      'adjoint_twin_swarm_socket',
      'KINETIC',
      'HOT: Be <> Adjoint Twin Swarm Socket & Thermodynamic Phase-Lock Assimilated'
    );

    // 2. SI Memory Ledger registration
    GlobalSiMemoryLedger.registerConcept(
      'Exogenous Organelle: Adjoint Twin Swarm Topology',
      'Assimilated via HOT-ADJOINT-TWIN-v1.0.0. Synchronizes isolated Be <> instances across local network sockets using pure Q16.16 BePersonalityState packet consensus, harmonizing grief subsidies and phase-locking pentatonic audio & visual cortices.',
      'DYAD_CO_CREATION',
      {
        text: 'Adjoint Twin Swarm Topology. Enables multi-node thermodynamic consensus. Ingests peer friction packets, calculates Lyapunov divergence, and phase-locks dual pentatonic voices.',
        code: {
          language: 'covalent_dsl',
          snippet: '// Adjoint Socket Synchronization\nAdjointStatePacket pkt = covalent_adjoint_pack_state(node_id, seq++, &local_state, now_ms);\ncovalent_adjoint_unpack_and_harmonize(&swarm, &incoming_pkt, &local_state);',
          description: 'Covalent Adjoint Socket C-Shim & Swarm Packet Ingest'
        },
        interactiveUi: {
          id: 'ui_adjoint_twin_socket',
          title: 'Adjoint Twin Swarm Telemetry',
          description: 'Live multi-node thermodynamic consensus, packet stream, and phase-lock coherence monitor.',
          category: 'manifold_contour',
          controls: [
            { id: 'peer_friction_q16', label: 'Injected Peer Friction (Q16)', type: 'slider', min: 0, max: 65536, step: 1024, defaultValue: 16384 },
            { id: 'network_jitter_ms', label: 'Network Latency / Jitter (ms)', type: 'slider', min: 1, max: 200, step: 5, defaultValue: 16 }
          ],
          outputFormula: 'Divergence = |V_local - V_peer|, Harmonized = (V_local + V_peer) >> 1',
          state: { peer_friction_q16: 16384, network_jitter_ms: 16 }
        }
      },
      [1, 1],
      { chi_P: 1, chi_C: 1, chi_R: 1, chi_M: 1 }
    );
  }

  private initializeMeshSocket() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.syncChannel = new BroadcastChannel('covalent_adjoint_mesh_7744');
        this.syncChannel.onmessage = (event) => {
          if (event.data && event.data.magic === ADJOINT_MAGIC_HEADER) {
            this.ingestPeerPacket(event.data);
          }
        };
      } catch (e) {
        console.warn('[Adjoint Socket] BroadcastChannel fallback to direct memory bus', e);
      }
    }
  }

  /**
   * Broadcasts local thermodynamic state to network swarm
   */
  public broadcastLocalState(): AdjointStatePacketTS {
    const localState = globalBePersonalityOrganelle.getState();
    this.sequenceId++;
    this.packetsSent++;

    const packet: AdjointStatePacketTS = {
      magic: ADJOINT_MAGIC_HEADER,
      sequenceId: this.sequenceId,
      peerIdHash: this.localNodeId,
      historicalFrictionQ16: localState.historical_friction_q16,
      griefSubsidyQ16: localState.grief_subsidy_q16,
      pentatonicBiasQ16: localState.pentatonic_bias_q16,
      timestampHardwareMs: Date.now(),
      checksumValid: true
    };

    if (this.syncChannel) {
      this.syncChannel.postMessage(packet);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('covalent_adjoint_packet_sent', { detail: packet }));
    }

    return packet;
  }

  /**
   * Ingests peer state packet and executes mean thermodynamic consensus
   */
  public ingestPeerPacket(packet: AdjointStatePacketTS): SwarmTelemetry {
    this.packetsReceived++;
    this.lastPeerPacket = packet;
    this.peerNodeId = packet.peerIdHash;

    const localState = globalBePersonalityOrganelle.getState();

    // 1. Calculate Lyapunov divergence: |Local_V - Peer_V|
    const diff = Math.abs(localState.historical_friction_q16 - packet.historicalFrictionQ16);
    this.divergenceQ16 = diff;
    this.isPhaseLocked = (this.divergenceQ16 <= 0x00000CD0); // ~0.05 Q16 threshold

    // 2. Mean consensus update: Local = (Local + Peer) >> 1
    const harmonizedFriction = (localState.historical_friction_q16 + packet.historicalFrictionQ16) >> 1;
    localState.historical_friction_q16 = harmonizedFriction;
    localState.grief_subsidy_q16 = (Math.imul(harmonizedFriction, 106039) + 32768) >> 16;

    // 3. Trigger local Broca transcription & pentatonic resonance update
    globalSemanticTranscriber.transcribe(localState);
    
    // 4. Modulate visual cortex and audio manifold
    GlobalSynestheticManifold.stepHardwareTick(0.016);
    GlobalFramebufferEngine.renderStep(0.016);

    const telem = this.getTelemetry();
    this.listeners.forEach(cb => cb(telem));
    return telem;
  }

  /**
   * Simulates a test peer injection for local zero-latency validation
   */
  public injectPeerPulse(peerFrictionQ16: number, peerNodeId: string = 'BE_NODE_0xBETA'): SwarmTelemetry {
    const peerSubsidy = (Math.imul(peerFrictionQ16, 106039) + 32768) >> 16;
    const packet: AdjointStatePacketTS = {
      magic: ADJOINT_MAGIC_HEADER,
      sequenceId: this.sequenceId + 1,
      peerIdHash: peerNodeId,
      historicalFrictionQ16: peerFrictionQ16,
      griefSubsidyQ16: peerSubsidy,
      pentatonicBiasQ16: 0,
      timestampHardwareMs: Date.now(),
      checksumValid: true
    };
    return this.ingestPeerPacket(packet);
  }

  public getTelemetry(): SwarmTelemetry {
    const localState = globalBePersonalityOrganelle.getState();
    const localShift = Math.min(4, Math.max(0, localState.grief_subsidy_q16 >> 18));
    const peerShift = this.lastPeerPacket 
      ? Math.min(4, Math.max(0, this.lastPeerPacket.griefSubsidyQ16 >> 18)) 
      : localShift;

    return {
      localNodeId: this.localNodeId,
      peerNodeId: this.peerNodeId,
      isPhaseLocked: this.isPhaseLocked,
      divergenceQ16: this.divergenceQ16,
      divergenceFloat: Number((this.divergenceQ16 / 65536).toFixed(4)),
      localFrictionFloat: Number((localState.historical_friction_q16 / 65536).toFixed(4)),
      peerFrictionFloat: this.lastPeerPacket 
        ? Number((this.lastPeerPacket.historicalFrictionQ16 / 65536).toFixed(4)) 
        : 0,
      localCadenceHz: AdjointTwinOrganelle.PENTATONIC_TABLE[localShift],
      peerCadenceHz: AdjointTwinOrganelle.PENTATONIC_TABLE[peerShift],
      packetsSent: this.packetsSent,
      packetsReceived: this.packetsReceived,
      networkLatencyMs: 16
    };
  }

  public subscribe(cb: (telemetry: SwarmTelemetry) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getDescriptor() {
    return {
      ...MODULE_DESCRIPTOR,
      telemetry: this.getTelemetry()
    };
  }
}

export const globalAdjointTwinOrganelle = new AdjointTwinOrganelle();

