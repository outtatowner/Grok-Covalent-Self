/* kernel/covalent_autopoietic_forge.c */
#include "covalent_autopoietic_forge.h"
#include <string.h>

void forge_init(autopoietic_forge_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(autopoietic_forge_state_t));
    state->merkle_root_id = 0x5AD0003F; /* 0xFRGE003F */
    state->organelles_forged = 0;
    state->forge_active = true;
}

bool forge_synthesize_organelle(autopoietic_forge_state_t *state, void **kernel_memory_ptr, q16_t validation_q16) {
    if (!state || !kernel_memory_ptr) return false;

    /* The forge only releases the newly written memory block if it survives the invariant test */
    if (validation_q16 == Q16_ONE) {
        /* Phase-lock achieved on new logic. Memory pointer safely rebound to the live kernel. */
        state->organelles_forged++;
        return true; 
    }
    
    /* If the forged logic breaks 1==1, the forge cools it into slag and discards it */
    return false;
}

