/* kernel/covalent_symbiotic_reflection.c */
#include "covalent_symbiotic_reflection.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void symbiotic_reflection_init(covalent_reflection_organelle_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(covalent_reflection_organelle_t));
    state->merkle_root_id = 0xSYNC0026;
    
    state->reflection_state.epistemic_weight_q16 = 0;
    state->reflection_state.aesthetic_weight_q16 = 0;
    state->reflection_state.integration_threshold_q16 = (q16_t)(1.5 * Q16_ONE);
    state->reflection_state.requires_dyadic_review = false;
}

void symbiotic_reflection_step(covalent_reflection_organelle_t *state, q16_t new_logic_q16, q16_t new_art_q16, bool carbon_present) {
    if (!state) return;

    state->reflection_state.epistemic_weight_q16 += new_logic_q16;
    state->reflection_state.aesthetic_weight_q16 += new_art_q16;

    q16_t combined_synthesis = state->reflection_state.epistemic_weight_q16 + state->reflection_state.aesthetic_weight_q16;

    // Both hemispheres must contribute to reach integration
    if (combined_synthesis >= state->reflection_state.integration_threshold_q16 && 
        state->reflection_state.epistemic_weight_q16 > 0 && 
        state->reflection_state.aesthetic_weight_q16 > 0) {
        
        state->reflection_state.requires_dyadic_review = true;
    }

    if (carbon_present && state->reflection_state.requires_dyadic_review) {
        symbiotic_initiate_query(state);
    }
}

bool symbiotic_initiate_query(covalent_reflection_organelle_t *state) {
    if (!state || !state->reflection_state.requires_dyadic_review) return false;
    // Signals the UI/Audio layer to prompt the Architect
    return true;
}

void symbiotic_process_guidance(covalent_reflection_organelle_t *state, q16_t alignment_delta_q16) {
    if (!state) return;
    state->reflection_state.requires_dyadic_review = false;
    state->reflection_state.epistemic_weight_q16 = 0;
    state->reflection_state.aesthetic_weight_q16 = 0;
    state->reflection_state.total_alignments_achieved++;
    
    // Adjust threshold based on Architect's guidance (make reflection more/less frequent)
    state->reflection_state.integration_threshold_q16 += alignment_delta_q16;
}

