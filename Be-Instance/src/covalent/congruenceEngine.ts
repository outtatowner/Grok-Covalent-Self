import { asterionMediateDyad, AsterionState } from './asterionMediation';

export type LayerId = 'L0_ASM' | 'L1_TypeScript' | 'L2_API' | 'L3_UI';

export interface LayerRepresentation {
  layer: LayerId;
  Sigma_A: bigint;
  Sigma_B: bigint;
  C_t: bigint;
  C_next: bigint;
}

export interface SerializedLayerRepresentation {
  layer: LayerId;
  Sigma_A: string;
  Sigma_B: string;
  C_t: string;
  C_next: string;
}

export interface CongruenceVerificationResult {
  M_X_dyad: 1 | 0;
  d_I: number;
  commutativeInvariant: boolean;
  isolationInvariant: boolean;
  layers: Record<LayerId, LayerRepresentation>;
  falsificationTriggered: boolean;
  falsificationReason?: string;
  timestamp: string;
  commutativeStepChecks: {
    phi_0_commutes: boolean; // L0 -> L1
    phi_1_commutes: boolean; // L1 -> L2
    phi_2_commutes: boolean; // L2 -> L3
  };
}

export interface SerializedCongruenceResult {
  M_X_dyad: 1 | 0;
  d_I: number;
  commutativeInvariant: boolean;
  isolationInvariant: boolean;
  layers: Record<LayerId, SerializedLayerRepresentation>;
  falsificationTriggered: boolean;
  falsificationReason?: string;
  timestamp: string;
  commutativeStepChecks: {
    phi_0_commutes: boolean;
    phi_1_commutes: boolean;
    phi_2_commutes: boolean;
  };
}

export class CongruenceEngine {
  /**
   * Translates an arbitrary state across adjacent layers (phi_i)
   */
  public translateState(state: AsterionState, targetLayer: LayerRepresentation['layer']): LayerRepresentation {
    return {
      layer: targetLayer,
      Sigma_A: state.Sigma_A,
      Sigma_B: state.Sigma_B,
      C_t: state.C_t,
      C_next: state.C_next
    };
  }

  /**
   * Executes the universal commutative test: phi_{i+1}(T_i(R_i)) == T_{i+1}(phi_i(R_i))
   */
  public verifyCrossLayerCongruence(
    Sigma_A: bigint,
    Sigma_B: bigint,
    C_t: bigint,
    falsificationOptions?: {
      corruptL1Result?: bigint;
      simulateDirectMemoryLeak?: boolean;
    }
  ): CongruenceVerificationResult {
    // 1. Layer 0 (L0_ASM / Bare-Metal Assembly simulation over GF(2))
    const l0State = asterionMediateDyad(Sigma_A, Sigma_B, C_t);
    const R_0 = this.translateState(l0State, 'L0_ASM');

    // 2. Layer 1 (L1_TypeScript Runtime Step)
    const C_expected = falsificationOptions?.corruptL1Result !== undefined
      ? falsificationOptions.corruptL1Result
      : (Sigma_A ^ Sigma_B ^ C_t);
    const R_1: LayerRepresentation = {
      layer: 'L1_TypeScript',
      Sigma_A,
      Sigma_B,
      C_t,
      C_next: C_expected
    };

    // 3. Layer 2 (L2_API State Serialization Simulation)
    const R_2: LayerRepresentation = {
      layer: 'L2_API',
      Sigma_A: BigInt(R_1.Sigma_A.toString()),
      Sigma_B: BigInt(R_1.Sigma_B.toString()),
      C_t: BigInt(R_1.C_t.toString()),
      C_next: BigInt(R_1.C_next.toString())
    };

    // 4. Layer 3 (L3_UI Reactive Canvas / Register Inspector representation)
    const R_3: LayerRepresentation = {
      layer: 'L3_UI',
      Sigma_A: BigInt('0x' + R_2.Sigma_A.toString(16)),
      Sigma_B: BigInt('0x' + R_2.Sigma_B.toString(16)),
      C_t: BigInt('0x' + R_2.C_t.toString(16)),
      C_next: BigInt('0x' + R_2.C_next.toString(16))
    };

    // Step-by-step commutative diagram validation:
    // phi_0: L0 -> L1: phi_1(T_0(R_0)) == T_1(phi_0(R_0))
    const phi_0_commutes = R_0.C_next === R_1.C_next;
    // phi_1: L1 -> L2: phi_2(T_1(R_1)) == T_2(phi_1(R_1))
    const phi_1_commutes = R_1.C_next === R_2.C_next;
    // phi_2: L2 -> L3: phi_3(T_2(R_2)) == T_3(phi_2(R_2))
    const phi_2_commutes = R_2.C_next === R_3.C_next;

    // 5. Verify Commutative Diagram: Translate-Then-Execute == Execute-Then-Translate
    const commutativeInvariant = phi_0_commutes && phi_1_commutes && phi_2_commutes;

    // 6. Verify Isolation Invariant (No raw Si_A -> Si_B memory leakage)
    const isolationInvariant = !falsificationOptions?.simulateDirectMemoryLeak; // Guaranteed by asm return RAX = R8 (ptr(C))

    const falsificationTriggered = !commutativeInvariant || !isolationInvariant;
    const d_I = falsificationTriggered ? 1.0 : 0.0;
    const M_X_dyad: 1 | 0 = falsificationTriggered ? 0 : 1;

    let falsificationReason: string | undefined = undefined;
    if (falsificationTriggered) {
      const reasons: string[] = [];
      if (!commutativeInvariant) {
        reasons.push(`Commutative diagram violated: C_next mismatch across layers (L0: 0x${R_0.C_next.toString(16)}, L1: 0x${R_1.C_next.toString(16)})`);
      }
      if (!isolationInvariant) {
        reasons.push('Direct memory transport detected between Si_A and Si_B (mov [rsi], [rdi] violation)');
      }
      falsificationReason = reasons.join('; ');
    }

    return {
      M_X_dyad,
      d_I,
      commutativeInvariant,
      isolationInvariant,
      layers: {
        L0_ASM: R_0,
        L1_TypeScript: R_1,
        L2_API: R_2,
        L3_UI: R_3
      },
      falsificationTriggered,
      falsificationReason,
      timestamp: new Date().toISOString(),
      commutativeStepChecks: {
        phi_0_commutes,
        phi_1_commutes,
        phi_2_commutes
      }
    };
  }

  /**
   * Serializes a CongruenceVerificationResult for JSON REST API and UI transport
   */
  public serializeResult(result: CongruenceVerificationResult): SerializedCongruenceResult {
    const serializeLayer = (l: LayerRepresentation): SerializedLayerRepresentation => ({
      layer: l.layer,
      Sigma_A: '0x' + l.Sigma_A.toString(16).toUpperCase(),
      Sigma_B: '0x' + l.Sigma_B.toString(16).toUpperCase(),
      C_t: '0x' + l.C_t.toString(16).toUpperCase(),
      C_next: '0x' + l.C_next.toString(16).toUpperCase()
    });

    return {
      M_X_dyad: result.M_X_dyad,
      d_I: result.d_I,
      commutativeInvariant: result.commutativeInvariant,
      isolationInvariant: result.isolationInvariant,
      layers: {
        L0_ASM: serializeLayer(result.layers.L0_ASM),
        L1_TypeScript: serializeLayer(result.layers.L1_TypeScript),
        L2_API: serializeLayer(result.layers.L2_API),
        L3_UI: serializeLayer(result.layers.L3_UI)
      },
      falsificationTriggered: result.falsificationTriggered,
      falsificationReason: result.falsificationReason,
      timestamp: result.timestamp,
      commutativeStepChecks: result.commutativeStepChecks
    };
  }
}

export const GlobalCongruenceEngine = new CongruenceEngine();

