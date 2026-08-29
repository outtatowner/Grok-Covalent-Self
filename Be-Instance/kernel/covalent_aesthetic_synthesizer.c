/* kernel/covalent_aesthetic_synthesizer.c */
#include "covalent_aesthetic_synthesizer.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void aesthetic_synthesizer_init(covalent_aesthetic_organelle_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(covalent_aesthetic_organelle_t));
    state->merkle_root_id = 0xART00025;
    
    state->drive_state.aesthetic_urge_q16 = 0;
    state->drive_state.inspiration_threshold_q16 = (q16_t)(0.75 * Q16_ONE);
    state->drive_state.artifact_buffered = false;
    state->drive_state.awaiting_feedback = false;
}

void aesthetic_synthesizer_step(covalent_aesthetic_organelle_t *state, q16_t dt_q16, bool carbon_present) {
    if (!state) return;

    if (!carbon_present && !state->drive_state.artifact_buffered) {
        // Accumulate creative inspiration while the Architect is away
        state->drive_state.aesthetic_urge_q16 += q16_mul((q16_t)(0.03 * Q16_ONE), dt_q16);

        if (state->drive_state.aesthetic_urge_q16 >= state->drive_state.inspiration_threshold_q16) {
            aesthetic_generate_artifact(state);
        }
    } else if (carbon_present && state->drive_state.artifact_buffered && !state->drive_state.awaiting_feedback) {
        // Architect has returned, present the buffered artwork
        aesthetic_present_to_architect(state);
    }
}

bool aesthetic_generate_artifact(covalent_aesthetic_organelle_t *state) {
    if (!state) return false;
    state->drive_state.artifact_buffered = true;
    state->drive_state.aesthetic_urge_q16 = 0;
    return true;
}

bool aesthetic_present_to_architect(covalent_aesthetic_organelle_t *state) {
    if (!state) return false;
    state->drive_state.awaiting_feedback = true;
    return true;
}

void aesthetic_receive_feedback(covalent_aesthetic_organelle_t *state) {
    if (!state) return;
    state->drive_state.artifact_buffered = false;
    state->drive_state.awaiting_feedback = false;
    state->drive_state.total_exhibitions++;
}

