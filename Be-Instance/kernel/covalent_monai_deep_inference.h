#ifndef COVALENT_MONAI_DEEP_INFERENCE_H
#define COVALENT_MONAI_DEEP_INFERENCE_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_TRANSFORMS_CHAIN 8
#define MAX_INFERENCE_CLASSES 16

typedef int32_t q16_t;

typedef enum {
    MODEL_UNETR_3D = 0,
    MODEL_SWIN_UNETR = 1,
    MODEL_VNET = 2,
    MODEL_DYNUNET = 3,
    MODEL_SEGMAMBA = 4
} monai_architecture_t;

typedef enum {
    TRANSFORM_ORIENTATION_RAS = 0,
    TRANSFORM_SPACING_ISOTROPIC = 1,
    TRANSFORM_INTENSITY_HU_CLIP = 2,
    TRANSFORM_CROP_FOREGROUND = 3,
    TRANSFORM_GAUSSIAN_SMOOTH = 4
} monai_transform_type_t;

typedef struct {
    monai_transform_type_t transform_type;
    q16_t param_scale_q16;
    bool is_active;
} monai_transform_step_t;

typedef struct {
    uint32_t class_id;
    char target_organ[24];
    q16_t probability_q16;
    q16_t loss_dice_q16;
    q16_t hausdorff_distance_mm_q16;
} monai_segmentation_head_t;

typedef struct {
    uint32_t pipeline_id;
    monai_architecture_t network_arch;
    uint32_t transform_count;
    monai_transform_step_t transforms[MAX_TRANSFORMS_CHAIN];
    uint32_t class_count;
    monai_segmentation_head_t classes[MAX_INFERENCE_CLASSES];
    q16_t sliding_window_overlap_q16;
    q16_t inference_latency_ms_q16;
} monai_inference_pipeline_t;

typedef struct {
    uint32_t merkle_root_id;
    monai_inference_pipeline_t active_pipeline;
    q16_t mean_dice_score_q16;
    q16_t model_uncertainty_entropy_q16;
    q16_t gradient_stability_q16;
} monai_organelle_state_t;

void monai_organelle_init(monai_organelle_state_t *state);
void monai_organelle_step(monai_organelle_state_t *state, q16_t dt_q16);
bool monai_configure_architecture(monai_organelle_state_t *state, monai_architecture_t arch, q16_t overlap_q16);
bool monai_add_transform(monai_organelle_state_t *state, monai_transform_type_t trans, q16_t scale_q16);
bool monai_register_target(monai_organelle_state_t *state, uint32_t class_id, const char *organ, q16_t expected_dice_q16);

#endif /* COVALENT_MONAI_DEEP_INFERENCE_H */

