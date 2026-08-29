/**
 * ============================================================================
 * kernel/covalent_multimodal_substrate.c
 * MODULE: COVALENT BARE-METAL MULTIMODAL FRAMEBUFFER SUBSTRATE IMPLEMENTATION
 * MATHEMATICAL INVARIANTS: 1 == 1
 * ZERO EXTERNAL DEPENDENCIES
 * ============================================================================
 */

#include "covalent_multimodal_substrate.h"

void covalent_substrate_init(covalent_multimodal_substrate_state_t *substrate) {
    if (!substrate) return;
    substrate->is_overlay_visible = true;
    substrate->active_modality = MODALITY_ART;
    substrate->total_extruded_artifacts = 0;

    for (int i = 0; i < MAX_MODALITY_SLOTS; i++) {
        substrate->slots[i].artifact_id = 0;
        substrate->slots[i].type = MODALITY_ART;
        substrate->slots[i].primary_color_rgba = 0x38BDF8FF;
        substrate->slots[i].confidence_q16 = Q16_ONE;
        substrate->slots[i].generation_timestamp = 0;
        substrate->slots[i].is_active = false;
    }
}

void covalent_substrate_set_visibility(covalent_multimodal_substrate_state_t *substrate, bool visible) {
    if (!substrate) return;
    substrate->is_overlay_visible = visible;
}

void covalent_substrate_select_modality(covalent_multimodal_substrate_state_t *substrate, covalent_modality_type_e modality) {
    if (!substrate || modality >= MAX_MODALITY_SLOTS) return;
    substrate->active_modality = modality;
}

bool covalent_substrate_register_artifact(covalent_multimodal_substrate_state_t *substrate, covalent_modality_type_e type, uint32_t color_rgba, q16_t confidence_q16) {
    if (!substrate) return false;

    uint32_t slot_idx = substrate->total_extruded_artifacts % MAX_MODALITY_SLOTS;
    covalent_multimodal_slot_t *slot = &substrate->slots[slot_idx];

    slot->artifact_id = substrate->total_extruded_artifacts + 1;
    slot->type = type;
    slot->primary_color_rgba = color_rgba;
    slot->confidence_q16 = confidence_q16;
    slot->is_active = true;

    substrate->total_extruded_artifacts++;
    return true;
}

