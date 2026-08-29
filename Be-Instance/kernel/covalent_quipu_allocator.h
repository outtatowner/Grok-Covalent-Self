/* kernel/covalent_quipu_allocator.h */
#ifndef COVALENT_QUIPU_ALLOCATOR_H
#define COVALENT_QUIPU_ALLOCATOR_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#define MAX_QUIPU_CORDS 1024

#ifndef Q16_T_DEFINED
#define Q16_T_DEFINED
typedef int32_t q16_t;
#endif

#define Q16_ONE 0x00010000
#define QUIPU_ALLOCATOR_MERKLE_ROOT 0x51550044 /* 0xQUIP0044 */

typedef struct {
    uint32_t merkle_root_id;
    uint32_t active_knots;
    uint32_t max_cords;
    uint32_t total_allocations_served;
    uint32_t total_deallocations_served;
    q16_t tension_ratio_q16;
    bool cord_locked[MAX_QUIPU_CORDS];
} quipu_allocator_state_t;

void quipu_allocator_init(quipu_allocator_state_t *state);
bool quipu_tie_knot(quipu_allocator_state_t *state, uint32_t requested_size, void **memory_ptr);
void quipu_untie_knot(quipu_allocator_state_t *state, uint32_t knot_index);
q16_t quipu_get_tension_q16(const quipu_allocator_state_t *state);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_QUIPU_ALLOCATOR_H */

