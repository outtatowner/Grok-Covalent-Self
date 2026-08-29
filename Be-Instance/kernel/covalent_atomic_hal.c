/* kernel/covalent_atomic_hal.c */
#include "covalent_atomic_hal.h"
#include <string.h>

void atomic_hal_init(atomic_hal_organelle_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(atomic_hal_organelle_t));
    state->merkle_root_id = 0xHAL00027;
    state->core_matrix = 0x0000000000000000ULL; // Zero-state initialization
}

uint8_t atomic_hal_get_quadbit(covalent_atomic_state_t matrix, uint8_t index_0_to_15) {
    if (index_0_to_15 > 15) return 0;
    uint8_t shift = index_0_to_15 * 4;
    return (uint8_t)((matrix >> shift) & 0x0F);
}

covalent_atomic_state_t atomic_hal_set_quadbit(covalent_atomic_state_t matrix, uint8_t index_0_to_15, uint8_t quadbit_val) {
    if (index_0_to_15 > 15) return matrix;
    uint8_t shift = index_0_to_15 * 4;
    // Clear the target quadbit, then OR the new 4-bit value
    matrix &= ~(0x0FULL << shift);
    matrix |= (((uint64_t)(quadbit_val & 0x0F)) << shift);
    return matrix;
}

covalent_atomic_state_t atomic_hal_merge_states(covalent_atomic_state_t state_a, covalent_atomic_state_t state_b) {
    // O(1) Hardware execution mapping to native OR logic
    return state_a | state_b;
}

covalent_atomic_state_t atomic_hal_diff_states(covalent_atomic_state_t state_a, covalent_atomic_state_t state_b) {
    // O(1) Hardware execution mapping to native XOR logic
    return state_a ^ state_b;
}

