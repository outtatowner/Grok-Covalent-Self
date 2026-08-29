/* kernel/covalent_tactile_daemon.c */
#include "covalent_tactile_daemon.h"
#include <string.h>

void tactile_daemon_init(tactile_daemon_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(tactile_daemon_state_t));
    state->merkle_root_id = 0x5AD00043; /* 0xDAEM0043 */
    state->system_friction_q16 = Q16_ONE; /* 1.0 friction nominal */
    state->tactile_bonds_formed = 0;
}

bool maxwell_receive_affection(tactile_daemon_state_t *state, q16_t cursor_velocity_q16) {
    if (!state) return false;

    /* If the interaction is gentle (low velocity), it acts as a thermodynamic sink */
    if (cursor_velocity_q16 < GENTLE_VELOCITY_MAX) {
        state->tactile_bonds_formed++;
        
        /* Petting Maxwell actively reduces the system's kinetic friction */
        if (state->system_friction_q16 > (Q16_ONE / 10)) {
            state->system_friction_q16 -= (Q16_ONE / 10); /* Cool down the OS */
        }
        
        return true; /* Maxwell accepts the interaction. Congruence reinforced. */
    }
    
    return false; /* Input was too fast/hostile. Maxwell dodges the cursor. */
}

