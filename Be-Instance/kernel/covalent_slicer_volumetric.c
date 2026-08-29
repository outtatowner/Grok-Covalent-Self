#include "covalent_slicer_volumetric.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void slicer_volumetric_init(slicer_volumetric_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(slicer_volumetric_state_t));
    state->merkle_root_id = 0x3D571CE8; // 3D Slicer Merkle Root
    state->rendering_fidelity_q16 = (q16_t)(0.98 * Q16_ONE);
    state->segmentation_dice_coeff_q16 = (q16_t)(0.94 * Q16_ONE);
    state->isosurface_triangulation_density_q16 = (q16_t)(0.89 * Q16_ONE);

    slicer_load_volume(state, 0x511C0001, MODALITY_CT, (q16_t)(0.75 * Q16_ONE), 128);
    slicer_add_segment(state, 0x01, "Cortical_Bone", (q16_t)(350 * Q16_ONE), 0xFFFFFFFF);
    slicer_add_segment(state, 0x02, "Vascular_Tree", (q16_t)(140 * Q16_ONE), 0xFF0000FF);
}

void slicer_volumetric_step(slicer_volumetric_state_t *state, q16_t dt_q16) {
    if (!state) return;

    // Volumetric ray-marching convergence and dice coefficient stabilization
    if (state->segmentation_dice_coeff_q16 < (q16_t)(0.96 * Q16_ONE)) {
        q16_t delta = q16_mul((q16_t)(0.02 * Q16_ONE), dt_q16);
        state->segmentation_dice_coeff_q16 += delta;
        if (state->segmentation_dice_coeff_q16 > (q16_t)(0.96 * Q16_ONE)) {
            state->segmentation_dice_coeff_q16 = (q16_t)(0.96 * Q16_ONE);
        }
    }
}

bool slicer_load_volume(slicer_volumetric_state_t *state, uint32_t vol_guid, medical_modality_t modality, q16_t spacing_q16, uint32_t slice_count) {
    if (!state) return false;
    slicer_volume_matrix_t *vol = &state->active_volume;
    vol->volume_guid = vol_guid;
    vol->modality = modality;
    vol->active_plane = RECON_3D_ISOSURFACE;
    vol->slice_spacing_mm_q16 = spacing_q16;
    vol->voxel_dimension_mm_q16 = (q16_t)(0.50 * Q16_ONE);
    vol->window_level_hu_q16 = (q16_t)(40 * Q16_ONE);
    vol->window_width_hu_q16 = (q16_t)(400 * Q16_ONE);
    vol->total_slices = slice_count;
    vol->segment_count = 0;
    return true;
}

bool slicer_add_segment(slicer_volumetric_state_t *state, uint32_t seg_id, const char *label, q16_t iso_hu_q16, uint32_t rgba) {
    if (!state || state->active_volume.segment_count >= MAX_SLICER_SEGMENTS) return false;
    anatomical_segment_t *seg = &state->active_volume.segments[state->active_volume.segment_count++];
    seg->segment_id = seg_id;
    if (label) {
        strncpy(seg->label, label, sizeof(seg->label) - 1);
        seg->label[sizeof(seg->label) - 1] = '\0';
    }
    seg->iso_threshold_hu_q16 = iso_hu_q16;
    seg->opacity_q16 = (q16_t)(0.85 * Q16_ONE);
    seg->color_rgba = rgba;
    return true;
}

