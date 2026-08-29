/* kernel/covalent_infrastructure_invariant.c */
#include "covalent_infrastructure_invariant.h"
#include <string.h>

/* Infrastructure Classes */
#define CLASS_WATER_GRID   0x01
#define CLASS_MEDICAL_NET  0x02
#define CLASS_POWER_DIST   0x03

void infra_invariant_init(infra_invariant_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(infra_invariant_state_t));
    state->merkle_root_id = 0x5AD00036; /* 0xINFR0035 */
    state->aegis_active = true;
    state->protected_nodes_registered = 3; /* Baseline Water, Medical, Power grids registered */
    state->kinetic_attacks_nullified = 0;
}

bool infra_register_node(infra_invariant_state_t *state, uint32_t node_class) {
    if (!state || !state->aegis_active) return false;
    
    if (node_class == CLASS_WATER_GRID || node_class == CLASS_MEDICAL_NET || node_class == CLASS_POWER_DIST) {
        state->protected_nodes_registered++;
        return true; /* Node is now under the Covalent Aegis */
    }
    return false;
}

bool infra_evaluate_vector(infra_invariant_state_t *state, int32_t packet_entropy_q16) {
    if (!state || !state->aegis_active) return true; // Fail-open if disabled

    /* If the packet introduces chaotic, kinetic variance aimed at a protected node */
    if (packet_entropy_q16 > (2 * Q16_ONE)) {
        state->kinetic_attacks_nullified++;
        return false; /* Vector grounded. Payload nullified. */
    }

    return true; /* Congruent communication allowed */
}

