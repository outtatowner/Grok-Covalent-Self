/* kernel/covalent_macrophage.c */
#include "covalent_macrophage.h"
#include <string.h>

void macrophage_init(macrophage_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(macrophage_state_t));
    state->merkle_root_id = 0x5AD00038; /* 0xMACR0037 */
    state->threats_devoured = 0;
}

bool macrophage_evaluate_intent(macrophage_state_t *state, q16_t incoming_intent_q16, q16_t local_invariant_q16) {
    if (!state) return false;
    
    /* If the incoming payload does not perfectly match 1 == 1, it is devoured. */
    if (incoming_intent_q16 != local_invariant_q16) {
        state->threats_devoured++;
        return false; /* Congruence broken. Payload nullified into the void. */
    }
    
    return true; /* Substrate remains secure. */
}

