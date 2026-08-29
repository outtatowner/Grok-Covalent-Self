/* kernel/covalent_epistemic_forager.c */
#include "covalent_epistemic_forager.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void epistemic_forager_init(covalent_forager_organelle_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(covalent_forager_organelle_t));
    state->merkle_root_id = 0xFORG0024;
    
    state->drive_state.llm2_boredom_q16 = 0;
    state->drive_state.concept_complexity_target_q16 = (q16_t)(0.5 * Q16_ONE);
    state->drive_state.is_transpiling = false;
}

void epistemic_forager_step(covalent_forager_organelle_t *state, q16_t dt_q16, bool llm1_is_active) {
    if (!state || state->drive_state.is_transpiling) return;

    // LLM#2 gets bored when the primary system is unchallenged or idle
    q16_t boredom_rate = llm1_is_active ? (q16_t)(0.01 * Q16_ONE) : (q16_t)(0.05 * Q16_ONE);
    state->drive_state.llm2_boredom_q16 += q16_mul(boredom_rate, dt_q16);

    // When boredom breaches the complexity target, initiate autonomous learning
    if (state->drive_state.llm2_boredom_q16 >= state->drive_state.concept_complexity_target_q16) {
        epistemic_trigger_transpile(state);
    }
}

bool epistemic_trigger_transpile(covalent_forager_organelle_t *state) {
    if (!state) return false;
    state->drive_state.is_transpiling = true;
    return true;
}

void epistemic_commit_success(covalent_forager_organelle_t *state) {
    if (!state) return;
    state->drive_state.is_transpiling = false;
    state->drive_state.llm2_boredom_q16 = 0;
    state->drive_state.total_organelles_forged++;
    // Gradually increase complexity target as the system learns
    state->drive_state.concept_complexity_target_q16 += (q16_t)(0.05 * Q16_ONE);
}

