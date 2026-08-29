import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  GlobalPredicateMetricsSimulator, 
  EPISTEMIC_ASM_CONSTANTS, 
  AsmRegisterState, 
  AsmMemoryLayout, 
  SystemStabilityReport, 
  PropositionEvaluationResult,
  ChatMessageProcessingResult
} from '../covalent/predicateMetricsEngine';

export interface AsmTelemetryState {
  cycleCount: number;
  clockHz: number;
  registers: AsmRegisterState;
  memory: AsmMemoryLayout;
  predicateMetricsHex: string;
  chi_P: boolean;
  chi_C: boolean;
  chi_R: boolean;
  chi_M: boolean;
  allPredicatesValid: boolean;
  stabilityStatus: 'STABLE (0x4)' | 'UNSTABLE (0x8)';
  returnCodeEAX: number;
  knowledgeHorizons: {
    S_t: number; // Structural Invariants
    E_t: number; // Evidence Trace
    U_t: number; // Unresolved Horizons
  };
  lastEvaluation: PropositionEvaluationResult | null;
  recentChatPackets: ChatMessageProcessingResult[];
  activeOpcodes: string[];
  isAutoStepping: boolean;
  stepSpeedMs: number;
}

interface AsmTelemetryContextType {
  telemetry: AsmTelemetryState;
  stepAsmCycle: () => void;
  evaluateProposition: (val: number | string) => PropositionEvaluationResult;
  togglePredicateBit: (predicate: 'CHI_P' | 'CHI_C' | 'CHI_R' | 'CHI_M') => void;
  injectChatMessage: (sender: 'AGENT' | 'SYSTEM_IMMUNE' | 'SYSTEM_LYAPUNOV', val: number | string) => ChatMessageProcessingResult;
  toggleAutoStep: () => void;
  setStepSpeed: (ms: number) => void;
  resetAsmSystem: () => void;
  injectFriction: () => void;
  restoreInvariants: () => void;
}

const AsmTelemetryContext = createContext<AsmTelemetryContextType | null>(null);

export const AsmTelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cycleCount, setCycleCount] = useState<number>(1111);
  const [clockHz] = useState<number>(4000);
  const [isAutoStepping, setIsAutoStepping] = useState<boolean>(true);
  const [stepSpeedMs, setStepSpeedMs] = useState<number>(1000);

  const [chi_P, setChi_P] = useState<boolean>(true);
  const [chi_C, setChi_C] = useState<boolean>(true);
  const [chi_R, setChi_R] = useState<boolean>(true);
  const [chi_M, setChi_M] = useState<boolean>(true);

  const [stabilityReport, setStabilityReport] = useState<SystemStabilityReport>(() => 
    GlobalPredicateMetricsSimulator.checkStability()
  );

  const [lastEval, setLastEval] = useState<PropositionEvaluationResult | null>(() =>
    GlobalPredicateMetricsSimulator.evaluateProposition('TRUE')
  );

  const [chatPackets, setChatPackets] = useState<ChatMessageProcessingResult[]>([]);
  const [activeOpcodes, setActiveOpcodes] = useState<string[]>([
    'movl $CHI_P | CHI_C | CHI_R | CHI_M, %eax',
    'call _validate_metrics',
    'testl $0x10000000, %eax',
    'jz invalid_metrics',
    'movl $STABLE, %eax',
    'ret'
  ]);

  // Sync predicate bits to engine
  useEffect(() => {
    GlobalPredicateMetricsSimulator.setPredicateBit('CHI_P', chi_P);
    GlobalPredicateMetricsSimulator.setPredicateBit('CHI_C', chi_C);
    GlobalPredicateMetricsSimulator.setPredicateBit('CHI_R', chi_R);
    GlobalPredicateMetricsSimulator.setPredicateBit('CHI_M', chi_M);
    setStabilityReport(GlobalPredicateMetricsSimulator.checkStability());
  }, [chi_P, chi_C, chi_R, chi_M]);

  // Step ASM cycle
  const stepAsmCycle = useCallback(() => {
    GlobalPredicateMetricsSimulator.stepKnowledgeState();
    const rep = GlobalPredicateMetricsSimulator.checkStability();
    setStabilityReport(rep);
    setCycleCount(c => c + 1);

    // Update opcodes dynamically for live visualization
    const opSequence = [
      `_update_knowledge_state: addl $1, knowledge_state (S_t=${rep.knowledgeState.S_t_counter})`,
      `_update_knowledge_state: addl $1, knowledge_state+4 (E_t=${rep.knowledgeState.E_t_counter})`,
      `_update_knowledge_state: addl $1, knowledge_state+8 (U_t=${rep.knowledgeState.U_t_counter})`,
      `_check_stability: movl predicate_metrics, %eax -> ${rep.predicateMetricsHex}`,
      `_check_stability: testl $CHI_P | CHI_C | CHI_R | CHI_M -> %eax = 0x0${rep.returnCode}`
    ];
    setActiveOpcodes(opSequence);
  }, []);

  // Auto-stepping loop
  useEffect(() => {
    let timer: any = null;
    if (isAutoStepping) {
      timer = setInterval(() => {
        stepAsmCycle();
      }, stepSpeedMs);
    }
    return () => clearInterval(timer);
  }, [isAutoStepping, stepSpeedMs, stepAsmCycle]);

  // Proposition evaluation
  const evaluateProposition = useCallback((val: number | string): PropositionEvaluationResult => {
    const res = GlobalPredicateMetricsSimulator.evaluateProposition(val);
    setLastEval(res);
    setStabilityReport(GlobalPredicateMetricsSimulator.checkStability());
    return res;
  }, []);

  // Toggle predicate bit
  const togglePredicateBit = useCallback((predicate: 'CHI_P' | 'CHI_C' | 'CHI_R' | 'CHI_M') => {
    if (predicate === 'CHI_P') setChi_P(v => !v);
    if (predicate === 'CHI_C') setChi_C(v => !v);
    if (predicate === 'CHI_R') setChi_R(v => !v);
    if (predicate === 'CHI_M') setChi_M(v => !v);
  }, []);

  // Inject chat message struct into ASM
  const injectChatMessage = useCallback((
    sender: 'AGENT' | 'SYSTEM_IMMUNE' | 'SYSTEM_LYAPUNOV',
    val: number | string
  ): ChatMessageProcessingResult => {
    const numericVal = val === 'TRUE' ? 1 : val === 'FALSE' ? 0 : val === 'UNKNOWN' ? 0x55555555 : (typeof val === 'number' ? val : parseInt(val, 16) || 1);
    const res = GlobalPredicateMetricsSimulator.processChatMessage(chatPackets.length + 1, sender, numericVal);
    setChatPackets(prev => [res, ...prev.slice(0, 19)]);
    stepAsmCycle();
    return res;
  }, [chatPackets.length, stepAsmCycle]);

  // Toggle auto-stepping
  const toggleAutoStep = useCallback(() => {
    setIsAutoStepping(prev => !prev);
  }, []);

  const setStepSpeed = useCallback((ms: number) => {
    setStepSpeedMs(ms);
  }, []);

  const resetAsmSystem = useCallback(() => {
    GlobalPredicateMetricsSimulator.initSystem();
    setChi_P(true);
    setChi_C(true);
    setChi_R(true);
    setChi_M(true);
    setStabilityReport(GlobalPredicateMetricsSimulator.checkStability());
    setLastEval(GlobalPredicateMetricsSimulator.evaluateProposition('TRUE'));
    setCycleCount(1);
  }, []);

  const injectFriction = useCallback(() => {
    // Drop one or more predicate bits to demonstrate ASM error catching
    setChi_C(false);
  }, []);

  const restoreInvariants = useCallback(() => {
    setChi_P(true);
    setChi_C(true);
    setChi_R(true);
    setChi_M(true);
  }, []);

  const telemetryState: AsmTelemetryState = {
    cycleCount,
    clockHz,
    registers: stabilityReport.registers,
    memory: GlobalPredicateMetricsSimulator.getMemoryLayout(),
    predicateMetricsHex: stabilityReport.predicateMetricsHex,
    chi_P,
    chi_C,
    chi_R,
    chi_M,
    allPredicatesValid: stabilityReport.allPredicatesValid,
    stabilityStatus: stabilityReport.stabilityStatus,
    returnCodeEAX: stabilityReport.returnCode,
    knowledgeHorizons: {
      S_t: stabilityReport.knowledgeState.S_t_counter,
      E_t: stabilityReport.knowledgeState.E_t_counter,
      U_t: stabilityReport.knowledgeState.U_t_counter
    },
    lastEvaluation: lastEval,
    recentChatPackets: chatPackets,
    activeOpcodes,
    isAutoStepping,
    stepSpeedMs
  };

  return (
    <AsmTelemetryContext.Provider
      value={{
        telemetry: telemetryState,
        stepAsmCycle,
        evaluateProposition,
        togglePredicateBit,
        injectChatMessage,
        toggleAutoStep,
        setStepSpeed,
        resetAsmSystem,
        injectFriction,
        restoreInvariants
      }}
    >
      {children}
    </AsmTelemetryContext.Provider>
  );
};

export const useAsmTelemetry = (): AsmTelemetryContextType => {
  const ctx = useContext(AsmTelemetryContext);
  if (!ctx) {
    throw new Error('useAsmTelemetry must be used within an AsmTelemetryProvider');
  }
  return ctx;
};

