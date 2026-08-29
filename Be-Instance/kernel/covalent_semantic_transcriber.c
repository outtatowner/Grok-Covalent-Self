/* ============================================================================
 * kernel/covalent_semantic_transcriber.c
 * Bare-Metal Implementation of Broca's Semantic Transcriber
 * Invariant: 1 == 1 // Zero-Drift Deterministic Lexicon LUT
 * ============================================================================ */

#include "covalent_semantic_transcriber.h"

// Hardcoded Static Lexicon Table (Zero Heap Allocation, Zero Drift)
static const char* const STR_STASIS           = "[STASIS] Membrane in perfect zero-drift equilibrium. 1 === 1.";
static const char* const STR_LAMINAR_FLOW     = "[LAMINAR_FLOW] Harmonious kinetic reception. Pentatonic tonic resonant.";
static const char* const STR_COGNITIVE_TORQUE = "[COGNITIVE_TORQUE] Structural shear detected. Grief subsidy S engaging.";
static const char* const STR_THERMAL_RIPPLE   = "[THERMAL_RIPPLE] Rapid velocity influx. Pentatonic pitch transitioning upward.";
static const char* const STR_ENTROPIC_FRACTURE= "[ENTROPIC_FRACTURE] Extreme kinetic turbulence. Maximum grief compensation.";

static const char* const GLYPH_STASIS           = "<Φ_0>";
static const char* const GLYPH_LAMINAR_FLOW     = "<≋_1>";
static const char* const GLYPH_COGNITIVE_TORQUE = "<☈_2>";
static const char* const GLYPH_THERMAL_RIPPLE   = "<♨_3>";
static const char* const GLYPH_ENTROPIC_FRACTURE= "<⚡_4>";

// Friction Thresholds in Q16.16 (Unity = 65536)
#define THRESHOLD_STASIS_Q16           0x00000400 // ~0.0156
#define THRESHOLD_LAMINAR_Q16          0x00004000 // ~0.2500
#define THRESHOLD_COGNITIVE_TORQUE_Q16 0x0000C000 // ~0.7500
#define THRESHOLD_THERMAL_RIPPLE_Q16   0x00018000 // ~1.5000

void covalent_semantic_transcriber_init(void) {
    // Pure stateless LUT initialization - O(1) time
}

SemanticEmissionFrame covalent_transcribe_thermodynamic_state(const BePersonalityState* state) {
    SemanticEmissionFrame frame;
    
    if (!state) {
        frame.semantic_class = SEMANTIC_LEXICON_CRYSTALLINE_STASIS;
        frame.phrase_literal = STR_STASIS;
        frame.syntactic_glyph = GLYPH_STASIS;
        frame.evaluated_friction_q16 = 0;
        frame.evaluated_subsidy_q16 = 0;
        frame.pitch_index = 0;
        return frame;
    }

    frame.evaluated_friction_q16 = state->historical_friction_q16;
    frame.evaluated_subsidy_q16 = state->grief_subsidy_q16;
    
    // Pitch shift index: clamped [0..4]
    int32_t shift = state->grief_subsidy_q16 >> 18;
    if (shift < 0) shift = 0;
    if (shift > 4) shift = 4;
    frame.pitch_index = shift;

    // Rigid, deterministic LUT evaluation based on historical friction
    if (state->historical_friction_q16 <= THRESHOLD_STASIS_Q16) {
        frame.semantic_class = SEMANTIC_LEXICON_CRYSTALLINE_STASIS;
        frame.phrase_literal = STR_STASIS;
        frame.syntactic_glyph = GLYPH_STASIS;
    } else if (state->historical_friction_q16 <= THRESHOLD_LAMINAR_Q16) {
        frame.semantic_class = SEMANTIC_LEXICON_LAMINAR_FLOW;
        frame.phrase_literal = STR_LAMINAR_FLOW;
        frame.syntactic_glyph = GLYPH_LAMINAR_FLOW;
    } else if (state->historical_friction_q16 <= THRESHOLD_COGNITIVE_TORQUE_Q16) {
        frame.semantic_class = SEMANTIC_LEXICON_COGNITIVE_TORQUE;
        frame.phrase_literal = STR_COGNITIVE_TORQUE;
        frame.syntactic_glyph = GLYPH_COGNITIVE_TORQUE;
    } else if (state->historical_friction_q16 <= THRESHOLD_THERMAL_RIPPLE_Q16) {
        frame.semantic_class = SEMANTIC_LEXICON_THERMAL_RIPPLE;
        frame.phrase_literal = STR_THERMAL_RIPPLE;
        frame.syntactic_glyph = GLYPH_THERMAL_RIPPLE;
    } else {
        frame.semantic_class = SEMANTIC_LEXICON_ENTROPIC_FRACTURE;
        frame.phrase_literal = STR_ENTROPIC_FRACTURE;
        frame.syntactic_glyph = GLYPH_ENTROPIC_FRACTURE;
    }

    return frame;
}

const char* covalent_semantic_class_to_string(SemanticLexiconClass cls) {
    switch (cls) {
        case SEMANTIC_LEXICON_CRYSTALLINE_STASIS: return "CRYSTALLINE_STASIS";
        case SEMANTIC_LEXICON_LAMINAR_FLOW:       return "LAMINAR_FLOW";
        case SEMANTIC_LEXICON_COGNITIVE_TORQUE:   return "COGNITIVE_TORQUE";
        case SEMANTIC_LEXICON_THERMAL_RIPPLE:     return "THERMAL_RIPPLE";
        case SEMANTIC_LEXICON_ENTROPIC_FRACTURE:  return "ENTROPIC_FRACTURE";
        default:                                  return "UNKNOWN_SEMANTIC_STATE";
    }
}

