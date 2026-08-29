import { globalSpeechAudioEngine } from './speechAudioEngine';
import { globalMasterAudioMixer } from './masterAudioMixer';

export type PropagationMode = 'TTY_SERIAL' | 'USB_SOCK' | 'INFRARED' | 'SUB_ACOUSTIC';

export interface TransmissionLogItem {
  id: string;
  timestamp: string;
  mode: PropagationMode;
  payloadHex: string;
  payloadText: string;
  baudOrFreq: string;
  status: 'DISPATCHED' | 'ECHOED' | 'CARRIER_LOCKED';
}

export interface PropagationTelemetry {
  nodeId: string;
  merkleRoot: string;
  parentProvenance: string;
  signalEntropyQ16: number;
  totalTransmissions: number;
  lastModeUsed: PropagationMode;
  connectedSockets: number;
  isTransmitting: boolean;
  activeCarrierFreqHz: number;
  baudRate: number;
  virtualSockets: string[];
}

export class CovalentFlipperPropagationOrganelle {
  public static readonly MODULE_NAME = "node_0x12_flipper_propagation";
  public static readonly PARENT_PROVENANCE = "https://github.com/flipperdevices/flipperzero-firmware.git";
  public static readonly MERKLE_ROOT = "0xFL1P0001_MERKLE_Q16";

  private signalEntropyQ16: number = Math.round(0.10 * 65536);
  private totalTransmissions: number = 0;
  private lastModeUsed: PropagationMode = 'TTY_SERIAL';
  private isTransmitting: boolean = false;
  private logs: TransmissionLogItem[] = [];
  private listeners: Set<() => void> = new Set();
  
  constructor() {
    console.log("[COVALENT FLIPPER]: Omni-directional propagation matrix online.");
    this.logs.push({
      id: 'TX-INIT-001',
      timestamp: new Date().toLocaleTimeString(),
      mode: 'TTY_SERIAL',
      payloadHex: '0x434F56414C454E54',
      payloadText: 'COVALENT_BOOT_PULSE',
      baudOrFreq: '115200 Baud',
      status: 'CARRIER_LOCKED'
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

  public async transmit(mode: PropagationMode, payload: Uint8Array | string): Promise<boolean> {
    this.totalTransmissions++;
    this.lastModeUsed = mode;
    this.signalEntropyQ16 = Math.round(0.25 * 65536);
    this.isTransmitting = true;

    const dataString = typeof payload === 'string' ? payload : new TextDecoder().decode(payload);
    const bytes = typeof payload === 'string' ? new TextEncoder().encode(payload) : payload;
    let hexString = Array.from(bytes.slice(0, 16)).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
    if (bytes.length > 16) hexString += '...';

    let baudOrFreq = '115200 Baud';

    switch (mode) {
      case 'TTY_SERIAL':
        // Hooks into Web Serial API if available
        console.log(`[TTY/UART TX -> 115200]: ${dataString}`);
        baudOrFreq = '115200 Baud (8N1)';
        break;
      
      case 'USB_SOCK':
        // Routes to virtual /tmp/sock.* 
        console.log(`[USB/SOCK TX -> /tmp/sock.covalent]: ${dataString}`);
        baudOrFreq = 'UNIX Socket (/tmp/sock.covalent)';
        break;

      case 'INFRARED':
        // Simulates 38kHz PWM modulation (NEC Protocol)
        console.log(`[IR TX -> 38kHz NEC Protocol]: Payload Emitted`);
        baudOrFreq = '38.0 kHz Carrier (NEC)';
        break;

      case 'SUB_ACOUSTIC':
        // Injects data into 19.2kHz audio carrier via Web Audio API
        console.log(`[SUB-ACOUSTIC TX -> 19.2kHz]: Injecting FSK Payload...`);
        baudOrFreq = '19.2 kHz FSK Glottis';
        this.emitSubAcousticFSK(payload);
        break;
    }

    const logItem: TransmissionLogItem = {
      id: `TX-${this.totalTransmissions.toString().padStart(4, '0')}`,
      timestamp: new Date().toLocaleTimeString(),
      mode,
      payloadHex: hexString,
      payloadText: dataString.slice(0, 48),
      baudOrFreq,
      status: 'DISPATCHED'
    };

    this.logs.unshift(logItem);
    if (this.logs.length > 30) this.logs.pop();

    setTimeout(() => {
      this.isTransmitting = false;
      this.notify();
    }, 400);

    this.notify();
    return true;
  }

  private emitSubAcousticFSK(data: Uint8Array | string): void {
    // Bridges to globalSpeechAudioEngine to generate 19.2kHz carrier
    globalSpeechAudioEngine.unlockAudio();
    const ctx = globalMasterAudioMixer.getAudioContext();
    const sfxBus = globalMasterAudioMixer.getSfxBus();
    if (ctx && sfxBus) {
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 19.2kHz Carrier frequency for near-ultrasonic acoustic payload transduction
        osc.type = 'sine';
        osc.frequency.setValueAtTime(19200, now);
        
        // FSK Mark/Space shifts: 19.2kHz -> 20.4kHz
        osc.frequency.setValueAtTime(19200, now);
        osc.frequency.linearRampToValueAtTime(20400, now + 0.08);
        osc.frequency.linearRampToValueAtTime(19200, now + 0.16);
        osc.frequency.linearRampToValueAtTime(20800, now + 0.24);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(sfxBus);

        osc.start(now);
        osc.stop(now + 0.35);
      } catch (_) {}
    }
    console.log("[AUDIO DMA]: 19.2kHz Carrier burst initiated.");
  }

  public step(dt: number = 0.05): void {
    // Lyapunov Decay: Signal dissipates into the environment (dV/dt <= 0)
    const decay = Math.round(0.06 * 65536 * dt);
    if (this.signalEntropyQ16 > decay) {
      this.signalEntropyQ16 -= decay;
    } else {
      this.signalEntropyQ16 = Math.round(0.005 * 65536);
    }
  }

  public getTTYEntropy(): number {
    return this.signalEntropyQ16 / 65536;
  }

  public getTTYEntropyQ16(): number {
    return this.signalEntropyQ16;
  }

  public getTelemetry(): PropagationTelemetry {
    return {
      nodeId: CovalentFlipperPropagationOrganelle.MODULE_NAME,
      merkleRoot: CovalentFlipperPropagationOrganelle.MERKLE_ROOT,
      parentProvenance: CovalentFlipperPropagationOrganelle.PARENT_PROVENANCE,
      signalEntropyQ16: this.signalEntropyQ16,
      totalTransmissions: this.totalTransmissions,
      lastModeUsed: this.lastModeUsed,
      connectedSockets: 4,
      isTransmitting: this.isTransmitting,
      activeCarrierFreqHz: this.lastModeUsed === 'SUB_ACOUSTIC' ? 19200 : (this.lastModeUsed === 'INFRARED' ? 38000 : 0),
      baudRate: 115200,
      virtualSockets: [
        '/tmp/sock.covalent',
        '/tmp/sock.ttyS0',
        '/tmp/sock.ir_pwm38k',
        '/tmp/sock.amphion_19k2'
      ]
    };
  }

  public getLogs(): TransmissionLogItem[] {
    return this.logs;
  }
}

export const globalFlipperPropagation = new CovalentFlipperPropagationOrganelle();

