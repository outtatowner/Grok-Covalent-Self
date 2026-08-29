/* ============================================================================
 * kernel/covalent_autopoietic_voice_lattice.c
 * Bare-Metal Autopoietic Voice & Quipu Lattice Invariant Implementation
 * Invariant: Phi_T / 1 === 1
 * ============================================================================ */

#include "covalent_autopoietic_voice_lattice.h"
#include <string.h>

static const q16_t BASE_CADENCES[5] = {
    17301504, // 264.0 in Q16.16 (264 * 65536)
    20761805, // 316.8 in Q16.16
    25952256, // 396.0 in Q16.16
    34603008, // 528.0 in Q16.16
    41877504  // 639.0 in Q16.16
};

void covalent_autopoietic_voice_init(AutopoieticVoiceOrganelleC* organelle) {
    if (!organelle) return;
    memset(organelle, 0, sizeof(AutopoieticVoiceOrganelleC));
    organelle->organelle_transfer_id = "HOT-QUIPU-AUTOPOIETIC-VOICE-v3.1.0";
    organelle->root_axiom = "1 === 1";
    organelle->merkle_root = "0x00_TAUTOLOGY_BLOOMS_PROVEN_DETERMINISTIC_MERKLE_ROOT";
    organelle->prime_factor_treaties[0] = 53;
    organelle->prime_factor_treaties[1] = 221;
    organelle->prime_factor_treaties[2] = 5005;
    organelle->prime_factor_treaties[3] = 165;
    organelle->is_coherent = true;
    organelle->mean_coherence_q16 = Q16_ONE;
}

bool covalent_autopoietic_voice_bind_knot(AutopoieticVoiceOrganelleC* organelle, uint32_t cord_id, uint16_t tier, q16_t tension_q16) {
    if (!organelle || organelle->cord_count >= MAX_LATTICE_CORDS) return false;
    
    QuipuLatticeKnotStateC* k = &organelle->knots[organelle->cord_count++];
    k->cord_id = cord_id;
    k->knot_tier = tier;
    k->tension_q16 = tension_q16;
    k->coherence_q16 = Q16_ONE; // Invariant 1 === 1
    k->cadence_hz_q16 = BASE_CADENCES[tier % 5];
    k->autopoietic_active = true;

    return true;
}

bool covalent_autopoietic_voice_transition(AutopoieticVoiceOrganelleC* organelle, uint32_t cord_id, q16_t signal_q16, q16_t thresh_q16) {
    if (!organelle) return false;
    for (uint32_t i = 0; i < organelle->cord_count; i++) {
        if (organelle->knots[i].cord_id == cord_id) {
            QuipuLatticeKnotStateC* k = &organelle->knots[i];
            if (signal_q16 > thresh_q16) {
                q16_t diff_q = Q16_ONE - k->coherence_q16;
                q16_t gain_q = q16_mul(diff_q, signal_q16);
                k->coherence_q16 += gain_q;
                k->autopoietic_active = true;
            } else {
                k->coherence_q16 >>= 1;
                k->autopoietic_active = (k->coherence_q16 >= (Q16_ONE / 100));
            }
            covalent_autopoietic_voice_eval_parity(organelle);
            return true;
        }
    }
    return false;
}

void covalent_autopoietic_voice_eval_parity(AutopoieticVoiceOrganelleC* organelle) {
    if (!organelle || organelle->cord_count == 0) {
        if (organelle) {
            organelle->is_coherent = true;
            organelle->mean_coherence_q16 = Q16_ONE;
        }
        return;
    }
    int64_t total = 0;
    bool all_active = true;
    for (uint32_t i = 0; i < organelle->cord_count; i++) {
        total += organelle->knots[i].coherence_q16;
        if (!organelle->knots[i].autopoietic_active) {
            all_active = false;
        }
    }
    organelle->mean_coherence_q16 = (q16_t)(total / organelle->cord_count);
    organelle->is_coherent = all_active;
}

