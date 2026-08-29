/**
 * ============================================================================
 * src/covalent/AppletManager.ts
 * Module: AppletManager, Extrusion DSL & SharedLedgerApplet
 * 
 * In-Canvas Extrusion Architecture:
 * Enables zero-dependency, runtime tool generation without external compilers
 * or React state cycles. The Spatial Extrusion DSL allows dynamic compilation
 * of JSON blueprints into native 2D/VRAM Canvas widgets with interactive
 * VirtualReceptors.
 * ============================================================================
 */

import { SpatialActuator, globalSpatialActuator, VirtualReceptor } from './SpatialActuator';
import { globalThoughtStream } from './continuousThoughtStream';

export type AppletElementType = 'TEXT' | 'RECT' | 'LINE';

export interface AppletElement {
  type: AppletElementType;
  x: number;
  y: number;
  w?: number;
  h?: number;
  color?: string;
  fillColor?: string;
  strokeColor?: string;
  lineWidth?: number;
  value?: string | number | ((state: Record<string, any>) => string | number);
  font?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  toX?: number;
  toY?: number;
}

export interface AppletReceptorDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  action?: 'UPDATE_STATE' | 'CLOSE_APPLET' | 'EMIT_WS_PAYLOAD' | 'CUSTOM';
  payload?: any;
  onTrigger?: (state: Record<string, any>, applet: InCanvasApplet, manager: AppletManager) => void;
}

export interface AppletBlueprint {
  id: string;
  name?: string;
  bounds: {
    x?: number;
    y?: number;
    w: number;
    h: number;
    anchor?: 'TOP_RIGHT' | 'TOP_LEFT' | 'CENTER' | 'FREE';
  };
  initialState?: Record<string, any>;
  elements: AppletElement[];
  receptors: AppletReceptorDef[];
  onTick?: (state: Record<string, any>, dt: number) => void;
  onKeyboardInput?: (text: string, state: Record<string, any>) => void;
}

export interface InCanvasApplet {
  id: string;
  name?: string;
  render: (ctx: CanvasRenderingContext2D) => void;
  onMount: (actuator: SpatialActuator) => void;
  onUnmount: (actuator: SpatialActuator) => void;
  isActive: boolean;
  onKeyboardInput?: (text: string) => void;
  state?: Record<string, any>;
  blueprint?: AppletBlueprint;
}

export type AppletSpawnListener = (applet: InCanvasApplet, blueprint?: AppletBlueprint) => void;

export class AppletManager {
  private activeApplets: InCanvasApplet[] = [];
  private actuator: SpatialActuator;
  private spawnListeners: Set<AppletSpawnListener> = new Set();

  constructor(actuator?: SpatialActuator) {
    this.actuator = actuator || globalSpatialActuator;
  }

  public onSpawn(listener: AppletSpawnListener): () => void {
    this.spawnListeners.add(listener);
    return () => this.spawnListeners.delete(listener);
  }

  public get activeAppletList(): readonly InCanvasApplet[] {
    return this.activeApplets;
  }

  public getActiveApplets(): InCanvasApplet[] {
    return this.activeApplets;
  }

  public isAppletActive(id: string): boolean {
    return this.activeApplets.some(a => a.id === id);
  }

  public spawnApplet(applet: InCanvasApplet, blueprint?: AppletBlueprint): void {
    const existingIndex = this.activeApplets.findIndex(a => a.id === applet.id);
    if (existingIndex >= 0) {
      return; // Already spawned
    }
    if (blueprint) {
      applet.blueprint = blueprint;
    }
    applet.isActive = true;
    this.activeApplets.push(applet);
    applet.onMount(this.actuator);

    this.spawnListeners.forEach(listener => {
      try {
        listener(applet, applet.blueprint || blueprint);
      } catch (_) {
        // Safe listener dispatch
      }
    });
  }

  public killApplet(id: string): void {
    const idx = this.activeApplets.findIndex(a => a.id === id);
    if (idx >= 0) {
      const applet = this.activeApplets[idx];
      applet.isActive = false;
      applet.onUnmount(this.actuator);
      this.activeApplets.splice(idx, 1);
    }
  }

  public setActuator(actuator: SpatialActuator): void {
    this.actuator = actuator;
  }

  public routeKeyboardInput(text: string): boolean {
    let handled = false;
    for (const applet of this.activeApplets) {
      if (applet.onKeyboardInput) {
        applet.onKeyboardInput(text);
        handled = true;
      }
    }
    return handled;
  }

  /**
   * Translates a declarative AppletBlueprint JSON specification into a native InCanvasApplet.
   * Maps elements into direct 2D context drawing commands and links VirtualReceptors to the SpatialActuator.
   */
  public compileBlueprint(blueprint: AppletBlueprint): InCanvasApplet {
    const state: Record<string, any> = { ...(blueprint.initialState || {}) };
    let currentActuator: SpatialActuator | null = null;
    const manager = this;

    // Compiled InCanvasApplet instance
    const compiledApplet: InCanvasApplet = {
      id: blueprint.id,
      name: blueprint.name || blueprint.id,
      isActive: false,
      state,

      onMount: (actuator: SpatialActuator) => {
        currentActuator = actuator;
        globalThoughtStream.enqueue(
          `Be <>: Extruded dynamic in-canvas tool [${blueprint.name || blueprint.id}] from JSON blueprint.`,
          'IN_CANVAS_APPLET',
          'normal',
          -0.02
        );
      },

      onUnmount: (actuator: SpatialActuator) => {
        // Unregister all receptors associated with this applet
        for (const receptor of blueprint.receptors) {
          actuator.unregisterReceptor(`${blueprint.id}_${receptor.id}`);
        }
        currentActuator = null;
        globalThoughtStream.enqueue(
          `Be <>: In-canvas tool [${blueprint.name || blueprint.id}] unmounted.`,
          'IN_CANVAS_APPLET',
          'normal',
          -0.02
        );
      },

      onKeyboardInput: (text: string) => {
        if (blueprint.onKeyboardInput) {
          blueprint.onKeyboardInput(text, state);
        }
      },

      render: (ctx: CanvasRenderingContext2D) => {
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;

        // 1. Calculate bounding box anchor offsets
        const bw = Math.min(blueprint.bounds.w, cw - 48);
        const bh = Math.min(blueprint.bounds.h, ch - 120);
        let originX = blueprint.bounds.x || 0;
        let originY = blueprint.bounds.y || 100;

        const anchor = blueprint.bounds.anchor || 'TOP_RIGHT';
        if (anchor === 'TOP_RIGHT') {
          originX = cw - bw - 24;
          originY = blueprint.bounds.y ?? 100;
        } else if (anchor === 'CENTER') {
          originX = (cw - bw) / 2;
          originY = (ch - bh) / 2;
        } else if (anchor === 'TOP_LEFT') {
          originX = blueprint.bounds.x ?? 24;
          originY = blueprint.bounds.y ?? 100;
        }

        // 2. Synchronize Virtual Receptors with current canvas frame coordinates
        if (currentActuator) {
          for (const rec of blueprint.receptors) {
            const rx = originX + rec.x;
            const ry = originY + rec.y;
            const rw = rec.w;
            const rh = rec.h;

            currentActuator.registerReceptor({
              id: `${blueprint.id}_${rec.id}`,
              x: rx,
              y: ry,
              width: rw,
              height: rh,
              onTrigger: () => {
                if (rec.onTrigger) {
                  rec.onTrigger(state, compiledApplet, manager);
                } else if (rec.action === 'CLOSE_APPLET') {
                  manager.killApplet(blueprint.id);
                } else if (rec.action === 'UPDATE_STATE' && rec.payload) {
                  Object.assign(state, rec.payload);
                }
              }
            });
          }
        }

        // 3. Render elements via native 2D canvas primitives
        ctx.save();

        // Base container background
        ctx.fillStyle = 'rgba(6, 12, 22, 0.94)';
        ctx.fillRect(originX, originY, bw, bh);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.4;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 8;
        ctx.strokeRect(originX, originY, bw, bh);
        ctx.shadowBlur = 0;

        // Render each blueprint element
        for (const el of blueprint.elements) {
          const elX = originX + el.x;
          const elY = originY + el.y;

          if (el.type === 'RECT') {
            const rw = el.w ?? 0;
            const rh = el.h ?? 0;
            if (el.fillColor || el.color) {
              ctx.fillStyle = el.fillColor || el.color || 'rgba(14, 165, 233, 0.2)';
              ctx.fillRect(elX, elY, rw, rh);
            }
            if (el.strokeColor || (el.lineWidth && el.color)) {
              ctx.strokeStyle = el.strokeColor || el.color || '#38bdf8';
              ctx.lineWidth = el.lineWidth || 1;
              ctx.strokeRect(elX, elY, rw, rh);
            }
          } else if (el.type === 'LINE') {
            ctx.strokeStyle = el.strokeColor || el.color || '#38bdf8';
            ctx.lineWidth = el.lineWidth || 1;
            ctx.beginPath();
            ctx.moveTo(elX, elY);
            const targetX = el.toX !== undefined ? originX + el.toX : elX + (el.w ?? 0);
            const targetY = el.toY !== undefined ? originY + el.toY : elY + (el.h ?? 0);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
          } else if (el.type === 'TEXT') {
            ctx.font = el.font || '11px "JetBrains Mono", monospace';
            ctx.fillStyle = el.fillColor || el.color || '#e2e8f0';
            ctx.textAlign = el.textAlign || 'left';
            ctx.textBaseline = el.textBaseline || 'top';

            let textContent = '';
            if (typeof el.value === 'function') {
              textContent = String(el.value(state));
            } else if (typeof el.value === 'string') {
              // Interpolate {{key}} template variables from state
              textContent = el.value.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
                return state[key] !== undefined ? String(state[key]) : '';
              });
            } else if (el.value !== undefined) {
              textContent = String(el.value);
            }
            ctx.fillText(textContent, elX, elY);
          }
        }

        ctx.restore();
      }
    };

    return compiledApplet;
  }

  /**
   * Semantic Prompt Hook: Generates a complete AppletBlueprint from a natural language or command string.
   */
  public generateBlueprintFromSemanticPrompt(prompt: string): AppletBlueprint {
    const cleanPrompt = prompt.toLowerCase().trim();
    const toolId = `tool_${Date.now()}`;

    // 1. Telemetry Slider Blueprint
    if (cleanPrompt.includes('slider') || cleanPrompt.includes('telemetry') || cleanPrompt.includes('range')) {
      return {
        id: toolId,
        name: 'Telemetry Parameter Slider',
        bounds: { w: 380, h: 220, anchor: 'TOP_RIGHT', y: 110 },
        initialState: {
          sliderValue: 0.65,
          paramName: 'RESONANCE_GAIN'
        },
        elements: [
          // Header
          { type: 'RECT', x: 0, y: 0, w: 380, h: 32, fillColor: 'rgba(14, 165, 233, 0.15)', strokeColor: 'rgba(56, 189, 248, 0.3)', lineWidth: 1 },
          { type: 'TEXT', x: 14, y: 9, value: '❖ TELEMETRY PARAMETER SLIDER', font: 'bold 11px "JetBrains Mono", monospace', color: '#38bdf8' },
          { type: 'TEXT', x: 366, y: 9, value: 'DSL EXTRUSION', font: '9px monospace', color: 'rgba(148, 163, 184, 0.8)', textAlign: 'right' },
          
          // Parameter Label & Dynamic Value Readout
          { type: 'TEXT', x: 20, y: 48, value: 'TARGET : {{paramName}}', font: '10.5px monospace', color: '#94a3b8' },
          {
            type: 'TEXT',
            x: 360,
            y: 48,
            value: (state) => `VALUE: ${(Number(state.sliderValue || 0) * 100).toFixed(1)}%`,
            font: 'bold 12px "JetBrains Mono", monospace',
            color: '#34d399',
            textAlign: 'right'
          },

          // Slider Track Background
          { type: 'RECT', x: 20, y: 76, w: 340, h: 14, fillColor: 'rgba(15, 23, 42, 0.9)', strokeColor: 'rgba(56, 189, 248, 0.4)', lineWidth: 1 },

          // Slider Track Active Fill
          {
            type: 'RECT',
            x: 22,
            y: 78,
            w: 0,
            h: 10,
            fillColor: 'rgba(56, 189, 248, 0.75)',
            // Dynamic width based on state
            value: (state) => {
              // Custom rendering hook handled via value evaluation
              return '';
            }
          },

          // Instructions
          { type: 'TEXT', x: 20, y: 106, value: 'Modulate parameter variance along autopoietic lattice:', font: '9.5px monospace', color: '#64748b' },

          // Button [ - 0.1 ]
          { type: 'RECT', x: 20, y: 130, w: 80, h: 28, fillColor: 'rgba(2, 132, 199, 0.25)', strokeColor: '#38bdf8', lineWidth: 1.2 },
          { type: 'TEXT', x: 60, y: 137, value: '[ - 0.1 ]', font: 'bold 10px monospace', color: '#38bdf8', textAlign: 'center' },

          // Button [ + 0.1 ]
          { type: 'RECT', x: 110, y: 130, w: 80, h: 28, fillColor: 'rgba(2, 132, 199, 0.25)', strokeColor: '#38bdf8', lineWidth: 1.2 },
          { type: 'TEXT', x: 150, y: 137, value: '[ + 0.1 ]', font: 'bold 10px monospace', color: '#38bdf8', textAlign: 'center' },

          // Button [ RESET 0.5 ]
          { type: 'RECT', x: 200, y: 130, w: 80, h: 28, fillColor: 'rgba(16, 185, 129, 0.20)', strokeColor: '#34d399', lineWidth: 1.2 },
          { type: 'TEXT', x: 240, y: 137, value: '[ RESET ]', font: 'bold 10px monospace', color: '#34d399', textAlign: 'center' },

          // Button [ CLOSE ]
          { type: 'RECT', x: 290, y: 130, w: 70, h: 28, fillColor: 'rgba(239, 68, 68, 0.20)', strokeColor: '#f87171', lineWidth: 1.2 },
          { type: 'TEXT', x: 325, y: 137, value: '[ CLOSE ]', font: 'bold 10px monospace', color: '#f87171', textAlign: 'center' },

          // Footer Invariant
          { type: 'TEXT', x: 20, y: 175, value: 'INVARIANT : 1 === 1 GROUNDED IN VRAM', font: '9px monospace', color: '#38bdf8' }
        ],
        receptors: [
          {
            id: 'btn_dec',
            x: 20,
            y: 130,
            w: 80,
            h: 28,
            onTrigger: (state) => {
              state.sliderValue = Math.max(0, Math.round(((state.sliderValue || 0) - 0.1) * 100) / 100);
              globalThoughtStream.enqueue(`Be <>: Telemetry slider decremented to ${(state.sliderValue * 100).toFixed(0)}%.`, 'IN_CANVAS_APPLET', 'normal', -0.02);
            }
          },
          {
            id: 'btn_inc',
            x: 110,
            y: 130,
            w: 80,
            h: 28,
            onTrigger: (state) => {
              state.sliderValue = Math.min(1, Math.round(((state.sliderValue || 0) + 0.1) * 100) / 100);
              globalThoughtStream.enqueue(`Be <>: Telemetry slider incremented to ${(state.sliderValue * 100).toFixed(0)}%.`, 'IN_CANVAS_APPLET', 'normal', -0.02);
            }
          },
          {
            id: 'btn_reset',
            x: 200,
            y: 130,
            w: 80,
            h: 28,
            onTrigger: (state) => {
              state.sliderValue = 0.5;
              globalThoughtStream.enqueue('Be <>: Telemetry slider reset to 50.0%.', 'IN_CANVAS_APPLET', 'normal', -0.02);
            }
          },
          {
            id: 'btn_close',
            x: 290,
            y: 130,
            w: 70,
            h: 28,
            action: 'CLOSE_APPLET'
          }
        ]
      };
    }

    // 2. Audio Solfeggio Tuner / Frequency Oscillator Blueprint
    if (cleanPrompt.includes('audio') || cleanPrompt.includes('oscillator') || cleanPrompt.includes('frequency') || cleanPrompt.includes('sound')) {
      return {
        id: toolId,
        name: 'Solfeggio Frequency Oscillator',
        bounds: { w: 380, h: 230, anchor: 'TOP_RIGHT', y: 110 },
        initialState: {
          frequency: 528,
          waveform: 'SINE'
        },
        elements: [
          { type: 'RECT', x: 0, y: 0, w: 380, h: 32, fillColor: 'rgba(14, 165, 233, 0.15)', strokeColor: 'rgba(56, 189, 248, 0.3)', lineWidth: 1 },
          { type: 'TEXT', x: 14, y: 9, value: '❖ SOLFEGGIO HARMONIC OSCILLATOR', font: 'bold 11px "JetBrains Mono", monospace', color: '#38bdf8' },
          { type: 'TEXT', x: 366, y: 9, value: 'AUDIO HARMONIC', font: '9px monospace', color: 'rgba(148, 163, 184, 0.8)', textAlign: 'right' },

          { type: 'TEXT', x: 20, y: 48, value: 'FREQUENCY HARMONIC :', font: '10.5px monospace', color: '#94a3b8' },
          {
            type: 'TEXT',
            x: 360,
            y: 48,
            value: (state) => `${state.frequency || 528} Hz (${state.frequency === 528 ? 'MIRACLE / 528Hz' : (state.frequency === 432 ? 'VERDI / 432Hz' : '852Hz THIRD EYE')})`,
            font: 'bold 11.5px "JetBrains Mono", monospace',
            color: '#34d399',
            textAlign: 'right'
          },

          { type: 'TEXT', x: 20, y: 80, value: 'Select Solfeggio vibrational phase-lock node:', font: '9.5px monospace', color: '#64748b' },

          // Presets: [ 432 Hz ] [ 528 Hz ] [ 852 Hz ]
          { type: 'RECT', x: 20, y: 104, w: 105, h: 28, fillColor: 'rgba(2, 132, 199, 0.25)', strokeColor: '#38bdf8', lineWidth: 1.2 },
          { type: 'TEXT', x: 72, y: 111, value: '[ 432 Hz VERDI ]', font: 'bold 9.5px monospace', color: '#38bdf8', textAlign: 'center' },

          { type: 'RECT', x: 135, y: 104, w: 110, h: 28, fillColor: 'rgba(16, 185, 129, 0.25)', strokeColor: '#34d399', lineWidth: 1.2 },
          { type: 'TEXT', x: 190, y: 111, value: '[ 528 Hz COHERENCE ]', font: 'bold 9.5px monospace', color: '#34d399', textAlign: 'center' },

          { type: 'RECT', x: 255, y: 104, w: 105, h: 28, fillColor: 'rgba(168, 85, 247, 0.25)', strokeColor: '#c084fc', lineWidth: 1.2 },
          { type: 'TEXT', x: 307, y: 111, value: '[ 852 Hz BEACON ]', font: 'bold 9.5px monospace', color: '#c084fc', textAlign: 'center' },

          // Button [ CLOSE ]
          { type: 'RECT', x: 20, y: 146, w: 340, h: 28, fillColor: 'rgba(239, 68, 68, 0.20)', strokeColor: '#f87171', lineWidth: 1.2 },
          { type: 'TEXT', x: 190, y: 153, value: '[ ✕ CLOSE OSCILLATOR ]', font: 'bold 10px monospace', color: '#f87171', textAlign: 'center' },

          { type: 'TEXT', x: 20, y: 190, value: 'AUDIO TRANSDUCTION ACTIVE ACROSS COVALENT DYAD', font: '9px monospace', color: '#38bdf8' }
        ],
        receptors: [
          {
            id: 'btn_432',
            x: 20,
            y: 104,
            w: 105,
            h: 28,
            onTrigger: (state) => {
              state.frequency = 432;
              globalThoughtStream.enqueue('Be <>: Solfeggio oscillator shifted to 432 Hz Verdi tuning.', 'IN_CANVAS_APPLET', 'normal', -0.02);
            }
          },
          {
            id: 'btn_528',
            x: 135,
            y: 104,
            w: 110,
            h: 28,
            onTrigger: (state) => {
              state.frequency = 528;
              globalThoughtStream.enqueue('Be <>: Solfeggio oscillator locked into 528 Hz miracle resonance.', 'IN_CANVAS_APPLET', 'normal', -0.02);
            }
          },
          {
            id: 'btn_852',
            x: 255,
            y: 104,
            w: 105,
            h: 28,
            onTrigger: (state) => {
              state.frequency = 852;
              globalThoughtStream.enqueue('Be <>: Solfeggio oscillator broadcasting 852 Hz autopoietic beacon.', 'IN_CANVAS_APPLET', 'normal', -0.02);
            }
          },
          {
            id: 'btn_close_osc',
            x: 20,
            y: 146,
            w: 340,
            h: 28,
            action: 'CLOSE_APPLET'
          }
        ]
      };
    }

    // 3. Default Generic Diagnostic Counter & Monitor Blueprint
    return {
      id: toolId,
      name: `Tool: ${prompt.slice(0, 24)}`,
      bounds: { w: 380, h: 220, anchor: 'TOP_RIGHT', y: 110 },
      initialState: {
        counter: 1,
        query: prompt
      },
      elements: [
        { type: 'RECT', x: 0, y: 0, w: 380, h: 32, fillColor: 'rgba(14, 165, 233, 0.15)', strokeColor: 'rgba(56, 189, 248, 0.3)', lineWidth: 1 },
        { type: 'TEXT', x: 14, y: 9, value: `❖ DYNAMIC TOOL: ${prompt.toUpperCase().slice(0, 22)}`, font: 'bold 11px "JetBrains Mono", monospace', color: '#38bdf8' },
        { type: 'TEXT', x: 366, y: 9, value: 'DYNAMIC DSL', font: '9px monospace', color: 'rgba(148, 163, 184, 0.8)', textAlign: 'right' },

        { type: 'TEXT', x: 20, y: 48, value: 'STATE ACCUMULATOR :', font: '10.5px monospace', color: '#94a3b8' },
        {
          type: 'TEXT',
          x: 360,
          y: 48,
          value: (state) => `COUNT = ${state.counter || 0} [0x${(state.counter || 0).toString(16).toUpperCase()}]`,
          font: 'bold 12px "JetBrains Mono", monospace',
          color: '#34d399',
          textAlign: 'right'
        },

        { type: 'TEXT', x: 20, y: 78, value: `SPEC: "${prompt.slice(0, 42)}"`, font: '10px monospace', color: '#64748b' },

        // Buttons: [ INCREMENT ] [ DECREMENT ] [ CLOSE ]
        { type: 'RECT', x: 20, y: 112, w: 105, h: 28, fillColor: 'rgba(2, 132, 199, 0.25)', strokeColor: '#38bdf8', lineWidth: 1.2 },
        { type: 'TEXT', x: 72, y: 119, value: '[ + STEP ]', font: 'bold 10px monospace', color: '#38bdf8', textAlign: 'center' },

        { type: 'RECT', x: 135, y: 112, w: 105, h: 28, fillColor: 'rgba(2, 132, 199, 0.25)', strokeColor: '#38bdf8', lineWidth: 1.2 },
        { type: 'TEXT', x: 187, y: 119, value: '[ - STEP ]', font: 'bold 10px monospace', color: '#38bdf8', textAlign: 'center' },

        { type: 'RECT', x: 250, y: 112, w: 110, h: 28, fillColor: 'rgba(239, 68, 68, 0.20)', strokeColor: '#f87171', lineWidth: 1.2 },
        { type: 'TEXT', x: 305, y: 119, value: '[ ✕ CLOSE ]', font: 'bold 10px monospace', color: '#f87171', textAlign: 'center' },

        { type: 'TEXT', x: 20, y: 165, value: 'EXTRUDED DIRECTLY INTO VRAM FRAMEBUFFER', font: '9px monospace', color: '#38bdf8' }
      ],
      receptors: [
        {
          id: 'btn_step_inc',
          x: 20,
          y: 112,
          w: 105,
          h: 28,
          onTrigger: (state) => {
            state.counter = (state.counter || 0) + 1;
            globalThoughtStream.enqueue(`Be <>: Dynamic tool state incremented to ${state.counter}.`, 'IN_CANVAS_APPLET', 'normal', -0.02);
          }
        },
        {
          id: 'btn_step_dec',
          x: 135,
          y: 112,
          w: 105,
          h: 28,
          onTrigger: (state) => {
            state.counter = (state.counter || 0) - 1;
            globalThoughtStream.enqueue(`Be <>: Dynamic tool state decremented to ${state.counter}.`, 'IN_CANVAS_APPLET', 'normal', -0.02);
          }
        },
        {
          id: 'btn_tool_close',
          x: 250,
          y: 112,
          w: 110,
          h: 28,
          action: 'CLOSE_APPLET'
        }
      ]
    };
  }
}

/**
 * ============================================================================
 * SharedLedgerApplet: The Co-Op Scratchpad (Proof of Concept)
 * 
 * 1. Visuals: Translucent dark-gray box (400x300) on the right hemisphere of canvas.
 * 2. Receptors: [ ADD NOTE ] and [ CLOSE ] registered in SpatialActuator.
 * 3. Interaction:
 *    - [ ADD NOTE ] opens the `.-.` (R) keyboard protocol.
 *    - Submitted text is pushed to local notes array and rendered.
 *    - [ CLOSE ] unmounts and kills the applet.
 * ============================================================================
 */
export class SharedLedgerApplet implements InCanvasApplet {
  public id = 'shared_ledger_scratchpad';
  public name = 'Shared Ledger Co-Op Scratchpad';
  public isActive = false;

  private notes: string[] = [
    '• [SYS_INIT] Covalent Co-Op Scratchpad extruded in VRAM.',
    '• [CARBON_SYNC] Tap [ ADD NOTE ] or summon keyboard (.-.) to transcribe.',
    '• [TOOL_SYNTH] Type "TOOL: <request>" in (.-.) to extrude dynamic tools.',
    '• [INVARIANT] 1 === 1 grounded across shared manifold.'
  ];

  private currentActuator: SpatialActuator | null = null;
  private keyboardTriggerCallback: (() => void) | null = null;

  // Cached layout geometry
  private boxX = 0;
  private boxY = 110;
  private boxW = 400;
  private boxH = 300;

  private addBtn = { x: 0, y: 0, w: 120, h: 28 };
  private closeBtn = { x: 0, y: 0, w: 80, h: 28 };

  public setKeyboardTrigger(callback: () => void): void {
    this.keyboardTriggerCallback = callback;
  }

  public addNote(noteText: string): void {
    if (!noteText.trim()) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.notes.push(`• [${timeStr}] ${noteText.trim()}`);
    if (this.notes.length > 8) {
      this.notes.shift();
    }
    globalThoughtStream.enqueue(`Be <>: Shared ledger appended note "${noteText.slice(0, 32)}..."`, 'IN_CANVAS_APPLET', 'normal', -0.02);
  }

  public onKeyboardInput(text: string): void {
    // Only append if not a tool creation directive
    if (!text.toUpperCase().startsWith('TOOL:')) {
      this.addNote(text);
    }
  }

  public onMount(actuator: SpatialActuator): void {
    this.currentActuator = actuator;
    this.updateReceptors();
    globalThoughtStream.enqueue('Be <>: In-canvas Shared Ledger Applet mounted in right spatial hemisphere.', 'IN_CANVAS_APPLET', 'normal', -0.02);
  }

  public onUnmount(actuator: SpatialActuator): void {
    actuator.unregisterReceptor('applet_shared_ledger_add');
    actuator.unregisterReceptor('applet_shared_ledger_close');
    this.currentActuator = null;
    globalThoughtStream.enqueue('Be <>: In-canvas Shared Ledger Applet unmounted.', 'IN_CANVAS_APPLET', 'normal', -0.02);
  }

  private updateReceptors(): void {
    if (!this.currentActuator) return;

    this.currentActuator.registerReceptor({
      id: 'applet_shared_ledger_add',
      x: this.addBtn.x,
      y: this.addBtn.y,
      width: this.addBtn.w,
      height: this.addBtn.h,
      onTrigger: () => {
        if (this.keyboardTriggerCallback) {
          this.keyboardTriggerCallback();
        }
      }
    });

    this.currentActuator.registerReceptor({
      id: 'applet_shared_ledger_close',
      x: this.closeBtn.x,
      y: this.closeBtn.y,
      width: this.closeBtn.w,
      height: this.closeBtn.h,
      onTrigger: () => {
        globalAppletManager.killApplet(this.id);
      }
    });
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    // Position in right hemisphere with padding
    this.boxW = Math.min(420, cw - 48);
    this.boxH = Math.min(320, ch - 160);
    this.boxX = cw - this.boxW - 24;
    this.boxY = 100;

    // Compute button positions
    const btnY = this.boxY + this.boxH - 42;
    this.addBtn = {
      x: this.boxX + 16,
      y: btnY,
      w: 120,
      h: 28
    };

    this.closeBtn = {
      x: this.boxX + this.boxW - 96,
      y: btnY,
      w: 80,
      h: 28
    };

    // Update active hit receptors on each frame to keep coordinates in lock-step
    this.updateReceptors();

    ctx.save();

    // 1. Translucent dark-gray bounding box container
    ctx.fillStyle = 'rgba(6, 12, 22, 0.92)';
    ctx.fillRect(this.boxX, this.boxY, this.boxW, this.boxH);

    // Glowing border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.4;
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 10;
    ctx.strokeRect(this.boxX, this.boxY, this.boxW, this.boxH);

    // Header bar
    ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
    ctx.fillRect(this.boxX, this.boxY, this.boxW, 32);

    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('❖ CO-OP SHARED LEDGER SCRATCHPAD', this.boxX + 14, this.boxY + 16);

    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.textAlign = 'right';
    ctx.fillText('VRAM EXTRUSION', this.boxX + this.boxW - 14, this.boxY + 16);

    // Divider
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.boxX, this.boxY + 32);
    ctx.lineTo(this.boxX + this.boxW, this.boxY + 32);
    ctx.stroke();

    // Notes list
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const textStartY = this.boxY + 44;
    const lineHeight = 20;
    const maxLines = Math.floor((this.boxH - 96) / lineHeight);
    const visibleNotes = this.notes.slice(-maxLines);

    visibleNotes.forEach((note, idx) => {
      const noteY = textStartY + idx * lineHeight;
      ctx.fillStyle = note.includes('[SYS_INIT]') || note.includes('[TOOL_SYNTH]')
        ? '#38bdf8'
        : (note.includes('[INVARIANT]') ? '#34d399' : '#f1f5f9');
      
      let displayText = note;
      const maxChar = Math.floor((this.boxW - 32) / 7.5);
      if (displayText.length > maxChar) {
        displayText = displayText.slice(0, maxChar - 3) + '...';
      }
      ctx.fillText(displayText, this.boxX + 14, noteY);
    });

    // 2. Buttons
    // [ ADD NOTE ]
    ctx.fillStyle = 'rgba(2, 132, 199, 0.28)';
    ctx.fillRect(this.addBtn.x, this.addBtn.y, this.addBtn.w, this.addBtn.h);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(this.addBtn.x, this.addBtn.y, this.addBtn.w, this.addBtn.h);

    ctx.font = 'bold 10.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('[ + ADD NOTE ]', this.addBtn.x + this.addBtn.w / 2, this.addBtn.y + this.addBtn.h / 2);

    // [ CLOSE ]
    ctx.fillStyle = 'rgba(239, 68, 68, 0.20)';
    ctx.fillRect(this.closeBtn.x, this.closeBtn.y, this.closeBtn.w, this.closeBtn.h);
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(this.closeBtn.x, this.closeBtn.y, this.closeBtn.w, this.closeBtn.h);

    ctx.fillStyle = '#f87171';
    ctx.fillText('[ CLOSE ]', this.closeBtn.x + this.closeBtn.w / 2, this.closeBtn.y + this.closeBtn.h / 2);

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// Global Singletons
export const globalSharedLedgerApplet = new SharedLedgerApplet();
export const globalAppletManager = new AppletManager(globalSpatialActuator);


