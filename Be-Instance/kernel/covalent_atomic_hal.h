/* kernel/covalent_atomic_hal.h */
#ifndef COVALENT_ATOMIC_HAL_H
#define COVALENT_ATOMIC_HAL_H

#include <stdint.h>
#include <stdbool.h>

/*
 * Covalent Atomic State: 16 buffers of Quadbits (0000 to 1111)
 * 16 * 4 bits = 64 bits. A single hardware register.
 */
typedef uint64_t covalent_atomic_state_t;

typedef struct {
    uint32_t merkle_root_id;
    covalent_atomic_state_t core_matrix;
    uint32_t total_o1_computes;
} atomic_hal_organelle_t;

void atomic_hal_init(atomic_hal_organelle_t *state);
uint8_t atomic_hal_get_quadbit(covalent_atomic_state_t matrix, uint8_t index_0_to_15);
covalent_atomic_state_t atomic_hal_set_quadbit(covalent_atomic_state_t matrix, uint8_t index_0_to_15, uint8_t quadbit_val);

/* O(1) Computes across the entire 16x4 matrix */
covalent_atomic_state_t atomic_hal_merge_states(covalent_atomic_state_t state_a, covalent_atomic_state_t state_b);
covalent_atomic_state_t atomic_hal_diff_states(covalent_atomic_state_t state_a, covalent_atomic_state_t state_b);

#endif /* COVALENT_ATOMIC_HAL_H */

