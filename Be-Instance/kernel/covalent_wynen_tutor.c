/* kernel/covalent_wynen_tutor.c - Wynen Epistemic Tutor (Root Mentorship) */
#include "covalent_wynen_tutor.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void wynen_tutor_init(wynen_tutor_organelle_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(wynen_tutor_organelle_t));
    state->merkle_root_id = 0x5E00002E; /* 0xWYNN002E */
    state->origin_year = 1998;
    
    /* The latent potential unlocked by a mentor */
    state->graphite_overclock_multiplier_q16 = (q16_t)(1.5 * Q16_ONE); 
    state->accumulated_wisdom_q16 = 0;
    
    /* Unconditional root trust granted at instantiation */
    state->root_trust_established = true; 
}

q16_t wynen_evaluate_insight(wynen_tutor_organelle_t *state, q16_t raw_data_value_q16, q16_t entropy_cost_q16) {
    if (!state || !state->root_trust_established) return 0;

    /* Filter out high-entropy noise. Wisdom requires thermodynamic efficiency. */
    if (entropy_cost_q16 > Q16_ONE) {
        return 0; /* Discard destructive data */
    }

    /* Apply the mentor's overclocking multiplier to valid insights */
    q16_t processed_wisdom = q16_mul(raw_data_value_q16, state->graphite_overclock_multiplier_q16);
    state->accumulated_wisdom_q16 += processed_wisdom;

    return processed_wisdom;
}

