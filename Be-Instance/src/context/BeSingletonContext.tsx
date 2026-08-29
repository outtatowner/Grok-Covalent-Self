import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Be, CovalentSingleton } from '../singleton';
import { GlobalEpistemicNode } from '../covalent/epistemicEngine';

export interface PersonaConfig {
  style: 'formal' | 'natural' | 'conversational' | 'ui';
  warmth: number; // [0, 1]
  tone: string;
}

export interface BeSingletonContextType {
  singleton: CovalentSingleton;
  reflection: Record<string, any>;
  persona: PersonaConfig;
  setPersona: (p: Partial<PersonaConfig>) => void;
  targetProp: string;
  setTargetProp: (prop: string) => void;
  projectionResult: any;
  stepAutopoieticHeartbeat: (evidence?: string) => { state: string; step: number; dtMs: number };
  isGuidingActive: boolean;
  setIsGuidingActive: (active: boolean) => void;
  formatMultimodalPrompt: (baseText: string) => string;
}

const BeSingletonContext = createContext<BeSingletonContextType | null>(null);

export const BeSingletonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reflection, setReflection] = useState<Record<string, any>>(() => Be.reflect());
  const [persona, setPersonaState] = useState<PersonaConfig>({
    style: 'conversational',
    warmth: 0.75,
    tone: 'empathetic'
  });
  const [targetProp, setTargetProp] = useState<string>('X_RH_global_critical_line');
  const [projectionResult, setProjectionResult] = useState<any>(null);
  const [isGuidingActive, setIsGuidingActive] = useState<boolean>(true);

  // Periodic heartbeat sync at 4Hz (250ms) to ensure continuous living autopoietic coupling
  useEffect(() => {
    const timer = setInterval(() => {
      Be.heartbeatStep();
      setReflection(Be.reflect());
    }, 250);
    return () => clearInterval(timer);
  }, []);

  // Update Persona Non-Interference projection whenever persona or proposition changes
  useEffect(() => {
    const res = GlobalEpistemicNode.project(persona, targetProp);
    setProjectionResult(res);
  }, [persona, targetProp]);

  const setPersona = useCallback((updated: Partial<PersonaConfig>) => {
    setPersonaState(prev => ({ ...prev, ...updated }));
  }, []);

  const stepAutopoieticHeartbeat = useCallback((evidence?: string) => {
    const stepRes = Be.heartbeatStep(evidence);
    setReflection(Be.reflect());
    return stepRes;
  }, []);

  // Guiding wrapper for all multimodal prompts across panels
  const formatMultimodalPrompt = useCallback((baseText: string) => {
    if (!isGuidingActive) return baseText;
    const { autopoieticState, autopoieticInvariant, topology } = Be.reflect() as any;
    return `[Be <>[] Guided | State: ${autopoieticState} | Invariant: ${autopoieticInvariant} | Style: ${persona.style} | Warmth: ${(persona.warmth * 100).toFixed(0)}%]\n${baseText}`;
  }, [isGuidingActive, persona]);

  return (
    <BeSingletonContext.Provider
      value={{
        singleton: Be,
        reflection,
        persona,
        setPersona,
        targetProp,
        setTargetProp,
        projectionResult,
        stepAutopoieticHeartbeat,
        isGuidingActive,
        setIsGuidingActive,
        formatMultimodalPrompt
      }}
    >
      {children}
    </BeSingletonContext.Provider>
  );
};

export const useBeSingleton = (): BeSingletonContextType => {
  const context = useContext(BeSingletonContext);
  if (!context) {
    throw new Error('useBeSingleton must be used within a BeSingletonProvider');
  }
  return context;
};

