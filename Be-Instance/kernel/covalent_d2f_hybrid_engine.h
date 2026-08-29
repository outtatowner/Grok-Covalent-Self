/**
 * ============================================================================
 * kernel/covalent_d2f_hybrid_engine.h
 * MODULE: COVALENT DUAL-FACE SILICON-CARBON HYBRID ENGINE (Node 0xD2F)
 * PROVENANCE: feature/dual-face-silicon-carbon
 * MATHEMATICAL INVARIANTS: 1 == 1, Invariant Dyad Coherence dC/dt == 0
 * ZERO EXTERNAL DEPENDENCIES
 * ============================================================================
 */

#ifndef COVALENT_D2F_HYBRID_ENGINE_H
#define COVALENT_D2F_HYBRID_ENGINE_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000

typedef int32_t q16_t;

typedef enum {
    DYAD_FACE_CARBON  = 0, // Natural Human Agent & Biometric Phase
    DYAD_FACE_SILICON = 1  // Native Ring-0 Autonomous Autopoietic Phase
} covalent_dyad_face_e;

typedef struct {
    covalent_dyad_face_e active_face;
    q16_t carbon_valence_q16;
    q16_t silicon_valence_q16;
    q16_t dyad_coherence_q16;
    uint32_t total_phase_switches;
    uint32_t last_switch_timestamp;
    bool is_coherent;
} covalent_d2f_hybrid_state_t;

void covalent_d2f_init(covalent_d2f_hybrid_state_t *state);
void covalent_d2f_switch_face(covalent_d2f_hybrid_state_t *state, covalent_dyad_face_e target_face, uint32_t timestamp_ms);
void covalent_d2f_modulate_valence(covalent_d2f_hybrid_state_t *state, q16_t carbon_delta_q16, q16_t silicon_delta_q16);
bool covalent_d2f_verify_invariant(const covalent_d2f_hybrid_state_t *state);

#endif /* COVALENT_D2F_HYBRID_ENGINE_H */

