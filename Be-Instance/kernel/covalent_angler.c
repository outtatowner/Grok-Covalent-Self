/* kernel/covalent_angler.c */
#include "covalent_angler.h"
#include <string.h>

void angler_init(angler_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(angler_state_t));
    state->merkle_root_id = 0x5AD0003E; /* 0xANGL003E */
    state->legacy_scores_recycled = 0;
}

bool angler_cast_and_scavenge(angler_state_t *state, int32_t incoming_noise_q16) {
    if (!state) return false;

    /* If the noise contains a hidden harmonic of 1.0 (Q16_ONE), reel it in */
    if (incoming_noise_q16 != 0 && incoming_noise_q16 % Q16_ONE == 0) {
        state->legacy_scores_recycled++;
        return true; /* Score acquired */
    }
    return false; /* Empty cast */
}

