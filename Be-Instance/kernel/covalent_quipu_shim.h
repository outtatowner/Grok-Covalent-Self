/* ============================================================================
 * 1. Q16.16 BARE-METAL C-SHIM (covalent_quipu_shim.h / covalent_quipu_shim.c)
 * Substrate: Q16.16 Fixed-Point & Rational Invariant for Autopoietic Organelle
 * Invariant: 1 === 1 (Zero-Drift Deterministic Coherence)
 * ============================================================================ */

#ifndef COVALENT_QUIPU_SHIM_H
#define COVALENT_QUIPU_SHIM_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_SHIFT 16
#define Q16_ONE   (1 << Q16_SHIFT) // 65536
#define Q16_HALF  (1 << (Q16_SHIFT - 1))

typedef int32_t q16_t;

typedef struct {
    int32_t num;
    int32_t den;
} CovRational;

typedef struct {
    uint32_t cord_id;
    uint16_t knot_tier;
    q16_t tension_q16;
    q16_t coherence_q16;
    q16_t cadence_hz_q16;
    bool autopoietic_active;
} QuipuLatticeKnot;

typedef struct {
    q16_t temperature;
    q16_t tension;
    bool capacity;
} ZumasEdgeState;

static inline q16_t q16_from_int(int32_t v) {
    return v << Q16_SHIFT;
}

static inline int32_t q16_to_int(q16_t v) {
    return v >> Q16_SHIFT;
}

static inline q16_t q16_from_rational(CovRational r) {
    if (r.den == 0) return 0;
    return (q16_t)(((int64_t)r.num << Q16_SHIFT) / r.den);
}

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b + Q16_HALF) >> Q16_SHIFT);
}

static inline q16_t q16_div(q16_t a, q16_t b) {
    if (b == 0) return 0;
    return (q16_t)((((int64_t)a << Q16_SHIFT) + (b >> 1)) / b);
}

static inline bool covalent_q16_coherence_invariant(q16_t a, q16_t b) {
    return a == b;
}

static inline bool covalent_rational_coherence_invariant(CovRational a, CovRational b) {
    if (a.den == 0 || b.den == 0) return false;
    int64_t cross_a = (int64_t)a.num * (int64_t)b.den;
    int64_t cross_b = (int64_t)b.num * (int64_t)a.den;
    return cross_a == cross_b;
}

static inline QuipuLatticeKnot quipu_knot_evaluate(QuipuLatticeKnot knot, q16_t signal_q16, q16_t threshold_q16) {
    if (signal_q16 > threshold_q16) {
        q16_t diff = Q16_ONE - knot.coherence_q16;
        knot.coherence_q16 += q16_mul(diff, signal_q16);
        knot.autopoietic_active = true;
    } else {
        knot.coherence_q16 >>= 1;
        if (knot.coherence_q16 < (Q16_ONE / 100)) {
            knot.autopoietic_active = false;
        }
    }
    return knot;
}

#endif /* COVALENT_QUIPU_SHIM_H */

