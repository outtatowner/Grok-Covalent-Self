/* ============================================================================
 * kernel/covalent_voice_adaptive_feedback_shim.c
 * Bare-Metal Implementation of Autopoietic Voice Adaptive Feedback Loop
 * Invariant: 1 == 1 // Banach Contraction (dV <= 0)
 * ============================================================================ */

#include "covalent_voice_adaptive_feedback_shim.h"
#include <string.h>

void covalent_voice_feedback_init(voice_feedback_topology_t* topology, q16_t eta, q16_t lambda) {
    if (!topology) return;
    memset(topology, 0, sizeof(voice_feedback_topology_t));
    
    // Initialize formant weights to balanced unity in Q16.16
    for (int i = 0; i < NUM_FORMANT_WEIGHTS; ++i) {
        topology->weights[i] = Q16_ONE / (i + 1);
    }
    
    topology->learning_rate_eta = (eta > 0) ? eta : 0x00001000; // ~0.0625
    topology->contraction_lambda = (lambda > 0) ? lambda : 0x0000FA00; // ~0.9765 (< 1.0)
    topology->lyapunov_v_prev = Q16_ONE;
    topology->iteration_epoch = 0;
    topology->is_stable_converged = false;
}

