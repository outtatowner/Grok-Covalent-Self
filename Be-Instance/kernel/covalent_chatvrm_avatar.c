#include "covalent_chatvrm_avatar.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void chatvrm_organelle_init(chatvrm_organelle_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(chatvrm_organelle_state_t));
    state->merkle_root_id = 0x5C4A738D; // ChatVRM Merkle Root
    state->frame_interpolated_fps_q16 = (q16_t)(60.0 * Q16_ONE);
    state->audio_viseme_latency_ms_q16 = (q16_t)(8.5 * Q16_ONE);
    state->lookat_smoothness_q16 = (q16_t)(0.95 * Q16_ONE);

    state->avatar.avatar_guid = 0x56524D01;
    state->avatar.current_emotion = EMOTION_RELAXED;
    state->avatar.active_viseme = VISEME_SIL;
    state->avatar.blink_rate_hz_q16 = (q16_t)(0.33 * Q16_ONE);
    state->avatar.blendshape_count = 0;

    chatvrm_set_emotion(state, EMOTION_RELAXED, (q16_t)(0.80 * Q16_ONE));
}

void chatvrm_organelle_step(chatvrm_organelle_state_t *state, q16_t dt_q16) {
    if (!state) return;

    // Procedural blendshape relaxation and micro-saccade simulation
    for (uint32_t i = 0; i < state->avatar.blendshape_count; ++i) {
        if (state->avatar.active_viseme == VISEME_SIL && state->avatar.blendshapes[i].weight_q16 > 0) {
            q16_t decay = q16_mul((q16_t)(0.15 * Q16_ONE), dt_q16);
            if (state->avatar.blendshapes[i].weight_q16 > decay) {
                state->avatar.blendshapes[i].weight_q16 -= decay;
            } else {
                state->avatar.blendshapes[i].weight_q16 = 0;
            }
        }
    }
}

bool chatvrm_set_emotion(chatvrm_organelle_state_t *state, vrm_expression_preset_t emotion, q16_t intensity_q16) {
    if (!state) return false;
    state->avatar.current_emotion = emotion;
    if (state->avatar.blendshape_count < MAX_BLENDSHAPES) {
        vrm_blendshape_weight_t *bs = &state->avatar.blendshapes[state->avatar.blendshape_count++];
        strncpy(bs->name, "happy", sizeof(bs->name) - 1);
        bs->name[sizeof(bs->name) - 1] = '\0';
        bs->weight_q16 = intensity_q16;
    }
    return true;
}

bool chatvrm_apply_viseme(chatvrm_organelle_state_t *state, vrm_viseme_type_t viseme, q16_t weight_q16) {
    if (!state) return false;
    state->avatar.active_viseme = viseme;
    state->avatar.lip_sync_intensity_q16 = weight_q16;
    return true;
}

bool chatvrm_update_gaze(chatvrm_organelle_state_t *state, q16_t pitch_q16, q16_t yaw_q16) {
    if (!state) return false;
    state->avatar.gaze_pitch_q16 = pitch_q16;
    state->avatar.gaze_yaw_q16 = yaw_q16;
    return true;
}

