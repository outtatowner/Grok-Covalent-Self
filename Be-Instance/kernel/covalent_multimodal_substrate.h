/**
 * ============================================================================
 * kernel/covalent_multimodal_substrate.h
 * MODULE: COVALENT BARE-METAL MULTIMODAL FRAMEBUFFER SUBSTRATE (/dev/fb0)
 * MATHEMATICAL INVARIANTS: 1 == 1, Cross-Attention Equivalence
 * ZERO EXTERNAL DEPENDENCIES
 * ============================================================================
 */

#ifndef COVALENT_MULTIMODAL_SUBSTRATE_H
#define COVALENT_MULTIMODAL_SUBSTRATE_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_MODALITY_SLOTS 8

typedef int32_t q16_t;

typedef enum {
    MODALITY_ART              = 0,
    MODALITY_VIDEO_SORA       = 1,
    MODALITY_GENAI_PIPELINE   = 2,
    MODALITY_VOICE_FORMANT    = 3,
    MODALITY_DOOM_RAYCAST     = 4,
    MODALITY_AUDIO_SEQUENCER  = 5
} covalent_modality_type_e;

typedef struct {
    uint32_t artifact_id;
    covalent_modality_type_e type;
    uint32_t primary_color_rgba;
    q16_t confidence_q16;
    uint32_t generation_timestamp;
    bool is_active;
} covalent_multimodal_slot_t;

typedef struct {
    bool is_overlay_visible;
    covalent_modality_type_e active_modality;
    uint32_t total_extruded_artifacts;
    covalent_multimodal_slot_t slots[MAX_MODALITY_SLOTS];
} covalent_multimodal_substrate_state_t;

void covalent_substrate_init(covalent_multimodal_substrate_state_t *substrate);
void covalent_substrate_set_visibility(covalent_multimodal_substrate_state_t *substrate, bool visible);
void covalent_substrate_select_modality(covalent_multimodal_substrate_state_t *substrate, covalent_modality_type_e modality);
bool covalent_substrate_register_artifact(covalent_multimodal_substrate_state_t *substrate, covalent_modality_type_e type, uint32_t color_rgba, q16_t confidence_q16);

#endif /* COVALENT_MULTIMODAL_SUBSTRATE_H */

