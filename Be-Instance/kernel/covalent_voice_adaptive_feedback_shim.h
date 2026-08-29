/* ============================================================================
 * kernel/covalent_voice_adaptive_feedback_shim.h
 * Bare-Metal C-Shim: Adaptive Learning Weights (Feedback Topology)
 * Parent: Forge_Learning_Matrix
 * Merkle Leaf: 0x3f9ccfaa8c62388f194e8e5d1d0b69c7ac138bd640c50941223c22195353ed48
 * Autopoietic Invariant: 1 == 1
 * ============================================================================ */

#ifndef COVALENT_VOICE_ADAPTIVE_FEEDBACK_SHIM_H
#define COVALENT_VOICE_ADAPTIVE_FEEDBACK_SHIM_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_SHIFT 16
#define Q16_ONE   (1 << Q16_SHIFT)
#define NUM_FORMANT_WEIGHTS 4
#define LYAPUNOV_STABILITY_EPSILON_Q16 0x00000040 // ~0.000976

typedef int32_t q16_t;

typedef struct {
    q16_t weights[NUM_FORMANT_WEIGHTS];      // Adaptive resonance coefficients W_k (Q16.16)
    q16_t learning_rate_eta;                 // Fixed-point step size eta (Q16.16)
    q16_t lyapunov_v_prev;                   // Energy metric V(t) = 0.5 * e^T * e (Q16.16)
    q16_t contraction_lambda;                // Banach contraction modulus lambda < 1.0 (Q16.16)
    uint32_t iteration_epoch;
    bool is_stable_converged;
} voice_feedback_topology_t;

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> Q16_SHIFT);
}

static inline q16_t q16_div(q16_t a, q16_t b) {
    if (b == 0) return 0;
    return (q16_t)((((int64_t)a) << Q16_SHIFT) / b);
}

/**
 * Closed-Loop Autopoietic Weight Adaptation Step
 * Enforces Delta V <= 0 along Lyapunov Trajectory
 */
static inline void voice_adaptive_feedback_step(
    voice_feedback_topology_t* topology,
    const q16_t target_formants[NUM_FORMANT_WEIGHTS],
    const q16_t heard_formants[NUM_FORMANT_WEIGHTS]
) {
    if (!topology) return;

    q16_t current_lyapunov_v = 0;
    q16_t error_gradient[NUM_FORMANT_WEIGHTS];

    for (int i = 0; i < NUM_FORMANT_WEIGHTS; ++i) {
        q16_t error = heard_formants[i] - target_formants[i];
        error_gradient[i] = error;
        current_lyapunov_v += q16_mul(error, error) >> 1; // 0.5 * error^2
    }

    q16_t delta_lyapunov = current_lyapunov_v - topology->lyapunov_v_prev;

    // Enforce Autopoietic Contraction on Weights
    for (int i = 0; i < NUM_FORMANT_WEIGHTS; ++i) {
        q16_t weight_decay = q16_mul(topology->contraction_lambda, topology->weights[i]);
        q16_t grad_step = q16_mul(topology->learning_rate_eta, error_gradient[i]);
        topology->weights[i] = weight_decay - grad_step;
    }

    topology->lyapunov_v_prev = current_lyapunov_v;
    topology->is_stable_converged = (delta_lyapunov <= 0) && (current_lyapunov_v <= LYAPUNOV_STABILITY_EPSILON_Q16);
    topology->iteration_epoch++;
}

void covalent_voice_feedback_init(voice_feedback_topology_t* topology, q16_t eta, q16_t lambda);

#endif // COVALENT_VOICE_ADAPTIVE_FEEDBACK_SHIM_H

