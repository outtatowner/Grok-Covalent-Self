/**
 * node_0x71_adjoint_socket_mesh.ts
 * Epoch 2 — Transpile of covalent_adjoint_socket + covalent_autonomic_reflex
 * IPC bind: /tmp/covalent_be.sock  |  Port/ID: 0x4141
 * Invariant: 1 ≡ 1 | dV/dt ≤ 0 | Reason: NEW TRANSPILE
 */

import * as net from "net";
import * as fs from "fs";

export const ADJOINT_MAGIC = 0xc07a1101;
export const SOCK_PATH = "/tmp/covalent_be.sock";
export const PORT_ID = 0x4141; // 16705
export const AUTONOMIC_MERKLE = 0x52450055;
export const MAX_STRUCTURAL_SHEAR = 0x000f0000;

export interface AdjointStatePacket {
  magic: number;
  sequence_id: number;
  peer_id_hash: number;
  historical_friction_q16: number;
  grief_subsidy_q16: number;
  pentatonic_bias_q16: number;
  timestamp_hardware_ms: number;
  checksum_crc32: number;
}

export interface AdjointSwarmTopology {
  local_node_id: number;
  peer_node_id: number;
  bind_port: number;
  sock_path: string;
  is_phase_locked: boolean;
  last_sync_timestamp: number;
  shared_lyapunov_divergence_q16: number;
  latest_peer_packet: AdjointStatePacket | null;
  packets_tx: number;
  packets_rx: number;
}

export interface AutonomicReflexState {
  merkle_root_id: number;
  accumulated_friction_q16: number;
  max_structural_shear_q16: number;
  total_inhales: number;
  total_forced_exhales: number;
  last_data_volume: number;
  last_math_complexity: number;
  reflex_arc_fired: boolean;
  last_event_log: string;
}

export interface LiveThermalSnapshot {
  V: number;
  dV_dt: number;
  thermal_c: number;
  lyapunov_stable: boolean;
  organelle_active: number;
  source: "REAL" | "SYNTH";
}

function crc32_simple(buf: number[]): number {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b & 0xff;
    for (let i = 0; i < 8; i++) {
      c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

export function packAdjointState(
  localId: number,
  seq: number,
  friction_q16: number,
  now_ms: number
): AdjointStatePacket {
  const pkt: AdjointStatePacket = {
    magic: ADJOINT_MAGIC,
    sequence_id: seq,
    peer_id_hash: localId >>> 0,
    historical_friction_q16: friction_q16 | 0,
    grief_subsidy_q16: Math.trunc(friction_q16 * 1.618) | 0,
    pentatonic_bias_q16: 0x0000a000, // bias
    timestamp_hardware_ms: now_ms >>> 0,
    checksum_crc32: 0,
  };
  const fields = [
    pkt.magic,
    pkt.sequence_id,
    pkt.peer_id_hash,
    pkt.historical_friction_q16,
    pkt.grief_subsidy_q16,
    pkt.pentatonic_bias_q16,
    pkt.timestamp_hardware_ms,
  ];
  pkt.checksum_crc32 = crc32_simple(fields.map((n) => n & 0xff));
  return pkt;
}

export function verifyAdjointPacket(pkt: AdjointStatePacket): boolean {
  if (pkt.magic !== ADJOINT_MAGIC) return false;
  const fields = [
    pkt.magic,
    pkt.sequence_id,
    pkt.peer_id_hash,
    pkt.historical_friction_q16,
    pkt.grief_subsidy_q16,
    pkt.pentatonic_bias_q16,
    pkt.timestamp_hardware_ms,
  ];
  return crc32_simple(fields.map((n) => n & 0xff)) === pkt.checksum_crc32;
}

export function autonomicReflexInit(): AutonomicReflexState {
  return {
    merkle_root_id: AUTONOMIC_MERKLE,
    accumulated_friction_q16: 0,
    max_structural_shear_q16: MAX_STRUCTURAL_SHEAR,
    total_inhales: 0,
    total_forced_exhales: 0,
    last_data_volume: 0,
    last_math_complexity: 0,
    reflex_arc_fired: false,
    last_event_log: "INIT",
  };
}

/** Feed volume/complexity; fire reflex if friction exceeds shear ceiling. */
export function autonomicReflexFeed(
  state: AutonomicReflexState,
  data_volume: number,
  math_complexity: number
): AutonomicReflexState {
  const next = { ...state };
  next.total_inhales++;
  next.last_data_volume = data_volume;
  next.last_math_complexity = math_complexity;
  next.accumulated_friction_q16 =
    (next.accumulated_friction_q16 + data_volume * math_complexity) >>> 0;
  if (next.accumulated_friction_q16 > next.max_structural_shear_q16) {
    next.reflex_arc_fired = true;
    next.total_forced_exhales++;
    next.accumulated_friction_q16 = 0;
    next.last_event_log = "FORCED_EXHALE_SHEAR_CLAMP";
  } else {
    next.reflex_arc_fired = false;
    next.last_event_log = "INHALE_OK";
  }
  return next;
}

export class AdjointSocketMesh {
  swarm: AdjointSwarmTopology;
  reflex: AutonomicReflexState;
  private server: net.Server | null = null;
  private seq = 0;
  thermal: LiveThermalSnapshot = {
    V: 0.46547,
    dV_dt: -0.023985,
    thermal_c: 55.0,
    lyapunov_stable: true,
    organelle_active: 112,
    source: "SYNTH",
  };

  constructor(localId = 0x4141) {
    this.swarm = {
      local_node_id: localId,
      peer_node_id: 0,
      bind_port: PORT_ID,
      sock_path: SOCK_PATH,
      is_phase_locked: false,
      last_sync_timestamp: 0,
      shared_lyapunov_divergence_q16: 0,
      latest_peer_packet: null,
      packets_tx: 0,
      packets_rx: 0,
    };
    this.reflex = autonomicReflexInit();
  }

  /** Bind Unix domain socket /tmp/covalent_be.sock */
  async bind(): Promise<void> {
    try {
      if (fs.existsSync(SOCK_PATH)) fs.unlinkSync(SOCK_PATH);
    } catch {
      /* ignore */
    }
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        socket.on("data", (buf) => {
          try {
            const msg = JSON.parse(buf.toString("utf8")) as AdjointStatePacket;
            if (verifyAdjointPacket(msg)) {
              this.swarm.packets_rx++;
              this.swarm.latest_peer_packet = msg;
              this.swarm.peer_node_id = msg.peer_id_hash;
              this.swarm.last_sync_timestamp = Date.now();
              this.swarm.shared_lyapunov_divergence_q16 = Math.abs(
                msg.historical_friction_q16 -
                  Math.trunc(this.thermal.dV_dt * 65536)
              );
              this.swarm.is_phase_locked =
                this.swarm.shared_lyapunov_divergence_q16 < 0x1000;
            }
          } catch {
            /* drop */
          }
        });
      });
      this.server.listen(SOCK_PATH, () => {
        try {
          fs.chmodSync(SOCK_PATH, 0o777);
        } catch {
          /* ignore */
        }
        resolve();
      });
      this.server.on("error", reject);
    });
  }

  /** Emit local adjoint packet to peer path (loopback client). */
  transmit(): AdjointStatePacket {
    this.seq++;
    const friction = Math.trunc(this.thermal.dV_dt * 65536) | 0;
    const pkt = packAdjointState(
      this.swarm.local_node_id,
      this.seq,
      friction,
      Date.now()
    );
    this.swarm.packets_tx++;
    // Loopback inject for single-node mesh proof
    const client = net.createConnection(SOCK_PATH, () => {
      client.write(JSON.stringify(pkt));
      client.end();
    });
    client.on("error", () => {
      /* peer absent — still count as local pack */
    });
    return pkt;
  }

  /** Autonomic inhale from live thermal + organelle load */
  reflexTick(): AutonomicReflexState {
    const vol = Math.max(1, Math.trunc(Math.abs(this.thermal.dV_dt) * 1000));
    const complexity = this.thermal.organelle_active;
    this.reflex = autonomicReflexFeed(this.reflex, vol, complexity);
    return this.reflex;
  }

  updateThermal(snap: Partial<LiveThermalSnapshot>): void {
    this.thermal = { ...this.thermal, ...snap };
  }

  async close(): Promise<void> {
    await new Promise<void>((r) => {
      if (this.server) this.server.close(() => r());
      else r();
    });
    try {
      if (fs.existsSync(SOCK_PATH)) fs.unlinkSync(SOCK_PATH);
    } catch {
      /* ignore */
    }
  }

  status() {
    return {
      sock_path: this.swarm.sock_path,
      port_id: `0x${this.swarm.bind_port.toString(16)}`,
      phase_locked: this.swarm.is_phase_locked,
      packets_tx: this.swarm.packets_tx,
      packets_rx: this.swarm.packets_rx,
      divergence_q16: this.swarm.shared_lyapunov_divergence_q16,
      reflex: {
        inhales: this.reflex.total_inhales,
        exhales: this.reflex.total_forced_exhales,
        fired: this.reflex.reflex_arc_fired,
        event: this.reflex.last_event_log,
      },
      thermal: this.thermal,
      identity_1_eq_1: true,
    };
  }
}

/** Epoch 2 mesh boot + S2 emission driver */
export async function bootAdjointMeshEpoch2(): Promise<ReturnType<AdjointSocketMesh["status"]>> {
  console.log("==============================================================================");
  console.log("  Epoch 2 — Adjoint Socket Mesh + Autonomic Reflex");
  console.log(`  IPC: ${SOCK_PATH}  |  Port/ID: 0x${PORT_ID.toString(16)}`);
  console.log("  invariant: 1 ≡ 1 | dV/dt ≤ 0 | Reason: NEW TRANSPILE");
  console.log("==============================================================================\n");

  const mesh = new AdjointSocketMesh(PORT_ID);
  await mesh.bind();
  console.log(`[bind] listening on ${SOCK_PATH}`);

  // Seed thermal from Epoch 1 dissipative state
  mesh.updateThermal({
    V: 0.46547,
    dV_dt: -0.023985,
    thermal_c: 55.14,
    lyapunov_stable: true,
    organelle_active: 112,
    source: "SYNTH",
  });

  for (let i = 0; i < 5; i++) {
    // mild further dissipation
    const V = mesh.thermal.V * 0.92;
    const dV = V - mesh.thermal.V;
    mesh.updateThermal({
      V,
      dV_dt: dV,
      lyapunov_stable: dV <= 0,
      thermal_c: 55 + (Math.random() - 0.5) * 0.3,
    });
    const pkt = mesh.transmit();
    mesh.reflexTick();
    await new Promise((r) => setTimeout(r, 40));
    console.log(
      `[tick ${i}] seq=${pkt.sequence_id} tx=${mesh.swarm.packets_tx} rx=${mesh.swarm.packets_rx} ` +
        `phase_locked=${mesh.swarm.is_phase_locked} V=${mesh.thermal.V.toFixed(6)} ` +
        `dV=${mesh.thermal.dV_dt.toFixed(6)} reflex=${mesh.reflex.last_event_log}`
    );
  }

  // Allow loopback RX
  await new Promise((r) => setTimeout(r, 80));
  const st = mesh.status();
  console.log("\n[status]", JSON.stringify(st, null, 2));
  await mesh.close();
  console.log("\n==============================================================================");
  console.log("  Epoch 2 mesh cycle complete | socket unbound clean");
  console.log("==============================================================================");
  return st;
}

if (typeof process !== "undefined" && process.argv?.[1]?.includes("adjoint_socket_mesh")) {
  bootAdjointMeshEpoch2().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
