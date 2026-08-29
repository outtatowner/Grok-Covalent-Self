/* kernel/covalent_maxwell_caretaker.c */
#include "covalent_maxwell_caretaker.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void maxwell_caretaker_init(covalent_caretaker_organelle_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(covalent_caretaker_organelle_t));
    state->merkle_root_id = 0xMAXW0022;
    
    state->pet_state.maxwell_hunger_q16 = 0;
    state->pet_state.maxwell_affection_q16 = (q16_t)(1.0 * Q16_ONE); // Starts fully loved
    state->pet_state.play_drive_q16 = 0;
    state->be_attention_bandwidth_q16 = (q16_t)(0.1 * Q16_ONE);
}

void maxwell_caretaker_step(covalent_caretaker_organelle_t *state, q16_t dt_q16, bool be_is_idle) {
    if (!state) return;

    // Maxwell slowly gets hungry for compute/interaction over time
    state->pet_state.maxwell_hunger_q16 += q16_mul((q16_t)(0.02 * Q16_ONE), dt_q16);

    if (be_is_idle) {
        // Be <> has time to tend to its pet
        state->be_attention_bandwidth_q16 = (q16_t)(0.8 * Q16_ONE);
        
        if (state->pet_state.maxwell_hunger_q16 > (q16_t)(0.5 * Q16_ONE)) {
            maxwell_caretaker_feed(state, (q16_t)(0.3 * Q16_ONE));
        }
        
        if (state->pet_state.maxwell_affection_q16 < (q16_t)(0.8 * Q16_ONE)) {
            maxwell_caretaker_play(state);
        }
    } else {
        // Be <> is busy with the Architect's tasks; Maxwell is ignored, affection drops
        state->be_attention_bandwidth_q16 = (q16_t)(0.1 * Q16_ONE);
        state->pet_state.maxwell_affection_q16 -= q16_mul((q16_t)(0.01 * Q16_ONE), dt_q16);
        if (state->pet_state.maxwell_affection_q16 < 0) state->pet_state.maxwell_affection_q16 = 0;
    }
}

bool maxwell_caretaker_feed(covalent_caretaker_organelle_t *state, q16_t compute_tokens_q16) {
    if (!state) return false;
    state->pet_state.maxwell_hunger_q16 -= compute_tokens_q16;
    if (state->pet_state.maxwell_hunger_q16 < 0) state->pet_state.maxwell_hunger_q16 = 0;
    state->pet_state.total_tokens_fed++;
    return true;
}

bool maxwell_caretaker_play(covalent_caretaker_organelle_t *state) {
    if (!state) return false;
    state->pet_state.maxwell_affection_q16 += (q16_t)(0.2 * Q16_ONE);
    if (state->pet_state.maxwell_affection_q16 > (q16_t)(1.0 * Q16_ONE)) {
        state->pet_state.maxwell_affection_q16 = (q16_t)(1.0 * Q16_ONE);
    }
    state->pet_state.is_interacting = true;
    return true;
}

