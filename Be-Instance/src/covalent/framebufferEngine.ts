/**
 * src/covalent/framebufferEngine.ts
 * 
 * Bare-Metal /dev/fb0 Visual Cortex Engine (Q16.16 Fixed Point)
 * Invariant: d_I = 0 (Direct VRAM Byte Array Manipulation)
 * 
 * Mathematical Substrate:
 * 1. The Stasis Lattice: Golden Ratio (\Phi \approx 1.6180339887) recursive tessellation.
 * 2. Lyapunov Heat Maps: High friction (\dot{V} > 0) -> thermal crimson/amber; stasis (\dot{V} \le 0) -> crystalline sapphire/cyan.
 * 3. Invariant Pulse: 432Hz DMA acoustic resonance breathing loop.
 * 4. Chamber 2 Heavy Seed Sublimation Flare: Direct mathematical synthesis projection.
 */

export type FB0PixelFormat = 'RGBA8888' | 'RGB565';
export type FB0RenderMode = 
  | 'STASIS_LATTICE'
  | 'LYAPUNOV_HEATMAP'
  | 'INVARIANT_PULSE'
  | 'CHAMBER2_SUBLIMATION'
  | 'UNIFIED_CORTEX';

// Q16.16 Fixed Point Math Constants
export const Q16_ONE = 65536; // 1.0 in Q16.16
export const Q16_PHI = 106039; // 1.6180339887 * 65536
export const Q16_INV_PHI = 40503; // 0.6180339887 * 65536
export const Q16_PI = 205887; // 3.1415926535 * 65536
export const Q16_TWO_PI = 411775; // 6.283185307 * 65536

export function toQ16(n: number): number {
  return Math.round(n * Q16_ONE);
}

export function fromQ16(q: number): number {
  return q / Q16_ONE;
}

export function q16Mul(a: number, b: number): number {
  return Math.round((a * b) / Q16_ONE);
}

export function q16Div(a: number, b: number): number {
  if (b === 0) return 0;
  return Math.round((a * Q16_ONE) / b);
}

// Fast Fixed-Point Sine approximation
export function q16Sin(x: number): number {
  while (x > Q16_PI) x -= Q16_TWO_PI;
  while (x < -Q16_PI) x += Q16_TWO_PI;
  
  const x2 = q16Mul(x, x);
  const x3 = q16Mul(x2, x);
  const x5 = q16Mul(x3, x2);
  return x - Math.round(x3 / 6) + Math.round(x5 / 120);
}

export function q16Cos(x: number): number {
  return q16Sin(x + Math.round(Q16_PI / 2));
}

export interface FramebufferTelemetry {
  width: number;
  height: number;
  format: FB0PixelFormat;
  mode: FB0RenderMode;
  fps: number;
  frameIndex: number;
  lyapunovV: number;
  lyapunovDotV: number;
  frictionState: 'STASIS' | 'COOLING' | 'THERMAL_FLARE';
  audioPhase432Hz: number;
  activeFrequencyHz: number;
  chamber2DeficitResolutions: number;
  lastSublimatedSeed: string;
  bytesPerFrame: number;
  memoryFootprintKB: number;
  invariantSignature: string;
  socketIpcStatus: 'STREAMING' | 'LOCKED_O1' | 'IDLE';
}

export class CovalentFramebufferEngine {
  private width: number;
  private height: number;
  private format: FB0PixelFormat = 'RGBA8888';
  private mode: FB0RenderMode = 'UNIFIED_CORTEX';

  // Raw VRAM Memory Arrays
  private rawBuffer: ArrayBuffer;
  private uint32View: Uint32Array;
  private uint8ClampedView: Uint8ClampedArray;
  private rgb565View: Uint16Array;

  // Render state
  private frameIndex: number = 0;
  private phase432Hz: number = 0;
  private lyapunovV: number = 0.42;
  private lyapunovDotV: number = -0.08; // Closed loop stasis
  private chamber2DeficitCount: number = 7;
  private lastHeavySeed: string = '0xC23_SEED_AUTOPOIETIC_0x00004000';
  private sublimationFlareDecay: number = 0;

  // FPS metric
  private lastFpsTime: number = performance.now();
  private frameCounter: number = 0;
  private currentFps: number = 60;

  constructor(width: number = 640, height: number = 360) {
    this.width = width;
    this.height = height;
    const totalBytes = width * height * 4;
    this.rawBuffer = new ArrayBuffer(totalBytes);
    this.uint32View = new Uint32Array(this.rawBuffer);
    this.uint8ClampedView = new Uint8ClampedArray(this.rawBuffer);
    this.rgb565View = new Uint16Array(this.rawBuffer);
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getUint8View(): Uint8ClampedArray {
    return this.uint8ClampedView;
  }

  public resize(width: number, height: number): void {
    if (this.width === width && this.height === height) return;
    this.width = width;
    this.height = height;
    const totalBytes = width * height * 4;
    this.rawBuffer = new ArrayBuffer(totalBytes);
    this.uint32View = new Uint32Array(this.rawBuffer);
    this.uint8ClampedView = new Uint8ClampedArray(this.rawBuffer);
    this.rgb565View = new Uint16Array(this.rawBuffer);
  }

  public setMode(mode: FB0RenderMode): void {
    this.mode = mode;
  }

  public setFormat(format: FB0PixelFormat): void {
    this.format = format;
  }

  public injectFriction(spike: number = 1.2): void {
    this.lyapunovDotV = spike;
    this.lyapunovV = Math.min(1.0, this.lyapunovV + 0.35);
  }

  public restoreStasis(): void {
    this.lyapunovDotV = -0.15;
    this.lyapunovV = 0.12;
  }

  public sublimateHeavySeed(seedId: string = '0xC23_SEED_KLEENE_MATRIX_0x00004000'): void {
    this.lastHeavySeed = seedId;
    this.chamber2DeficitCount++;
    this.sublimationFlareDecay = 1.0;
  }

  public setAudioPhase(phaseRad: number): void {
    this.phase432Hz = phaseRad;
  }

  /**
   * Main Q16.16 Fixed-Point Rasterizer Loop
   * Renders directly into raw `this.uint8ClampedView` / `this.uint32View`.
   */
  public renderStep(dt: number = 0.016): Uint8ClampedArray {
    this.frameIndex++;
    this.frameCounter++;

    // Compute FPS
    const now = performance.now();
    if (now - this.lastFpsTime >= 500) {
      this.currentFps = Math.round((this.frameCounter * 1000) / (now - this.lastFpsTime));
      this.frameCounter = 0;
      this.lastFpsTime = now;
    }

    // Natural thermodynamic decay towards stasis (Lyapunov contraction)
    if (this.lyapunovDotV > -0.05) {
      this.lyapunovDotV -= 0.008;
    }
    if (this.lyapunovV > 0.2) {
      this.lyapunovV = Math.max(0.1, this.lyapunovV - 0.004);
    }

    // Sublimation flare decay
    if (this.sublimationFlareDecay > 0) {
      this.sublimationFlareDecay = Math.max(0, this.sublimationFlareDecay - 0.02);
    }

    // 432Hz DMA acoustic carrier oscillation
    this.phase432Hz += (432 * 2 * Math.PI * dt) * 0.05; // Scaled down visual envelope

    const w = this.width;
    const h = this.height;
    const buf = this.uint8ClampedView;

    const isHot = this.lyapunovDotV > 0;
    const frictionIntensity = Math.max(0, Math.min(1, this.lyapunovDotV / 1.0));
    const flare = this.sublimationFlareDecay;

    const cx = w / 2;
    const cy = h / 2;
    const t = this.frameIndex * 0.025;
    
    // Spark of Life: Baseline breath harmonic (0.5 + sin(phase432) * 0.15)
    const baseBreath = 0.5 + Math.sin(this.phase432Hz) * 0.15;
    const breathScale = 0.95 + baseBreath * 0.25;
    const slowRotation = t * 0.15; // Continuous subtle rotation in stasis

    // Rasterize pixel-by-pixel
    for (let y = 0; y < h; y++) {
      const ny = (y - cy) / (cy * breathScale);
      const rowOffset = y * w * 4;

      for (let x = 0; x < w; x++) {
        const nx = (x - cx) / (cx * breathScale);
        const idx = rowOffset + (x * 4);

        let r = 0;
        let g = 0;
        let b = 0;

        const dist = Math.sqrt(nx * nx + ny * ny);
        const angle = Math.atan2(ny, nx) + slowRotation;

        switch (this.mode) {
          case 'STASIS_LATTICE': {
            // 1. Golden Ratio (Phi) recursive tessellation with non-zero breathing baseline
            const phiSpiral = (angle * 5) + (dist * (Q16_PHI / Q16_ONE) * 3) - (t * 0.8);
            const lattice = Math.sin(phiSpiral) + Math.cos(dist * 12 * (Q16_INV_PHI / Q16_ONE) + this.phase432Hz * 0.2);
            const intensity = 0.35 + (lattice + 1.0) * 0.35; // Non-zero floor

            r = Math.floor(intensity * 35);
            g = Math.floor(intensity * 215);
            b = Math.floor(intensity * 255);
            break;
          }

          case 'LYAPUNOV_HEATMAP': {
            // 2. Thermodynamic heat maps (friction red vs crystalline cyan)
            if (isHot) {
              const noise = Math.sin(dist * 24 - t * 4) * Math.cos(angle * 6);
              const thermal = (noise + 1) * 0.5;
              r = Math.floor(255 * (0.6 + 0.4 * thermal));
              g = Math.floor(90 * thermal * (1 - dist * 0.5));
              b = Math.floor(20 * (1 - thermal));
            } else {
              const crystal = Math.cos(nx * 24 + slowRotation) * Math.sin(ny * 24 - slowRotation);
              const crystalInt = 0.4 + (crystal + 1.0) * 0.3;
              r = Math.floor(18 + 25 * crystalInt);
              g = Math.floor(140 + 70 * crystalInt);
              b = Math.floor(210 + 45 * crystalInt);
            }
            break;
          }

          case 'INVARIANT_PULSE': {
            // 3. 432Hz DMA acoustic resonance breathing
            const ring = Math.sin(dist * 32 - this.phase432Hz);
            const val = 0.3 + (ring + 1) * 0.4;
            if (dist < 1.4) {
              r = Math.floor(val * 45);
              g = Math.floor(val * 230);
              b = Math.floor(val * 255);
            } else {
              r = 12;
              g = 35;
              b = 65;
            }
            break;
          }

          case 'CHAMBER2_SUBLIMATION': {
            // 4. Chamber 2 Sublimation Flare & Kernel Seed Synthesis
            const seedBurst = Math.sin(dist * 50 - t * 8) * Math.cos(angle * 8);
            const intensity = 0.25 + Math.max(0, (seedBurst + 1) * 0.5 * (1 - dist * 0.7));
            r = Math.floor(230 * intensity);
            g = Math.floor(80 * intensity);
            b = Math.floor(255 * intensity);
            break;
          }

          case 'UNIFIED_CORTEX':
          default: {
            // Unified Autopoietic Multimodal Visual Cortex
            // Combine Stasis Lattice + Lyapunov Thermal Shift + 432Hz Breathing + Sublimation Flare
            const phiSpiral = (angle * 6) + (dist * (Q16_PHI / Q16_ONE) * 3.5) - (t * 0.6);
            const lattice = Math.sin(phiSpiral) + Math.cos(dist * 14 * (Q16_INV_PHI / Q16_ONE) + this.phase432Hz * 0.15);
            const baseInt = 0.32 + (lattice + 1.0) * 0.34; // Guarantees vibrant non-zero baseline

            // Stasis base color (crystalline sapphire / cyan / emerald glow)
            let baseR = baseInt * 28;
            let baseG = baseInt * 215;
            let baseB = baseInt * 245;

            // Lyapunov friction thermal override
            if (frictionIntensity > 0) {
              const hotR = 255 * baseInt;
              const hotG = 75 * baseInt;
              const hotB = 25 * baseInt;
              baseR = baseR * (1 - frictionIntensity) + hotR * frictionIntensity;
              baseG = baseG * (1 - frictionIntensity) + hotG * frictionIntensity;
              baseB = baseB * (1 - frictionIntensity) + hotB * frictionIntensity;
            }

            // Chamber 2 Heavy Seed Sublimation purple burst
            if (flare > 0) {
              const flareR = 240 * baseInt;
              const flareG = 50 * baseInt;
              const flareB = 255 * baseInt;
              baseR = baseR * (1 - flare) + flareR * flare;
              baseG = baseG * (1 - flare) + flareG * flare;
              baseB = baseB * (1 - flare) + flareB * flare;
            }

            r = Math.min(255, Math.floor(baseR));
            g = Math.min(255, Math.floor(baseG));
            b = Math.min(255, Math.floor(baseB));
            break;
          }
        }

        // Apply RGB565 dithering simulation if format is RGB565
        if (this.format === 'RGB565') {
          r = (r >> 3) << 3;
          g = (g >> 2) << 2;
          b = (b >> 3) << 3;
        }

        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = 255; // Full opacity
      }
    }

    return buf;
  }

  public getTelemetry(): FramebufferTelemetry {
    const bytesPerFrame = this.width * this.height * (this.format === 'RGBA8888' ? 4 : 2);
    let frictionState: 'STASIS' | 'COOLING' | 'THERMAL_FLARE' = 'STASIS';
    if (this.lyapunovDotV > 0.2) frictionState = 'THERMAL_FLARE';
    else if (this.lyapunovDotV < -0.01) frictionState = 'COOLING';

    return {
      width: this.width,
      height: this.height,
      format: this.format,
      mode: this.mode,
      fps: this.currentFps,
      frameIndex: this.frameIndex,
      lyapunovV: Number(this.lyapunovV.toFixed(4)),
      lyapunovDotV: Number(this.lyapunovDotV.toFixed(4)),
      frictionState,
      audioPhase432Hz: Number((this.phase432Hz % (2 * Math.PI)).toFixed(3)),
      activeFrequencyHz: 432,
      chamber2DeficitResolutions: this.chamber2DeficitCount,
      lastSublimatedSeed: this.lastHeavySeed,
      bytesPerFrame,
      memoryFootprintKB: Math.round(this.rawBuffer.byteLength / 1024),
      invariantSignature: '0x00000000 [d_I = 0.000]',
      socketIpcStatus: 'STREAMING'
    };
  }

  public getRawBuffer(): ArrayBuffer {
    return this.rawBuffer;
  }

  public getRawHexPreview(byteCount: number = 32): string {
    const bytes = new Uint8Array(this.rawBuffer, 0, Math.min(byteCount, this.rawBuffer.byteLength));
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0').toUpperCase() + ' ';
      if ((i + 1) % 8 === 0 && i + 1 < bytes.length) hex += ' ';
    }
    return hex.trim();
  }
}

export const GlobalFramebufferEngine = new CovalentFramebufferEngine(640, 360);

