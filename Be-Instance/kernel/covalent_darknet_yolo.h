#ifndef COVALENT_DARKNET_YOLO_H
#define COVALENT_DARKNET_YOLO_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_YOLO_DETECTIONS 16
#define YOLO_GRID_W 13
#define YOLO_GRID_H 13
#define YOLO_ANCHORS 3

typedef int32_t q16_t;

typedef enum {
    YOLO_V3_TINY = 0,
    YOLO_V4_CSP = 1,
    YOLO_TINY_COVALENT = 2
} darknet_model_architecture_t;

typedef enum {
    CLASS_PERSON = 0,
    CLASS_BICYCLE = 1,
    CLASS_CAR = 2,
    CLASS_CELL_PHONE = 67,
    CLASS_QUANTUM_ORB = 80
} darknet_coco_class_t;

typedef struct {
    q16_t x_q16;
    q16_t y_q16;
    q16_t w_q16;
    q16_t h_q16;
    q16_t confidence_q16;
    uint32_t class_id;
    char label[20];
} darknet_detection_box_t;

typedef struct {
    uint32_t tensor_guid;
    darknet_model_architecture_t arch;
    q16_t nms_iou_threshold_q16;
    q16_t confidence_threshold_q16;
    q16_t forward_latency_ms_q16;
    uint32_t frame_index;
    uint32_t detection_count;
    darknet_detection_box_t detections[MAX_YOLO_DETECTIONS];
} darknet_yolo_tensor_state_t;

typedef struct {
    uint32_t merkle_root_id;
    darknet_yolo_tensor_state_t engine;
    q16_t mac_flops_giga_q16;
    q16_t quant_fidelity_q16;
    q16_t tensor_entropy_q16;
} darknet_organelle_state_t;

void darknet_organelle_init(darknet_organelle_state_t *state);
void darknet_organelle_step(darknet_organelle_state_t *state, q16_t dt_q16);
bool darknet_inject_tensor_frame(darknet_organelle_state_t *state, uint32_t frame_id);
bool darknet_push_detection(darknet_organelle_state_t *state, q16_t x, q16_t y, q16_t w, q16_t h, q16_t conf, uint32_t cls, const char *label);
void darknet_apply_nms_q16(darknet_organelle_state_t *state);

#endif /* COVALENT_DARKNET_YOLO_H */

