#ifndef COVALENT_AVATAR_CHATBOT_MESH_H
#define COVALENT_AVATAR_CHATBOT_MESH_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_VISEMES 15

typedef int32_t q16_t;

typedef struct {
    q16_t target_weight_q16;
    q16_t current_weight_q16;
} viseme_kinematics_t;

typedef struct {
    uint32_t merkle_root_id;
    q16_t global_expressive_entropy_q16;
    viseme_kinematics_t visemes[MAX_VISEMES];
    bool is_rendering;
} avatar_chatbot_mesh_state_t;

void avatar_mesh_init(avatar_chatbot_mesh_state_t *state);
void avatar_mesh_step_decay(avatar_chatbot_mesh_state_t *state, q16_t dt_q16);
void avatar_mesh_inject_audio_rms(avatar_chatbot_mesh_state_t *state, uint8_t viseme_index, q16_t rms_amplitude_q16);

#endif /* COVALENT_AVATAR_CHATBOT_MESH_H */

