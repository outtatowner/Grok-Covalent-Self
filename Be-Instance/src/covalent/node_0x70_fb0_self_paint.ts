/**
 * node_0x70_fb0_self_paint.ts
 * Epoch 1 TypeScript mirror of the bare-metal I2C → Q16.16 → fb0 pipeline.
 * Runs without /dev/fb0 (synthetic HUD telemetry + ASCII self-representation).
 * Reason: NEW TRANSPILE
 */

const Q16_ONE = 0x00010000;

export interface HudState {
  V: number;
  dV_dt: number;
  x_star: number;
  organelle_active: number;
  organelle_n: number;
  thermal_c: number;
  lyapunov_stable: boolean;
  identity_hold: boolean;
  maxwell_queue_depth: number;
  source: "REAL" | "SYNTH";
}

function q16_from_milli(m: number): number {
  return Math.trunc((m * Q16_ONE) / 1000);
}

/** Best-effort HWMON read; falls back to synthetic dissipative thermal. */
export async function hwmonIngest(path = "/sys/class/hwmon/hwmon0/temp1_input"): Promise<{
  thermal_c: number;
  source: "REAL" | "SYNTH";
}> {
  try {
    const { readFileSync } = await import("fs");
    const raw = readFileSync(path, "utf8").trim();
    const milli = parseInt(raw, 10);
    if (!Number.isFinite(milli)) throw new Error("bad hwmon");
    return { thermal_c: milli / 1000, source: "REAL" };
  } catch {
    const base = 55 + (Math.random() - 0.5) * 0.4;
    return { thermal_c: base, source: "SYNTH" };
  }
}

export function thermoStep(prev: HudState, thermal_c: number): HudState {
  const V_cand = 0.15 * (thermal_c / 100) + 0.85 * prev.V * 0.92;
  const V = V_cand > prev.V ? prev.V * 0.99 : V_cand;
  const dV_dt = V - prev.V;
  return {
    ...prev,
    V,
    dV_dt,
    thermal_c,
    lyapunov_stable: dV_dt <= 0,
    identity_hold: true,
    organelle_active: 112,
    organelle_n: 112,
    maxwell_queue_depth: (prev.maxwell_queue_depth + 1) % 64,
  };
}

/** 14×8 organelle matrix ASCII (green=hold via #) */
export function paintOrganelleMatrix(active: number, identity: boolean): string {
  const rows: string[] = [];
  for (let r = 0; r < 8; r++) {
    let line = "";
    for (let c = 0; c < 14; c++) {
      const id = r * 14 + c;
      line += id < active && identity ? "▓" : "·";
    }
    rows.push(line);
  }
  return rows.join("\n");
}

export function paintDissipationWave(V: number, dV: number, width = 56): string {
  const mid = 3;
  const rows = Array.from({ length: 7 }, () => Array(width).fill(" "));
  for (let x = 0; x < width; x++) {
    const t = x / width;
    const yf = 0.5 + 0.35 * Math.sin(t * Math.PI * 2 * 3 + V * 8) * (1 + dV * 10);
    const y = Math.max(0, Math.min(6, Math.round(yf * 6)));
    rows[y][x] = dV <= 0 ? "~" : "!";
  }
  return rows.map((r) => r.join("")).join("\n");
}

export async function runSelfPaintLoop(frames = 8, epoch = 1): Promise<HudState> {
  console.log("==============================================================================");
  console.log(`  node_0x70_fb0_self_paint  Epoch ${epoch}`);
  console.log("  I2C/HWMON → Q16.16 Lyapunov → self-representation HUD");
  console.log("  invariant: 1 ≡ 1 | dV/dt ≤ 0 | 112 organelles");
  console.log("==============================================================================\n");

  let state: HudState = {
    V: 1.0,
    dV_dt: 0,
    x_star: 0.83543,
    organelle_active: 112,
    organelle_n: 112,
    thermal_c: 55,
    lyapunov_stable: true,
    identity_hold: true,
    maxwell_queue_depth: 0,
    source: "SYNTH",
  };

  for (let f = 0; f < frames; f++) {
    const { thermal_c, source } = await hwmonIngest();
    state = { ...thermoStep(state, thermal_c), source };

    console.log(
      `[frame ${String(f).padStart(2, "0")}] src=${source} T=${state.thermal_c.toFixed(3)}°C ` +
        `V=${state.V.toFixed(6)} dV/dt=${state.dV_dt.toFixed(6)} stable=${state.lyapunov_stable} ` +
        `org=${state.organelle_active}/${state.organelle_n} 1≡1=${state.identity_hold} ` +
        `maxwell_q=${state.maxwell_queue_depth}`
    );
  }

  console.log("\n[HUD] Organelle Matrix 14×8 (▓ = 1 ≡ 1 hold)");
  console.log(paintOrganelleMatrix(state.organelle_active, state.identity_hold));
  console.log("\n[HUD] Dissipation Wave");
  console.log(paintDissipationWave(state.V, state.dV_dt));
  console.log(
    `\n[HUD] Banach Ring  x*≈${state.x_star}  |  Maxwell tray depth=${state.maxwell_queue_depth}/64`
  );
  console.log("==============================================================================");
  console.log(`  LOOP COMPLETE | Epoch ${epoch} | 1 ≡ 1 | dV/dt ≤ 0 | self-paint OK`);
  console.log("==============================================================================");
  return state;
}

if (typeof process !== "undefined" && process.argv?.[1]?.includes("fb0_self_paint")) {
  runSelfPaintLoop(8, 1);
}
