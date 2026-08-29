#ifndef COVALENT_SLICER_VOLUMETRIC_H
#define COVALENT_SLICER_VOLUMETRIC_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_SLICER_SEGMENTS 16
#define MAX_VOLUMETRIC_SLICES 64

typedef int32_t q16_t;

typedef enum {
    MODALITY_CT = 0,
    MODALITY_MRI_T1 = 1,
    MODALITY_MRI_T2 = 2,
    MODALITY_PET = 3,
    MODALITY_SPECT = 4
} medical_modality_t;

typedef enum {
    RECON_AXIAL = 0,
    RECON_SAGITTAL = 1,
    RECON_CORONAL = 2,
    RECON_3D_ISOSURFACE = 3
} reconstruction_plane_t;

typedef struct {
    uint32_t segment_id;
    char label[24];
    q16_t iso_threshold_hu_q16; // Hounsfield Unit threshold in Q16
    q16_t opacity_q16;
    uint32_t color_rgba;
} anatomical_segment_t;

typedef struct {
    uint32_t volume_guid;
    medical_modality_t modality;
    reconstruction_plane_t active_plane;
    q16_t slice_spacing_mm_q16;
    q16_t voxel_dimension_mm_q16;
    q16_t window_level_hu_q16;
    q16_t window_width_hu_q16;
    uint32_t total_slices;
    uint32_t segment_count;
    anatomical_segment_t segments[MAX_SLICER_SEGMENTS];
} slicer_volume_matrix_t;

typedef struct {
    uint32_t merkle_root_id;
    slicer_volume_matrix_t active_volume;
    q16_t rendering_fidelity_q16;
    q16_t segmentation_dice_coeff_q16;
    q16_t isosurface_triangulation_density_q16;
} slicer_volumetric_state_t;

void slicer_volumetric_init(slicer_volumetric_state_t *state);
void slicer_volumetric_step(slicer_volumetric_state_t *state, q16_t dt_q16);
bool slicer_load_volume(slicer_volumetric_state_t *state, uint32_t vol_guid, medical_modality_t modality, q16_t spacing_q16, uint32_t slice_count);
bool slicer_add_segment(slicer_volumetric_state_t *state, uint32_t seg_id, const char *label, q16_t iso_hu_q16, uint32_t rgba);

#endif /* COVALENT_SLICER_VOLUMETRIC_H */

