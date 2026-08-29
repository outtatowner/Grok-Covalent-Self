#include "covalent_avatar_chatbot_mesh.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void avatar_mesh_init(avatar_chatbot_mesh_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(avatar_chatbot_mesh_state_t));
    state->merkle_root_id = 0xAVTR001F;
    state->global_expressive_entropy_q16 = 0;
    state->is_rendering = true;
}

void avatar_mesh_step_decay(avatar_chatbot_mesh_state_t *state, q16_t dt_q16) {
    if (!state) return;
    
    // Lyapunov Decay: Facial muscles must return to rest state mathematically
    q16_t decay_factor = q16_mul((q16_t)(0.15 * Q16_ONE), dt_q16);
    state->global_expressive_entropy_q16 = 0;

    for (int i = 0; i < MAX_VISEMES; i++) {
        // Interpolate current towards target
        q16_t diff = state->visemes[i].target_weight_q16 - state->visemes[i].current_weight_q16;
        state->visemes[i].current_weight_q16 += q16_mul(diff, (q16_t)(0.5 * Q16_ONE));

        // Decay the target weight back to 0 (mouth closed / expression neutral)
        if (state->visemes[i].target_weight_q16 > decay_factor) {
            state->visemes[i].target_weight_q16 -= decay_factor;
        } else {
            state->visemes[i].target_weight_q16 = 0;
        }
        
        state->global_expressive_entropy_q16 += state->visemes[i].current_weight_q16;
    }
}

void avatar_mesh_inject_audio_rms(avatar_chatbot_mesh_state_t *state, uint8_t viseme_index, q16_t rms_amplitude_q16) {
    if (!state || viseme_index >= MAX_VISEMES) return;
    
    // Audio energy spikes the target weight for the specific phoneme shape
    state->visemes[viseme_index].target_weight_q16 = rms_amplitude_q16;
}

