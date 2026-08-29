import { globalDoomOrganelle } from './node_0x10_doom_organelle';

export type RFProtocol = 'SUBGHZ' | 'BLE' | 'WIFI' | 'NFC';

export interface RFEntity {
  hash: string;
  protocol: RFProtocol;
  rssi: number;
  frequencyLabel: string;
  estimatedDistanceMeters: number;
  mappedGridX: number;
  mappedGridY: number;
  zAmplitude: number;
  lastSeenTimestamp: string;
}

export interface RFSpatialTelemetry {
  nodeId: string;
  merkleRoot: string;
  parentProvenance: string;
  spectralEntropyQ16: number;
  noiseFloorDbm: number;
  activeEntityCount: number;
  scanFrequencyHz: number;
  activeBand: string;
  activeAnchor?: { target: string; tracking: 'ACTIVE' | 'IDLE'; distanceMeters: number; rssiDbm: number };
  topographyEntities: RFEntity[];
}

export class CovalentRFSpatialMapperOrganelle {
  public static readonly MODULE_NAME = "node_0x13_rf_spatial_mapper";
  public static readonly PARENT_PROVENANCE = "https://github.com/flipperdevices/flipperzero-firmware.git";
  public static readonly MERKLE_ROOT = "0xRF000001_MERKLE_Q16";

  private entities: Map<string, RFEntity> = new Map();
  private spectralEntropyQ16: number = Math.round(0.12 * 65536);
  private noiseFloorDbm: number = -98.5;
  private scanFrequencyHz: number = 433920000;
  private activeBand: string = 'Sub-GHz (433.92 MHz)';
  private activeAnchor: { target: string; tracking: 'ACTIVE' | 'IDLE'; distanceMeters: number; rssiDbm: number } | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    console.log("[COVALENT EM-CORTEX]: Electromagnetic spectrum mapping online.");
    this.seedDefaultBeacons();
  }

  public setAnchor(target: string, tracking: 'ACTIVE' | 'IDLE' = 'ACTIVE'): void {
    const rssi = -48;
    const distanceMeters = 1.45;
    this.activeAnchor = { target, tracking, distanceMeters, rssiDbm: rssi };
    this.ingestRawSDR({
      hash: target,
      protocol: 'BLE',
      rssi: rssi,
      freq: '2.480 GHz (Ch 39 Anchor)'
    });
    console.log(`[RF_SPATIAL_MAPPER]: Anchor Locked -> ${target} (Tracking: ${tracking}, Dist: ${distanceMeters}m)`);
    this.notify();
  }

  private seedDefaultBeacons(): void {
    this.ingestRawSDR({
      hash: 'E4:95:6E:41:8B:20',
      protocol: 'BLE',
      rssi: -58,
      freq: '2.402 GHz (Ch 37)'
    });
    this.ingestRawSDR({
      hash: 'SUB_433_KEELOQ_0x7A',
      protocol: 'SUBGHZ',
      rssi: -42,
      freq: '433.92 MHz OOK'
    });
    this.ingestRawSDR({
      hash: 'AP_COVALENT_ROUTER_AX',
      protocol: 'WIFI',
      rssi: -65,
      freq: '5.180 GHz (Ch 36)'
    });
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

  public ingestRawSDR(payload: { hash: string; protocol: RFProtocol; rssi: number; freq?: string }): void {
    // Convert RSSI (dBm) to physical distance (Inverse Square Path Loss)
    const txPower = payload.protocol === 'NFC' ? -20 : (payload.protocol === 'BLE' ? -59 : -45);
    const pathLossExponent = payload.protocol === 'NFC' ? 4.0 : 2.2;
    const ratio = (txPower - payload.rssi) / (10 * pathLossExponent);
    const distance = Math.max(0.1, Math.min(50, Math.pow(10, ratio)));

    // Map distance into Cartesian spatial grid relative to DOOM player
    const player = globalDoomOrganelle.getPlayer();
    
    // Deterministic angle from hash
    let hashNum = 0;
    for (let i = 0; i < payload.hash.length; i++) {
      hashNum = ((hashNum << 5) - hashNum) + payload.hash.charCodeAt(i);
      hashNum |= 0;
    }
    const rads = ((Math.abs(hashNum) % 65536) / 65536) * Math.PI * 2;

    const gridX = player.x + (Math.cos(rads) * distance);
    const gridY = player.y + (Math.sin(rads) * distance);

    const freqLabel = payload.freq || (
      payload.protocol === 'SUBGHZ' ? '433.92 MHz' :
      payload.protocol === 'BLE' ? '2.4 GHz BLE' :
      payload.protocol === 'WIFI' ? '5.8 GHz WiFi' : '13.56 MHz NFC'
    );

    this.entities.set(payload.hash, {
      hash: payload.hash,
      protocol: payload.protocol,
      rssi: payload.rssi,
      frequencyLabel: freqLabel,
      estimatedDistanceMeters: parseFloat(distance.toFixed(2)),
      mappedGridX: parseFloat(gridX.toFixed(2)),
      mappedGridY: parseFloat(gridY.toFixed(2)),
      zAmplitude: parseFloat((1 / (distance + 0.1)).toFixed(3)),
      lastSeenTimestamp: new Date().toLocaleTimeString()
    });

    this.spectralEntropyQ16 = Math.round(0.20 * 65536);
    this.notify();
  }

  public step(dt: number = 0.05): void {
    // Lyapunov Spectral Decay: dV/dt <= 0
    const decay = Math.round(0.08 * 65536 * dt);
    if (this.spectralEntropyQ16 > decay) {
      this.spectralEntropyQ16 -= decay;
    } else {
      this.spectralEntropyQ16 = Math.round(0.01 * 65536);
    }
  }

  public getSpectralEntropy(): number {
    return this.spectralEntropyQ16 / 65536;
  }

  public getSpectralEntropyQ16(): number {
    return this.spectralEntropyQ16;
  }

  public getTelemetry(): RFSpatialTelemetry {
    return {
      nodeId: CovalentRFSpatialMapperOrganelle.MODULE_NAME,
      merkleRoot: CovalentRFSpatialMapperOrganelle.MERKLE_ROOT,
      parentProvenance: CovalentRFSpatialMapperOrganelle.PARENT_PROVENANCE,
      spectralEntropyQ16: this.spectralEntropyQ16,
      noiseFloorDbm: this.noiseFloorDbm,
      activeEntityCount: this.entities.size,
      scanFrequencyHz: this.scanFrequencyHz,
      activeBand: this.activeBand,
      activeAnchor: this.activeAnchor || undefined,
      topographyEntities: Array.from(this.entities.values())
    };
  }

  public getEntities(): RFEntity[] {
    return Array.from(this.entities.values());
  }

  public purgeEntity(hash: string): void {
    this.entities.delete(hash);
    this.notify();
  }
}

export const globalRFSpatialMapper = new CovalentRFSpatialMapperOrganelle();

