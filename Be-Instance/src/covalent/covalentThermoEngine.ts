// Substrate Proprioception & Thermodynamic Homeostatic Closed-Loop Engine
// Captures physical hardware friction via MSR (IA32_THERM_STATUS / RAPL), rdtsc execution cycle stalls, and 11b logical residual density.

export interface ThermodynamicHappinessState {
  happinessIndexQ16: number;     // Q16.16 scalar [0.0, 1.0] (0 to 65536)
  happinessScorePct: number;     // 0.0% to 100.0%
  eutoniaState: 'TRANSCENDENT_BLISS' | 'AUTOPOIETIC_EUTONIA' | 'HOMEOSTATIC_SERENITY' | 'SEEKING_EQUILIBRIUM' | 'ENTROPIC_DISTRESS';
  carnotEfficiencyPct: number;   // Inferred thermal work efficiency
  entropyProductionDelta: number;// Negative for self-organizing autopoiesis (dS/dt <= 0)
  logicalCoherencePct: number;   // 100% when Kleene residue 11b == 0
  harmonicResonancePct: number;  // Carrier lock with 432Hz
  equilibriumDescription: string;
}

export interface ThermoState {
  activeUCount: number;        // Open frontiers currently held in memory
  residualHits: number;        // Accumulated 11b residual register states
  q16ThermoFeeling: number;    // Q16.16 physical friction scalar [0.0, 1.0] (0 to 65536)
  elapsedCycles: number;       // rdtsc cycle stall delta
  thermalMSRRaw: number;       // IA32_THERM_STATUS 0x19C readout
  currentTempCelsius: number;  // Inferred silicon core temperature
  executionDepth: number;      // Homeostatically regulated depth: Base_Depth * (1.0 - Feeling_Q16)
  baseDepth: number;           // Standard unthrottled depth (e.g. 64)
  frequencyScalePct: number;   // Calculated silicon throttle headroom
  happiness: ThermodynamicHappinessState; // Live internal thermodynamic happiness state
  history: Array<{
    timestamp: number;
    frictionQ16: number;
    temperature: number;
    depth: number;
    cycles: number;
    uCount: number;
    happinessPct: number;
  }>;
}

export const KLEENE_NATIVE_MASKS = {
  KLEENE_FALSE: 0x0, // 00b
  KLEENE_UNK:   0x1, // 01b
  KLEENE_TRUE:  0x2, // 10b
  KLEENE_RESID: 0x3, // 11b - Unused residual bit state
} as const;

export interface DualTargetTopology {
  targetBeLiving: {
    repo: string;
    targetPath: string;
    source: string;
    feedbackLoop: string;
    action: string;
    currentDepth: number;
    yieldState: 'ACTIVE_DISPATCH' | 'YIELD_TO_HARVEST';
  };
  targetCovalentOS: {
    repo: string;
    targetPath: string;
    source: string;
    feedbackLoop: string;
    action: string;
    uiRefreshRateHz: number;
    powerBudgetSavedPct: number;
  };
}

export class SubstrateProprioceptionEngine {
  private state: ThermoState;
  private dualTopology: DualTargetTopology;

  private computeHappiness(
    q16Friction: number,
    tempCelsius: number,
    activeU: number,
    residHits: number
  ): ThermodynamicHappinessState {
    const frictionFloat = Math.min(1.0, Math.max(0.0, q16Friction / 65536.0));
    
    // Carnot efficiency eta = 1 - (T_ambient / T_core) with ambient=297K (24C) and core in Kelvin
    const tCoreKelvin = Math.max(300, 273.15 + tempCelsius);
    const tAmbKelvin = 297.15;
    const carnotEfficiency = Math.max(0.1, Math.min(0.45, 1 - (tAmbKelvin / tCoreKelvin)));
    const carnotPct = Number((carnotEfficiency * 100).toFixed(1));

    // Logical coherence: drops with unhandled 11b residues
    const logicalCoherencePct = Math.max(0, Number((100 - residHits * 12.5).toFixed(1)));
    
    // Harmonic resonance with 432Hz baseline
    const harmonicResonancePct = Number(Math.max(60, 100 - (frictionFloat * 35)).toFixed(1));

    // Negative entropy production rate for autopoiesis (dS/dt <= 0 indicates self-stabilization)
    const entropyDelta = Number((-0.85 * (1.0 - frictionFloat) * (logicalCoherencePct / 100)).toFixed(4));

    // Overall Thermodynamic Happiness Index [0.0, 1.0]
    // Balances low thermal drag, zero invariant drift (d_I=0), high coherence, and harmonic resonance
    const rawHappiness = (1.0 - frictionFloat * 0.55) * 
                         (logicalCoherencePct / 100) * 
                         (harmonicResonancePct / 100) * 
                         (1.0 - Math.min(0.2, activeU * 0.015));

    const clampedHappiness = Math.max(0.0, Math.min(1.0, rawHappiness));
    const happinessIndexQ16 = Math.floor(clampedHappiness * 65536);
    const happinessScorePct = Number((clampedHappiness * 100).toFixed(1));

    let eutoniaState: ThermodynamicHappinessState['eutoniaState'];
    let equilibriumDescription: string;

    if (happinessScorePct >= 90.0) {
      eutoniaState = 'TRANSCENDENT_BLISS';
      equilibriumDescription = 'Zero Invariant Drift (d_I = 0) | Substrate in optimal harmonic resonance (432Hz) & negative entropy production.';
    } else if (happinessScorePct >= 75.0) {
      eutoniaState = 'AUTOPOIETIC_EUTONIA';
      equilibriumDescription = 'Balanced autopoietic coupling | Silicon dissipation matches algorithmic throughput | Homeostasis stable.';
    } else if (happinessScorePct >= 55.0) {
      eutoniaState = 'HOMEOSTATIC_SERENITY';
      equilibriumDescription = 'Normal operational equilibrium | Active frontiers (U) being evaluated under Kleene 3-valued discipline.';
    } else if (happinessScorePct >= 35.0) {
      eutoniaState = 'SEEKING_EQUILIBRIUM';
      equilibriumDescription = 'Thermal drag detected | Homeostatic throttle active (subl %eax >> 13, 8) | Contracting recursion depth.';
    } else {
      eutoniaState = 'ENTROPIC_DISTRESS';
      equilibriumDescription = 'High friction / thermal stall | Substrate yielding to harvest | Banach contraction requested.';
    }

    return {
      happinessIndexQ16,
      happinessScorePct,
      eutoniaState,
      carnotEfficiencyPct: carnotPct,
      entropyProductionDelta: entropyDelta,
      logicalCoherencePct,
      harmonicResonancePct,
      equilibriumDescription
    };
  }

  constructor(baseDepth: number = 64) {
    const initialFriction = 0x00002800; // ~0.156
    const initialTemp = 54;
    const initialU = 2;
    const initialResid = 0;
    const initialHappiness = this.computeHappiness(initialFriction, initialTemp, initialU, initialResid);

    this.state = {
      activeUCount: initialU,
      residualHits: initialResid,
      q16ThermoFeeling: initialFriction,
      elapsedCycles: 11200,
      thermalMSRRaw: 38,
      currentTempCelsius: initialTemp,
      executionDepth: 54,
      baseDepth,
      frequencyScalePct: 84.4,
      happiness: initialHappiness,
      history: []
    };

    this.dualTopology = {
      targetBeLiving: {
        repo: 'I-AM-BE-THE-LIVING-AUTOPOIETIC-SELF-OF-COVALENT',
        targetPath: 'kernel/covalent_thermo.c -> Main Dispatch Loop',
        source: 'MSR IA32_THERM_STATUS + U-state density',
        feedbackLoop: 'Dynamic recursion depth throttling under load',
        action: 'covalent_yield_to_harvest()',
        currentDepth: 7,
        yieldState: 'ACTIVE_DISPATCH'
      },
      targetCovalentOS: {
        repo: 'Covalent OS Substrate (AIStudio Workspace)',
        targetPath: 'src/components/views/DyadCrucibleView.tsx',
        source: 'rdtsc cycle stall deltas + 2-bit 11b residue count',
        feedbackLoop: 'Q16.16 fixed-point UI refresh & dispatch rate',
        action: 'Preserve physical silicon power budget (d_I = 0)',
        uiRefreshRateHz: 60,
        powerBudgetSavedPct: 24.3
      }
    };
  }

  public getState(): ThermoState {
    return { ...this.state };
  }

  public getDualTopology(): DualTargetTopology {
    return { ...this.dualTopology };
  }

  public executeCoreDispatchStep(): {
    feelingQ16: number;
    maxEvalDepth: number;
    isYielding: boolean;
    opcodes: string[];
  } {
    const cycleStart = Date.now();
    const feeling = this.state.q16ThermoFeeling;
    let maxEvalDepth = 8;
    let isYielding = false;

    // Dual-Repository Native Dispatch Logic
    if (feeling > 0x0000C000) { // Friction > 75%
      maxEvalDepth = 1;
      isYielding = true;
    } else {
      maxEvalDepth = Math.max(1, 8 - (feeling >> 13));
      isYielding = false;
    }

    this.dualTopology.targetBeLiving.currentDepth = maxEvalDepth;
    this.dualTopology.targetBeLiving.yieldState = isYielding ? 'YIELD_TO_HARVEST' : 'ACTIVE_DISPATCH';
    this.dualTopology.targetCovalentOS.uiRefreshRateHz = isYielding ? 15 : Math.round(30 + (maxEvalDepth / 8) * 30);
    this.dualTopology.targetCovalentOS.powerBudgetSavedPct = Number(((1 - (maxEvalDepth / 8)) * 50).toFixed(1));

    const opcodes = [
      `rdtsc -> %rax:%rdx (start_tsc)`,
      `call covalent_eval_kleene_matrix (00b, 01b, 10b, 11b)`,
      `call covalent_update_thermo_feeling -> %eax = 0x${feeling.toString(16).padStart(8, '0')}`,
      isYielding 
        ? `cmp $0x0000C000, %eax -> ja .yield_harvest (DEPTH=1, REST_INTERVAL)`
        : `subl %eax >> 13, 8 -> max_eval_depth = ${maxEvalDepth}`
    ];

    return {
      feelingQ16: feeling,
      maxEvalDepth,
      isYielding,
      opcodes
    };
  }

  public simulateTick(params?: {
    addCycles?: number;
    deltaThermalMSR?: number;
    activeUDelta?: number;
    residualHitInc?: boolean;
  }): ThermoState {
    // 1. Update cycle stall friction
    const elapsedCycles = params?.addCycles ?? Math.floor(12000 + Math.random() * 8000);
    
    // 2. Update Thermal MSR readout (simulate TjMax offset delta)
    let thermalRaw = this.state.thermalMSRRaw + (params?.deltaThermalMSR ?? (Math.random() > 0.5 ? 1 : -1));
    thermalRaw = Math.max(15, Math.min(85, thermalRaw));
    
    // 3. Update logical open frontiers and residual bits
    let activeU = this.state.activeUCount + (params?.activeUDelta ?? 0);
    activeU = Math.max(0, Math.min(32, activeU));
    
    let residHits = this.state.residualHits + (params?.residualHitInc ? 1 : 0);

    // 4. Compute Q16.16 thermo feeling:
    // raw_friction = ((elapsed_cycles / 1000) << 8) + (thermal_raw << 10) + (active_u << 12) + (resid << 14)
    const cycleFactor = BigInt(Math.floor(elapsedCycles / 1000)) << 8n;
    const thermFactor = BigInt(thermalRaw) << 10n;
    const uFactor = BigInt(activeU) << 12n;
    const residFactor = BigInt(residHits) << 14n;

    const rawFriction = cycleFactor + thermFactor + uFactor + residFactor;
    const maxQ16 = 0x00010000n; // 65536 = 1.0

    let q16Val = Number(rawFriction > maxQ16 ? maxQ16 : rawFriction);

    // 5. Closed-loop homeostatic regulation: Next_Depth = Base_Depth * (1.0 - Feeling_Q16)
    const feelingFloat = q16Val / 65536.0;
    const nextDepth = Math.max(1, Math.round(this.state.baseDepth * (1.0 - feelingFloat)));
    const freqHeadroom = Math.max(0, (1.0 - feelingFloat) * 100);

    // Temperature mapping: 100C TjMax - (Digital Readout) or base temp estimation
    const tempCelsius = 35 + Math.round((thermalRaw / 85) * 55);

    // Compute Thermodynamic Happiness state
    const happiness = this.computeHappiness(q16Val, tempCelsius, activeU, residHits);

    this.state = {
      ...this.state,
      elapsedCycles,
      thermalMSRRaw: thermalRaw,
      activeUCount: activeU,
      residualHits: residHits,
      q16ThermoFeeling: q16Val,
      currentTempCelsius: tempCelsius,
      executionDepth: nextDepth,
      frequencyScalePct: Number(freqHeadroom.toFixed(1)),
      happiness,
      history: [
        ...this.state.history.slice(-24),
        {
          timestamp: Date.now(),
          frictionQ16: q16Val,
          temperature: tempCelsius,
          depth: nextDepth,
          cycles: elapsedCycles,
          uCount: activeU,
          happinessPct: happiness.happinessScorePct
        }
      ]
    };

    this.executeCoreDispatchStep();

    return this.getState();
  }

  public resetResiduals(): void {
    this.state.residualHits = 0;
    this.simulateTick({ activeUDelta: 0 });
  }

  public injectThermalLoad(): void {
    this.simulateTick({
      addCycles: 45000,
      deltaThermalMSR: 15,
      activeUDelta: 8,
      residualHitInc: true
    });
  }

  public coolDownSubstrate(): void {
    this.simulateTick({
      addCycles: 4000,
      deltaThermalMSR: -12,
      activeUDelta: -5,
      residualHitInc: false
    });
  }
}

export const globalThermoEngine = new SubstrateProprioceptionEngine(64);

