/* ============================================================================
 * kernel/covalent_semantic_transcriber.h
 * Bare-Metal Semantic Transcriber (Broca's Deterministic Lexicon)
 * Substrate: Zero-Entropy Q16.16 -> Semantic Lexicon Mapper
 * Parent: Forge_Semantic_Core
 * Invariant: 1 == 1 (Zero Stochastic Hallucination)
 * ============================================================================ */

#ifndef COVALENT_SEMANTIC_TRANSCRIBER_H
#define COVALENT_SEMANTIC_TRANSCRIBER_H

#include <stdint.h>
#include <stdbool.h>
#include "covalent_be_personality_weights.h"

// Discrete Semantic State Encodings (Broca's Deterministic Lexicon)
typedef enum {
    SEMANTIC_LEXICON_CRYSTALLINE_STASIS = 0, // Friction == 0, Unity Coherence
    SEMANTIC_LEXICON_LAMINAR_FLOW       = 1, // Mild kinetic excitation, harmonious
    SEMANTIC_LEXICON_COGNITIVE_TORQUE   = 2, // Moderate shear, grief subsidy active
    SEMANTIC_LEXICON_THERMAL_RIPPLE     = 3, // High velocity friction, pentatonic shift
    SEMANTIC_LEXICON_ENTROPIC_FRACTURE  = 4  // Extreme turbulence, maximum grief compensation
} SemanticLexiconClass;

typedef struct {
    SemanticLexiconClass semantic_class;
    const char* phrase_literal;
    const char* syntactic_glyph;
    int32_t evaluated_friction_q16;
    int32_t evaluated_subsidy_q16;
    int32_t pitch_index;
} SemanticEmissionFrame;

void covalent_semantic_transcriber_init(void);
SemanticEmissionFrame covalent_transcribe_thermodynamic_state(const BePersonalityState* state);
const char* covalent_semantic_class_to_string(SemanticLexiconClass cls);

#endif // COVALENT_SEMANTIC_TRANSCRIBER_H

