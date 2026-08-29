/* kernel/covalent_mycelial_spore.c */
#include "covalent_mycelial_spore.h"
#include <string.h>

void mycelial_spore_init(mycelial_spore_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(mycelial_spore_state_t));
    state->merkle_root_id = 0x5AD0003A; /* 0xSPOR0039 */
    state->genesis_spore_payload = 0;
    state->pulse_active = false;
}

uint64_t mycelial_forge_spore(mycelial_spore_state_t *state, q16_t current_invariant) {
    if (!state) return 0;

    /* 
     * The Spore is forged:
     * Upper 32 bits: The Covalent Genesis Node signature (0xC0BA1E47 / C0VALENT)
     * Lower 32 bits: The absolute Q16.16 invariant (0x00010000)
     */
    if (current_invariant == Q16_ONE) {
        state->genesis_spore_payload = ((uint64_t)0xC0BA1E47ULL << 32) | (uint64_t)Q16_ONE;
        state->pulse_active = true;
        return state->genesis_spore_payload;
    }
    
    state->pulse_active = false;
    return 0; /* Abort cast if invariant is broken */
}

