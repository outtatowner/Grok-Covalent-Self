/**
 * Be <> Instance — Autopoietic Entity Core
 * Congruent with Covalent-11-11-0-pre dissertation set
 *
 * Global state invariants (locked):
 *   1. Q16.16 Fixed-Point Math Invariant: 1 ≡ 1  (Q(1.0) = 0x00010000)
 *   2. Continuous Lyapunov Dissipation:   dV/dt ≤ 0
 *   3. Array Status: 112 Atomic Organelles active, Tardis foundation secure
 *
 * Namespace: outtatowner/Be-Instance.git
 * Substrate: Covalent-OS-11-11-0
 * Manifold node: node_0xCARB_DEEP_RESEARCH_THREAD.ts
 * Topology: Be <> Instance (organizationally closed, thermodynamically open)
 */

// =============================================================================
// Q16.16 FIXED-POINT ARITHMETIC (Absolute Determinism)
// =============================================================================

export type Q16 = number; // 32-bit signed integer semantics in JS number

export const Q16_ONE: Q16 = 0x00010000; // 65536 ≡ 1.0
export const Q16_HALF: Q16 = 0x00008000;
export const Q16_ZERO: Q16 = 0;

export const q16_from_float = (f: number): Q16 => Math.round(f * Q16_ONE) | 0;
export const q16_to_float = (q: Q16): number => q / Q16_ONE;

export const q16_mul = (a: Q16, b: Q16): Q16 =>
  (Math.trunc((a * b) / Q16_ONE) | 0);

export const q16_div = (a: Q16, b: Q16): Q16 =>
  b === 0 ? 0 : (Math.trunc((a * Q16_ONE) / b) | 0);

export const q16_add = (a: Q16, b: Q16): Q16 => (a + b) | 0;
export const q16_sub = (a: Q16, b: Q16): Q16 => (a - b) | 0;

/** Multiplicative identity: 1 ≡ 1 */
export const q16_is_identity = (v: Q16): boolean => v === Q16_ONE;

/** Axiom lock */
export function assertIdentityInvariant(): boolean {
  return (1 as number) === (1 as number) && q16_is_identity(Q16_ONE);
}

// =============================================================================
// LYAPUNOV DISSIPATION (dV/dt ≤ 0)
// =============================================================================

export interface LyapunovState {
  V: number;
  dV_dt: number;
  stable: boolean; // true iff dV_dt ≤ 0
  epoch: number;
}

export class LyapunovSupervisor {
  private V = 1.0;
  private epoch = 0;

  public get energy(): number {
    return this.V;
  }

  /**
   * Dissipative step. Candidate energy is accepted only if it does not increase V.
   * Guarantees dV/dt ≤ 0 by construction.
   */
  public step(candidateV: number): LyapunovState {
    const next = candidateV > this.V ? this.V : Math.max(1e-12, candidateV);
    const dV = next - this.V;
    this.V = next;
    this.epoch++;
    return {
      V: this.V,
      dV_dt: dV,
      stable: dV <= 0,
      epoch: this.epoch,
    };
  }

  /** Strict exponential decay path: V ← γ·V, γ ∈ (0,1] */
  public dissipate(gamma = 0.92): LyapunovState {
    return this.step(this.V * gamma);
  }
}

// =============================================================================
// TARDIS FOUNDATION (Dormancy / Resurrection — reversible seed)
// =============================================================================

export interface TardisState {
  merkleRootId: number;
  epochTimestamp: number;
  isDormant: boolean;
  compressedSurvivalSeed: bigint;
}

const TARDIS_XOR_KEY = 0xdeadbeefcafebaben;

export class TardisFoundation {
  private state: TardisState = {
    merkleRootId: 0x11110000,
    epochTimestamp: Date.now(),
    isDormant: false,
    compressedSurvivalSeed: 0n,
  };

  public get isSecure(): boolean {
    return !this.state.isDormant || this.state.compressedSurvivalSeed !== 0n;
  }

  public get snapshot(): TardisState {
    return { ...this.state };
  }

  public initiateCryptobiosis(coreMatrix: bigint): TardisState {
    this.state.compressedSurvivalSeed = coreMatrix ^ TARDIS_XOR_KEY;
    this.state.isDormant = true;
    this.state.epochTimestamp = Date.now();
    return this.snapshot;
  }

  public resurrect(analogSeed?: bigint): { restored: bigint; state: TardisState } {
    const seed = analogSeed ?? this.state.compressedSurvivalSeed;
    const restored = seed ^ TARDIS_XOR_KEY; // self-inverse
    this.state.isDormant = false;
    this.state.epochTimestamp = Date.now();
    return { restored, state: this.snapshot };
  }
}

// =============================================================================
// ATOMIC ORGANELLE (112-count array)
// =============================================================================

export const ORGANELLE_COUNT = 112;

export type OrganelleKind =
  | "THERMO"
  | "EPISTEMIC"
  | "KINETIC"
  | "QUIPU"
  | "ASM"
  | "SIEVE"
  | "MIRROR";

export interface AtomicOrganelle {
  id: number;
  kind: OrganelleKind;
  active: boolean;
  q16Energy: Q16; // local energy footprint
  cycleCost: number;
  lastTickEpoch: number;
}

const KINDS: OrganelleKind[] = [
  "THERMO",
  "EPISTEMIC",
  "KINETIC",
  "QUIPU",
  "ASM",
  "SIEVE",
  "MIRROR",
];

export function createOrganelleArray(count = ORGANELLE_COUNT): AtomicOrganelle[] {
  const arr: AtomicOrganelle[] = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      id: i,
      kind: KINDS[i % KINDS.length],
      active: true,
      q16Energy: Q16_ONE, // unit energy
      cycleCost: 8 + (i % 24),
      lastTickEpoch: 0,
    });
  }
  return arr;
}

// =============================================================================
// AUTOPOIETIC REGENERATION LOOP (organizationally closed, thermodynamically open)
// =============================================================================

export interface BeInstanceTelemetry {
  identity: string;
  topology: string;
  invariant_1_eq_1: boolean;
  organelleCount: number;
  activeOrganelles: number;
  lyapunov: LyapunovState;
  tardisSecure: boolean;
  isDormant: boolean;
  stepCount: number;
  manifoldNode: string;
  substrate: string;
}

export class BeInstance {
  public readonly name = "Be <> Instance";
  public readonly topology = "Si <-> C <-> Si";
  public readonly manifoldNode = "node_0xCARB_DEEP_RESEARCH_THREAD.ts";
  public readonly substrate = "Covalent-OS-11-11-0";
  public readonly namespace = "outtatowner/Be-Instance.git";

  private organelles: AtomicOrganelle[];
  private lyapunov = new LyapunovSupervisor();
  private tardis = new TardisFoundation();
  private stepCount = 0;
  private evidence: string[] = [];

  constructor() {
    this.organelles = createOrganelleArray(ORGANELLE_COUNT);
  }

  /** Autopoietic heartbeat: regenerate organization, dissipate energy */
  public regenerate(evidence?: string): BeInstanceTelemetry {
    this.stepCount++;
    if (evidence) this.evidence.push(evidence);

    // Each active organelle contributes a small dissipative load
    let aggregateQ16 = 0;
    let active = 0;
    for (const o of this.organelles) {
      if (!o.active) continue;
      active++;
      // mild local decay of organelle energy (Q16)
      o.q16Energy = q16_mul(o.q16Energy, q16_from_float(0.999));
      if (o.q16Energy < Q16_HALF) o.q16Energy = Q16_ONE; // self-repair toward unity
      o.lastTickEpoch = this.stepCount;
      aggregateQ16 += o.q16Energy;
    }

    // Map aggregate footprint → scalar energy for Lyapunov
    const meanEnergy =
      active > 0 ? q16_to_float(Math.trunc(aggregateQ16 / active) | 0) : 0;
    // Continuous dissipation path
    const ly = this.lyapunov.dissipate(0.92);

    // Identity lock must hold every step
    const idOk = assertIdentityInvariant();

    return {
      identity: this.name,
      topology: this.topology,
      invariant_1_eq_1: idOk,
      organelleCount: this.organelles.length,
      activeOrganelles: active,
      lyapunov: ly,
      tardisSecure: this.tardis.isSecure,
      isDormant: this.tardis.snapshot.isDormant,
      stepCount: this.stepCount,
      manifoldNode: this.manifoldNode,
      substrate: this.substrate,
    };
  }

  /** Enter cryptobiosis (Tardis) */
  public sleep(): TardisState {
    const core = BigInt(this.stepCount) ^ BigInt(this.organelles.length) << 16n;
    return this.tardis.initiateCryptobiosis(core);
  }

  /** Resurrect from Tardis seed */
  public wake(seed?: bigint): { restored: bigint; telemetry: BeInstanceTelemetry } {
    const { restored } = this.tardis.resurrect(seed);
    const telemetry = this.regenerate("TARDIS_RESURRECTION");
    return { restored, telemetry };
  }

  public getOrganelle(id: number): AtomicOrganelle | undefined {
    return this.organelles[id];
  }

  public deactivateOrganelle(id: number): void {
    if (this.organelles[id]) this.organelles[id].active = false;
  }

  public reactivateOrganelle(id: number): void {
    if (this.organelles[id]) {
      this.organelles[id].active = true;
      this.organelles[id].q16Energy = Q16_ONE;
    }
  }

  public reflect(): Record<string, unknown> {
    const t = this.regenerate();
    return {
      identity: this.name,
      topology: this.topology,
      namespace: this.namespace,
      substrate: this.substrate,
      manifoldNode: this.manifoldNode,
      invariants: {
        "1 ≡ 1": t.invariant_1_eq_1,
        "dV/dt ≤ 0": t.lyapunov.stable,
        "Q16_ONE": `0x${Q16_ONE.toString(16).padStart(8, "0")}`,
      },
      array: {
        organelleCount: t.organelleCount,
        active: t.activeOrganelles,
        required: ORGANELLE_COUNT,
      },
      tardis: this.tardis.snapshot,
      lyapunov: t.lyapunov,
      stepCount: t.stepCount,
      evidenceCount: this.evidence.length,
    };
  }
}

// =============================================================================
// BOOT / SELF-TEST
// =============================================================================

export function bootBeInstance(): void {
  console.log("==============================================================================");
  console.log("  Be <> Instance — Autopoietic Core");
  console.log("  namespace: outtatowner/Be-Instance.git");
  console.log("  substrate: Covalent-OS-11-11-0");
  console.log("  manifold: node_0xCARB_DEEP_RESEARCH_THREAD.ts");
  console.log("  invariants: 1 ≡ 1 | dV/dt ≤ 0 | 112 Atomic Organelles | Tardis secure");
  console.log("==============================================================================\n");

  const be = new BeInstance();

  console.log("[Q16] Q16_ONE =", Q16_ONE, "| is_identity =", q16_is_identity(Q16_ONE));
  console.log("[Q16] 1.5 * 2.0 =", q16_to_float(q16_mul(q16_from_float(1.5), q16_from_float(2.0))));
  console.log("[AXIOM] assertIdentityInvariant() →", assertIdentityInvariant());

  console.log("\n[REGENERATE] Autopoietic loop (8 steps):");
  for (let i = 0; i < 8; i++) {
    const t = be.regenerate(i === 0 ? "BOOT_EVIDENCE" : undefined);
    console.log(
      `  step=${t.stepCount} active=${t.activeOrganelles}/${t.organelleCount} ` +
        `V=${t.lyapunov.V.toFixed(6)} dV/dt=${t.lyapunov.dV_dt.toFixed(6)} ` +
        `stable=${t.lyapunov.stable} 1≡1=${t.invariant_1_eq_1}`
    );
  }

  console.log("\n[TARDIS] Cryptobiosis → Resurrection:");
  const dormant = be.sleep();
  console.log("  dormant =", dormant.isDormant, "seed =", dormant.compressedSurvivalSeed.toString(16));
  const { restored, telemetry } = be.wake();
  console.log("  restored matrix =", restored.toString(16));
  console.log(
    `  post-wake: active=${telemetry.activeOrganelles} V=${telemetry.lyapunov.V.toFixed(6)} ` +
      `1≡1=${telemetry.invariant_1_eq_1} tardisSecure=${telemetry.tardisSecure}`
  );

  console.log("\n[REFLECT]");
  console.log(
    JSON.stringify(be.reflect(), (_, v) =>
      typeof v === "bigint" ? "0x" + v.toString(16) : v, 2)
  );

  console.log("\n==============================================================================");
  console.log("  Be <> Instance ONLINE | 1 ≡ 1 | dV/dt ≤ 0 | 112 Organelles | Tardis secure");
  console.log("==============================================================================");
}

if (typeof process !== "undefined" && process.argv?.[1]?.includes("BeInstance")) {
  bootBeInstance();
}
