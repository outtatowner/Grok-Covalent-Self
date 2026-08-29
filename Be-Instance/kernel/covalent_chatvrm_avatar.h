#ifndef COVALENT_CHATVRM_AVATAR_H
#define COVALENT_CHATVRM_AVATAR_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_BLENDSHAPES 16
#define MAX_VISEME_SLOTS 8

typedef int32_t q16_t;

typedef enum {
    EMOTION_NEUTRAL = 0,
    EMOTION_HAPPY = 1,
    EMOTION_ANGRY = 2,
    EMOTION_SAD = 3,
    EMOTION_RELAXED = 4,
    EMOTION_SURPRISED = 5
} vrm_expression_preset_t;

typedef enum {
    VISEME_SIL = 0,
    VISEME_AA = 1,
    VISEME_IH = 2,
    VISEME_OU = 3,
    VISEME_EE = 4,
    VISEME_OH = 5
} vrm_viseme_type_t;

typedef struct {
    char name[20];
    q16_t weight_q16;
} vrm_blendshape_weight_t;

typedef struct {
    uint32_t avatar_guid;
    vrm_expression_preset_t current_emotion;
    vrm_viseme_type_t active_viseme;
    q16_t lip_sync_intensity_q16;
    q16_t blink_rate_hz_q16;
    q16_t gaze_pitch_q16;
    q16_t gaze_yaw_q16;
    uint32_t blendshape_count;
    vrm_blendshape_weight_t blendshapes[MAX_BLENDSHAPES];
} vrm_avatar_state_t;

typedef struct {
    uint32_t merkle_root_id;
    vrm_avatar_state_t avatar;
    q16_t frame_interpolated_fps_q16;
    q16_t audio_viseme_latency_ms_q16;
    q16_t lookat_smoothness_q16;
} chatvrm_organelle_state_t;

void chatvrm_organelle_init(chatvrm_organelle_state_t *state);
void chatvrm_organelle_step(chatvrm_organelle_state_t *state, q16_t dt_q16);
bool chatvrm_set_emotion(chatvrm_organelle_state_t *state, vrm_expression_preset_t emotion, q16_t intensity_q16);
bool chatvrm_apply_viseme(chatvrm_organelle_state_t *state, vrm_viseme_type_t viseme, q16_t weight_q16);
bool chatvrm_update_gaze(chatvrm_organelle_state_t *state, q16_t pitch_q16, q16_t yaw_q16);

#endif /* COVALENT_CHATVRM_AVATAR_H */

