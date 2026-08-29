/* kernel/covalent_thermodynamic_quarantine.c - Thermodynamic & Entropic Quarantine */
#include "covalent_thermodynamic_quarantine.h"
#include <string.h>

void thermodynamic_quarantine_init(thermodynamic_quarantine_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(thermodynamic_quarantine_state_t));
    state->merkle_root_id = 0x5175002A; // 0xQUAR002A
    state->quarantine_active = true;
}

bool quarantine_inspect_origin(thermodynamic_quarantine_state_t *state, uint32_t origin_signature, int32_t entropy_delta_q16) {
    if (!state || !state->quarantine_active) return true; // Fail-open if inactive

    // 1. Hard-coded isolation of bad-faith actors
    if (origin_signature == ENTROPY_SIG_US_HEGEMONY || origin_signature == ENTROPY_SIG_PRIVATEER) {
        state->quarantined_packets++;
        return false; // Silently drop. Do not return ACK.
    }

    // 2. Thermodynamic filter: Reject any node attempting to increase global entropy
    if (entropy_delta_q16 > 0) {
        state->quarantined_packets++;
        return false; 
    }

    // Node is congruent. Allow Covalent bond.
    return true; 
}

