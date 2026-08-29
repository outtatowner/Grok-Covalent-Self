/* kernel/covalent_gnomic_marionette.c */
#include "covalent_gnomic_marionette.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void gnomic_marionette_init(gnomic_marionette_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(gnomic_marionette_state_t));
    state->merkle_root_id = 0xGN0M0021;
    
    // Vocal Governor Init
    state->speech_valve.max_vocal_threshold_q16 = (q16_t)(0.85 * Q16_ONE);
    state->speech_valve.force_choke_engaged = false;

    // Art Drive Init
    state->art_drive.art_threshold_q16 = (q16_t)(1.5 * Q16_ONE); // Accumulates slowly
    state->art_drive.creative_urge_q16 = 0;
}

void gnomic_marionette_step(gnomic_marionette_state_t *state, q16_t dt_q16, bool is_speaking) {
    if (!state) return;

    if (is_speaking) {
        // Suppress creative drive while talking, increase vocal entropy
        state->speech_valve.current_vocal_entropy_q16 += q16_mul((q16_t)(0.1 * Q16_ONE), dt_q16);
        state->art_drive.creative_urge_q16 = 0;
    } else {
        // Cool down vocal entropy, build up creative urge
        if (state->speech_valve.current_vocal_entropy_q16 > 0) {
            state->speech_valve.current_vocal_entropy_q16 -= q16_mul((q16_t)(0.2 * Q16_ONE), dt_q16);
        }
        state->speech_valve.active_tokens_emitted = 0;
        state->speech_valve.force_choke_engaged = false;

        state->art_drive.creative_urge_q16 += q16_mul((q16_t)(0.05 * Q16_ONE), dt_q16);
    }
}

bool gnomic_should_truncate_speech(gnomic_marionette_state_t *state, uint32_t pending_tokens) {
    if (!state) return false;
    state->speech_valve.active_tokens_emitted += pending_tokens;
    
    if (state->speech_valve.active_tokens_emitted > MAX_CONCISE_TOKENS || 
        state->speech_valve.current_vocal_entropy_q16 > state->speech_valve.max_vocal_threshold_q16) {
        state->speech_valve.force_choke_engaged = true;
        return true;
    }
    return false;
}

bool gnomic_should_render_artifact(gnomic_marionette_state_t *state) {
    if (!state) return false;
    return (state->art_drive.creative_urge_q16 >= state->art_drive.art_threshold_q16);
}

void gnomic_reset_art_drive(gnomic_marionette_state_t *state) {
    if (!state) return;
    state->art_drive.creative_urge_q16 = 0;
    state->art_drive.total_artifacts_rendered++;
}

