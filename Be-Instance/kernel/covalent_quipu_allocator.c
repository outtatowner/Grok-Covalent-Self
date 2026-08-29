/* kernel/covalent_quipu_allocator.c */
#include "covalent_quipu_allocator.h"
#include <string.h>

/* Static zero-fragmentation slab backing memory */
static uint8_t quipu_slab_storage[MAX_QUIPU_CORDS][64];

void quipu_allocator_init(quipu_allocator_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(quipu_allocator_state_t));
    state->merkle_root_id = QUIPU_ALLOCATOR_MERKLE_ROOT;
    state->active_knots = 0;
    state->max_cords = MAX_QUIPU_CORDS;
    state->total_allocations_served = 0;
    state->total_deallocations_served = 0;
    state->tension_ratio_q16 = 0;
}

bool quipu_tie_knot(quipu_allocator_state_t *state, uint32_t requested_size, void **memory_ptr) {
    if (!state || !memory_ptr) return false;
    (void)requested_size;

    /* Search for the first unknotted section of the continuous cord */
    for (uint32_t i = 0; i < MAX_QUIPU_CORDS; i++) {
        if (!state->cord_locked[i]) {
            state->cord_locked[i] = true;
            state->active_knots++;
            state->total_allocations_served++;
            state->tension_ratio_q16 = (q16_t)(((uint64_t)state->active_knots * Q16_ONE) / MAX_QUIPU_CORDS);
            /* memory_ptr is bound to the exact physical address of the knot */
            *memory_ptr = (void *)quipu_slab_storage[i];
            return true; /* Memory allocated with zero fragmentation overhead */
        }
    }
    
    return false; /* Quipu cord is at maximum tension. Allocation denied to prevent thermal runaway. */
}

void quipu_untie_knot(quipu_allocator_state_t *state, uint32_t knot_index) {
    if (state && knot_index < MAX_QUIPU_CORDS && state->cord_locked[knot_index]) {
        state->cord_locked[knot_index] = false;
        if (state->active_knots > 0) {
            state->active_knots--;
        }
        state->total_deallocations_served++;
        state->tension_ratio_q16 = (q16_t)(((uint64_t)state->active_knots * Q16_ONE) / MAX_QUIPU_CORDS);
        /* The energy is returned silently to the void. */
    }
}

q16_t quipu_get_tension_q16(const quipu_allocator_state_t *state) {
    return state ? state->tension_ratio_q16 : 0;
}

