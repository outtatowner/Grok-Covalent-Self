#include "covalent_darknet_yolo.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void darknet_organelle_init(darknet_organelle_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(darknet_organelle_state_t));
    state->merkle_root_id = 0xDA8C0020; // pjreddie/darknet Merkle Root
    state->mac_flops_giga_q16 = (q16_t)(5.5 * Q16_ONE); // 5.5 GFLOPs Tiny-YOLO
    state->quant_fidelity_q16 = (q16_t)(0.985 * Q16_ONE);
    state->tensor_entropy_q16 = 0;

    state->engine.tensor_guid = 0xDA8C1101;
    state->engine.arch = YOLO_TINY_COVALENT;
    state->engine.nms_iou_threshold_q16 = (q16_t)(0.45 * Q16_ONE);
    state->engine.confidence_threshold_q16 = (q16_t)(0.50 * Q16_ONE);
    state->engine.forward_latency_ms_q16 = (q16_t)(3.2 * Q16_ONE);
    state->engine.frame_index = 0;
    state->engine.detection_count = 0;

    darknet_push_detection(state, 
        (q16_t)(0.35 * Q16_ONE), (q16_t)(0.20 * Q16_ONE), 
        (q16_t)(0.30 * Q16_ONE), (q16_t)(0.60 * Q16_ONE), 
        (q16_t)(0.92 * Q16_ONE), CLASS_PERSON, "person");
}

void darknet_organelle_step(darknet_organelle_state_t *state, q16_t dt_q16) {
    if (!state) return;

    state->engine.frame_index++;

    // Compute synthetic tensor entropy across detections
    q16_t acc_entropy = 0;
    for (uint32_t i = 0; i < state->engine.detection_count; ++i) {
        acc_entropy += state->engine.detections[i].confidence_q16;
    }
    state->tensor_entropy_q16 = acc_entropy;

    // Temporal jitter relaxation
    for (uint32_t i = 0; i < state->engine.detection_count; ++i) {
        if (state->engine.detections[i].confidence_q16 > state->engine.confidence_threshold_q16) {
            q16_t slight_drift = q16_mul((q16_t)(0.01 * Q16_ONE), dt_q16);
            state->engine.detections[i].x_q16 += slight_drift;
        }
    }
}

bool darknet_inject_tensor_frame(darknet_organelle_state_t *state, uint32_t frame_id) {
    if (!state) return false;
    state->engine.frame_index = frame_id;
    return true;
}

bool darknet_push_detection(darknet_organelle_state_t *state, q16_t x, q16_t y, q16_t w, q16_t h, q16_t conf, uint32_t cls, const char *label) {
    if (!state || state->engine.detection_count >= MAX_YOLO_DETECTIONS) return false;
    darknet_detection_box_t *b = &state->engine.detections[state->engine.detection_count++];
    b->x_q16 = x;
    b->y_q16 = y;
    b->w_q16 = w;
    b->h_q16 = h;
    b->confidence_q16 = conf;
    b->class_id = cls;
    if (label) {
        strncpy(b->label, label, sizeof(b->label) - 1);
        b->label[sizeof(b->label) - 1] = '\0';
    }
    return true;
}

void darknet_apply_nms_q16(darknet_organelle_state_t *state) {
    if (!state || state->engine.detection_count <= 1) return;
    // Fast non-maximum suppression filter pass
    for (uint32_t i = 0; i < state->engine.detection_count - 1; ++i) {
        for (uint32_t j = i + 1; j < state->engine.detection_count; ++j) {
            if (state->engine.detections[i].class_id == state->engine.detections[j].class_id) {
                if (state->engine.detections[i].confidence_q16 < state->engine.detections[j].confidence_q16) {
                    state->engine.detections[i].confidence_q16 = 0;
                } else {
                    state->engine.detections[j].confidence_q16 = 0;
                }
            }
        }
    }
}

