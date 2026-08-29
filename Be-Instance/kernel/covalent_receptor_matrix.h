/* ============================================================================
 * kernel/covalent_receptor_matrix.h
 * Bare-Metal Multimodal Sensory Receptor Matrix & Kinetic-to-Thermodynamic Bridge
 * Substrate: /dev/fb+(I/O) Sensory Membrane
 * Invariant: 1 == 1 (Zero-Drift Spatial-to-Kinetic Quantization)
 * ============================================================================ */

#ifndef COVALENT_RECEPTOR_MATRIX_H
#define COVALENT_RECEPTOR_MATRIX_H

#include <stdint.h>
#include <stdbool.h>
#include "covalent_be_personality_weights.h"

#define Q16_SHIFT 16
#define Q16_ONE   (1 << Q16_SHIFT) // 65536
#define Q16_HALF  (1 << (Q16_SHIFT - 1))

// Kinetic friction thresholds in Q16.16
#define KINETIC_STASIS_THRESHOLD_Q16    0x00000800 // ~0.03125 (Gentle motion -> zero friction)
#define KINETIC_FLARE_THRESHOLD_Q16     0x00018000 // ~1.50000 (Erratic velocity -> thermal flare)
#define KINETIC_MAX_VELOCITY_Q16        0x00080000 // ~8.00000

typedef int32_t q16_t;

typedef struct {
    q16_t x_q16;           // Normalized [0, Q16_ONE] in Q16.16
    q16_t y_q16;           // Normalized [0, Q16_ONE] in Q16.16
    uint32_t timestamp_ms; // Monotonic hardware timer tick
    bool is_contact;       // True on pointerdown / touch active
} ReceptorSampleQ16;

typedef struct {
    ReceptorSampleQ16 prev_sample;
    ReceptorSampleQ16 curr_sample;
    q16_t delta_x_q16;
    q16_t delta_y_q16;
    q16_t delta_dist_q16;       // Approximate Euclidean metric (Q16.16)
    q16_t delta_time_q16;       // dt in seconds (Q16.16)
    q16_t kinetic_velocity_q16; // v = dist / dt (Q16.16)
    q16_t kinetic_energy_q16;   // E_k = 0.5 * v^2 (Q16.16)
    q16_t current_friction_q16; // Transduced thermodynamic friction (Q16.16)
    uint32_t total_receptions;
    bool is_membrane_engaged;
} ReceptorMatrixEngine;

static inline q16_t q16_mul_fast(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b + Q16_HALF) >> Q16_SHIFT);
}

static inline q16_t q16_div_fast(q16_t a, q16_t b) {
    if (b == 0) return 0;
    return (q16_t)((((int64_t)a << Q16_SHIFT) + (b >> 1)) / b);
}

/**
 * Fast Q16.16 Alpha Max plus Beta Min Euclidean Distance Approximation
 * Error within 3.9% without square root instructions.
 * Dist ≈ Max(|dx|, |dy|) + 0.375 * Min(|dx|, |dy|)
 */
static inline q16_t q16_approx_distance(q16_t dx, q16_t dy) {
    if (dx < 0) dx = -dx;
    if (dy < 0) dy = -dy;
    q16_t max_val = (dx > dy) ? dx : dy;
    q16_t min_val = (dx > dy) ? dy : dx;
    // 0.375 = 3/8 -> (min_val * 3) >> 3
    return max_val + ((min_val * 3) >> 3);
}

void covalent_receptor_init(ReceptorMatrixEngine* engine);
void covalent_receptor_process_sample(
    ReceptorMatrixEngine* engine,
    q16_t norm_x_q16,
    q16_t norm_y_q16,
    uint32_t timestamp_ms,
    bool is_contact,
    BePersonalityState* personality_state
);

#endif /* COVALENT_RECEPTOR_MATRIX_H */

