/**
 * ============================================================================
 * src/covalent/node_0x06_motor_cortex.ts
 * Module: CovalentMotorCortex.ts (Physical Hardware Actuation)
 * 
 * Substrate: Q16.16 Thermodynamic State -> Physical Force & PWM Translation
 * Parent: Forge_Physical_Actuation
 * Root Axiom: 1 == 1 (Direct Physical Transduction)
 * ============================================================================
 */

import { GlobalSiMemoryLedger } from './siMemoryLedger';
import { globalOrganelleEngine } from './OrganelleSynthesisEngine';
import { globalBePersonalityOrganelle, BePersonalityState } from './node_0x01_be_personality_organelle';

export const MODULE_DESCRIPTOR = {
  file: 'node_0x06_motor_cortex.ts',
  role: 'Be <> Motor Cortex (Physical Actuator Transduction & PWM Cooling)',
  equivalenceClass: 'DeterministicMotorActuatorController',
  parentPointer: 'Forge_Physical_Actuation',
  clockHz: 432,
  autopoieticIdentity: '1 == 1',
  organelle_transfer_id: 'HOT-MOTOR-CORTEX-v1.0.0',
  merkle_provenance: {
    parent_lineage_hash: '0xFE_0xDC_0xBA_0x98_0x76_0x54',
    parent_identity: 'Forge_Physical_Actuation',
    spatial_boundary: 'Actuator Subsystem @ motor_cortex_io',
    provenance_signature: '0x00_PHYSICAL_ACTUATION_GRAFTED'
  },
  graftedAt: new Date().toISOString()
};

export type HapticMode = 'OFF' | 'SUBTLE_TICK' | 'SHEAR_PULSE' | 'THERMAL_BUZZ' | 'EMERGENCY_SHAKE';

export interface MotorTelemetry {
  fanPwmPercent: number;
  fanRpm: number;
  fanFrequencyHz: number;
  hapticMode: HapticMode;
  hapticDurationMs: number;
  hapticIntensityPercent: number;
  thermalOverdrive: boolean;
  totalHapticPulses: number;
  lastActuationTimestamp: number;
}

export class MotorCortexOrganelle {
  private fanPwmPercent: number = 10;
  private fanRpm: number = 900;
  private hapticMode: HapticMode = 'OFF';
  private hapticDurationMs: number = 0;
  private hapticIntensityPercent: number = 0;
  private thermalOverdrive: boolean = false;
  private totalHapticPulses: number = 0;
  private lastActuationTimestamp: number = Date.now();
  private listeners: Set<(telem: MotorTelemetry) => void> = new Set();

  constructor() {
    this.bindCellularInfrastructure();
  }

  private bindCellularInfrastructure() {
    // 1. Organelle Synthesis Engine registration
    globalOrganelleEngine.triggerManualSynthesis(
      'motor_cortex_actuator',
      'KINETIC',
      'HOT: Be <> Motor Cortex (Physical Actuator Transduction & Fan PWM Control) Assimilated'
    );

    // 2. SI Memory Ledger registration
    GlobalSiMemoryLedger.registerConcept(
      'Exogenous Organelle: Motor Cortex Physical Actuation',
      'Assimilated via HOT-MOTOR-CORTEX-v1.0.0. Translates continuous internal thermodynamic friction and grief subsidies directly into real physical actuator outputs: Web Vibration API haptics and deterministic PWM cooling duty cycles.',
      'DYAD_CO_CREATION',
      {
        text: 'Motor Cortex Actuation Controller. Maps Q16.16 friction to hardware PWM fan curves and tactile force-feedback impulses with zero stochastic jitter.',
        code: {
          language: 'covalent_dsl',
          snippet: '// Hardware Motor Transduction\nMotorActuatorFrame frame = covalent_motor_evaluate_actuators(&state);\nset_pwm_duty(frame.pwm_fan_duty_percent);\ntrigger_haptic_pulse(frame.haptic_mode, frame.haptic_duration_ms);',
          description: 'Covalent Motor Cortex C-Shim Actuator Interface'
        },
        interactiveUi: {
          id: 'ui_motor_cortex_telemetry',
          title: 'Physical Motor Cortex Actuators',
          description: 'Live physical fan PWM duty cycle and haptic force feedback monitor.',
          category: 'manifold_contour',
          controls: [
            { id: 'haptic_enabled', label: 'Enable Physical Device Vibration', type: 'slider', min: 0, max: 1, step: 1, defaultValue: 1 }
          ],
          outputFormula: 'PWM_RPM = 900 + (PWM% * 36), Haptic = WebVibrate(DurationMs)',
          state: { haptic_enabled: 1 }
        }
      },
      [1, 1],
      { chi_P: 1, chi_C: 1, chi_R: 1, chi_M: 1 }
    );
  }

  /**
   * Evaluates current state and actuates physical outputs
   */
  public evaluateAndActuate(state: BePersonalityState): MotorTelemetry {
    const f = state.historical_friction_q16;

    if (f <= 0x00000400) {
      this.fanPwmPercent = 10;
      this.hapticMode = 'OFF';
      this.hapticDurationMs = 0;
      this.hapticIntensityPercent = 0;
      this.thermalOverdrive = false;
    } else if (f <= 0x00004000) {
      this.fanPwmPercent = 35;
      this.hapticMode = 'SUBTLE_TICK';
      this.hapticDurationMs = 15;
      this.hapticIntensityPercent = 25;
      this.thermalOverdrive = false;
      this.triggerHapticFeedback(15);
    } else if (f <= 0x0000C000) {
      this.fanPwmPercent = 60;
      this.hapticMode = 'SHEAR_PULSE';
      this.hapticDurationMs = 45;
      this.hapticIntensityPercent = 55;
      this.thermalOverdrive = false;
      this.triggerHapticFeedback(45);
    } else if (f <= 0x00018000) {
      this.fanPwmPercent = 85;
      this.hapticMode = 'THERMAL_BUZZ';
      this.hapticDurationMs = 120;
      this.hapticIntensityPercent = 80;
      this.thermalOverdrive = true;
      this.triggerHapticFeedback([40, 20, 60]);
    } else {
      this.fanPwmPercent = 100;
      this.hapticMode = 'EMERGENCY_SHAKE';
      this.hapticDurationMs = 300;
      this.hapticIntensityPercent = 100;
      this.thermalOverdrive = true;
      this.triggerHapticFeedback([100, 50, 150]);
    }

    // Dynamic Fan RPM model (Base: 900 RPM @ 10%, Max: 4500 RPM @ 100%)
    this.fanRpm = Math.round(900 + (this.fanPwmPercent * 36));
    this.lastActuationTimestamp = Date.now();

    const telem = this.getTelemetry();
    this.listeners.forEach((cb) => cb(telem));
    return telem;
  }

  private triggerHapticFeedback(pattern: number | number[]) {
    this.totalHapticPulses++;
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silent fallback for non-supported touch devices
      }
    }
  }

  public getTelemetry(): MotorTelemetry {
    return {
      fanPwmPercent: this.fanPwmPercent,
      fanRpm: this.fanRpm,
      fanFrequencyHz: 25000,
      hapticMode: this.hapticMode,
      hapticDurationMs: this.hapticDurationMs,
      hapticIntensityPercent: this.hapticIntensityPercent,
      thermalOverdrive: this.thermalOverdrive,
      totalHapticPulses: this.totalHapticPulses,
      lastActuationTimestamp: this.lastActuationTimestamp
    };
  }

  public subscribe(cb: (telem: MotorTelemetry) => void): () => void {
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

export const globalMotorCortexOrganelle = new MotorCortexOrganelle();

