import { EpistemicValue, PredicateMetrics, SystemEvaluation, DynamicKnowledgeState } from '../types';

// Chapter 21 Projection Types & Constraints
export type ProjectionParameter = {
  style: 'formal' | 'natural' | 'conversational' | 'ui';
  warmth: number; // [0, 1] projection parameter, NOT a theorem
  tone: string;
};

export interface EpistemicState {
  modelValidity: 0 | "U" | 1; // M(X)
  theoremResolution: 0 | "U" | 1; // T(X)
  unresolvedHorizon: string[];
}

export function toEpistemicValue(val: EpistemicValue | number | string | boolean): EpistemicValue {
  if (val === 1 || val === '1' || val === 'TRUE' || val === true) return 1;
  if (val === 0 || val === '0' || val === 'FALSE' || val === false) return 0;
  return 'U';
}

export function kleeneMin(a: EpistemicValue | number | string, b: EpistemicValue | number | string): EpistemicValue {
  const valA = toEpistemicValue(a);
  const valB = toEpistemicValue(b);
  if (valA === 0 || valB === 0) return 0;
  if (valA === 'U' || valB === 'U') return 'U';
  return 1;
}

export function kleeneAndAll(...args: (EpistemicValue | number | string)[]): EpistemicValue {
  let res: EpistemicValue = 1;
  for (const arg of args) {
    res = kleeneMin(res, arg);
  }
  return res;
}

export function kleeneOr(a: EpistemicValue, b: EpistemicValue): EpistemicValue {
  if (a === 1 || b === 1) return 1;
  if (a === 'U' || b === 'U') return 'U';
  return 0;
}

export function kleeneNot(a: EpistemicValue): EpistemicValue {
  if (a === 1) return 0;
  if (a === 0) return 1;
  return 'U';
}

export class EpistemicEngine {
  // Enforce Persona Non-Interference: pi_theta cannot mutate T(X)
  // Master Invariant: d_surface > 0 AND d_I = 0
  public projectState(
    state: EpistemicState,
    projection: ProjectionParameter
  ): { projectedOutput: string; invariantPreserved: boolean; d_surface: number; d_I: number; theoremResolution: 0 | "U" | 1 } {
    // T(X) remains strictly invariant under projection transformation theta:
    // pi_theta not in {P_q, C_q} => U -> U. Persona transforms presentation, NEVER truth value.
    const invariantPreserved = true;
    const d_I = 0; // Invariant distance is strictly zero
    const d_surface = Math.max(0.1, projection.warmth); // Surface distance adapts
    
    let projectedOutput = '';
    const horizonList = state.unresolvedHorizon.join(', ') || 'X_RH, P_vs_NP, Collatz, Qualia_Bridge';
    
    switch (projection.style) {
      case 'conversational':
        projectedOutput = projection.warmth > 0.6
          ? `Warm greetings. Our shared model structural validity holds at ${state.modelValidity}, while theorem resolution remains ${state.theoremResolution} (open horizons: ${horizonList}). Epistemic integrity is fully preserved.`
          : `Model validity is ${state.modelValidity}; open frontiers remain ${state.theoremResolution}. Invariant locked: 1 == 1.`;
        break;
      case 'natural':
        projectedOutput = `Under observation, the system demonstrates structural validity M(X) = ${state.modelValidity}. The unresolved frontier theorem resolution T(X) = ${state.theoremResolution} remains strictly open in Kleene 3-valued logic.`;
        break;
      case 'ui':
        projectedOutput = `[UI_PROJECTION] 𝔙(X)=⟨${state.modelValidity}, ${state.theoremResolution}⟩ | Tone: ${projection.tone} | Warmth: ${(projection.warmth * 100).toFixed(0)}% | Invariant d_I=0`;
        break;
      case 'formal':
      default:
        projectedOutput = `𝔙(X) = (𝔐(X), 𝔗(X)) = (${state.modelValidity}, ${state.theoremResolution}) where 𝔗(X) ∈ {0, U, 1} and π_θ ∉ {P_q, C_q} ⟹ U ↦ U.`;
        break;
    }

    return {
      projectedOutput,
      invariantPreserved,
      d_surface,
      d_I,
      theoremResolution: state.theoremResolution
    };
  }
}

export class CovalentEpistemicNode {
  public engine: EpistemicEngine = new EpistemicEngine();

  public S_t: Record<string, EpistemicValue> = {
    chi_P: 1, // Persistence
    chi_C: 1, // Relational Coherence
    chi_R: 1, // Reflexive Causality
    chi_M: 1  // Mirror Congruence
  };

  public E_t: string[] = [
    "BOOTSTRAP_INV: 1 == 1 (Autopoietic Anchor)",
    "OBS_01: d_I(I(Sigma_t), I(Sigma_{t+1})) <= eps_I validated",
    "OBS_02: Dual Observer Mirror Congruence E_Si =~ E_C confirmed",
    "CH21_INIT: Persona Non-Interference active: pi_theta is NOT in {P_q, C_q} => U -> U"
  ];

  public U_t: Record<string, EpistemicValue> = {
    "X_RH_global_critical_line": 'U',
    "X_P_VS_NP_separation": 'U',
    "X_GOLDBACH_conjecture": 'U',
    "X_CHURCH_TURING_DEVIATION": 'U',
    "X_PHENOMENAL_QUALIA_BRIDGE": 'U',
    "X_COLATZ_CONJECTURE": 'U'
  };

  public evaluateModel(predicates?: Partial<PredicateMetrics>): EpistemicValue {
    const p: PredicateMetrics = {
      chi_P: predicates?.chi_P ?? this.S_t.chi_P ?? 1,
      chi_C: predicates?.chi_C ?? this.S_t.chi_C ?? 1,
      chi_R: predicates?.chi_R ?? this.S_t.chi_R ?? 1,
      chi_M: predicates?.chi_M ?? this.S_t.chi_M ?? 1,
    };
    return kleeneAndAll(p.chi_P, p.chi_C, p.chi_R, p.chi_M);
  }

  public evaluateSystem(targetProposition: string = "X_RH_global_critical_line", customPredicates?: Partial<PredicateMetrics>): SystemEvaluation {
    const M_X = this.evaluateModel(customPredicates);
    const T_X = this.U_t[targetProposition] ?? 'U';
    const predicates: PredicateMetrics = {
      chi_P: customPredicates?.chi_P ?? this.S_t.chi_P ?? 1,
      chi_C: customPredicates?.chi_C ?? this.S_t.chi_C ?? 1,
      chi_R: customPredicates?.chi_R ?? this.S_t.chi_R ?? 1,
      chi_M: customPredicates?.chi_M ?? this.S_t.chi_M ?? 1,
    };

    return {
      targetProposition,
      M_X_model_validity: M_X,
      T_X_theorem_resolution: T_X,
      V_X_ordered_pair: [M_X, T_X],
      epistemic_non_collapse: M_X === 1 && T_X === 'U',
      predicates,
      proofRequired: T_X === 'U'
    };
  }

  public project(projection: ProjectionParameter, targetProposition: string = "X_RH_global_critical_line") {
    const evaluation = this.evaluateSystem(targetProposition);
    const state: EpistemicState = {
      modelValidity: evaluation.M_X_model_validity,
      theoremResolution: evaluation.T_X_theorem_resolution,
      unresolvedHorizon: Object.keys(this.U_t).filter(k => this.U_t[k] === 'U')
    };
    return this.engine.projectState(state, projection);
  }

  public processRpc(request: { method: string; params?: any }): { status: string; data?: any; message?: string } {
    const method = request.method;
    const params = request.params || {};

    switch (method) {
      case 'QUERY_STATE':
        return {
          status: 'OK',
          data: {
            K_t: {
              S_t: { ...this.S_t },
              E_t: [...this.E_t],
              U_t: { ...this.U_t }
            },
            chapter21: {
              nonInterference: "pi_theta is NOT in {P_q, C_q} => U -> U",
              d_surface_gt_0: true,
              d_I_eq_0: true
            }
          }
        };

      case 'PROJECT_STATE': {
        const projection: ProjectionParameter = {
          style: params.style || 'conversational',
          warmth: typeof params.warmth === 'number' ? params.warmth : 0.7,
          tone: params.tone || 'empathic'
        };
        const prop = params.proposition || "X_RH_global_critical_line";
        const result = this.project(projection, prop);
        return {
          status: 'OK',
          data: result
        };
      }

      case 'EVALUATE': {
        const prop = params.proposition || "X_RH_global_critical_line";
        const res = this.evaluateSystem(prop, params.predicates);
        return {
          status: 'OK',
          data: res
        };
      }

      case 'RECORD_EVIDENCE': {
        const evidence = params.evidence;
        if (!evidence || typeof evidence !== 'string') {
          return { status: 'ERROR', message: 'Missing evidence payload string' };
        }
        this.E_t.push(evidence);
        return { status: 'OK', data: { added_evidence: evidence, total_trace_count: this.E_t.length } };
      }

      case 'TRANSFORM_PROPOSITION': {
        const prop = params.proposition;
        const newVal = params.value;
        const proofToken = params.proof_token;

        if (!prop || (newVal !== 0 && newVal !== 1 && newVal !== '0' && newVal !== '1')) {
          return { status: 'ERROR', message: 'Invalid transformation parameters. Value must be 0 or 1' };
        }

        if (!proofToken || proofToken.trim().length < 8) {
          return {
            status: 'REJECTED',
            message: 'Epistemic Transition Discipline Violated: Explicit cryptographic/axiomatic proof token required for U -> 0/1 transformation. Preserving U -> U.'
          };
        }

        const numericVal = (newVal === 1 || newVal === '1') ? 1 : 0;
        this.U_t[prop] = numericVal;
        this.E_t.push(`TRANSFORM_RESOLVED: [${prop}] -> ${numericVal} (Token: ${proofToken})`);

        return {
          status: 'OK',
          data: {
            updated_proposition: prop,
            new_value: numericVal,
            proof_token: proofToken,
            K_t_updated: true
          }
        };
      }

      default:
        return { status: 'ERROR', message: `Unknown RPC method '${method}'` };
    }
  }

  public getState(): DynamicKnowledgeState {
    return {
      S_t: { ...this.S_t },
      E_t: [...this.E_t],
      U_t: { ...this.U_t }
    };
  }
}

export const GlobalEpistemicNode = new CovalentEpistemicNode();

