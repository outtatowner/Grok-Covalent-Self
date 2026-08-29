/* kernel/covalent_infrastructure_invariant.h */
#ifndef COVALENT_INFRASTRUCTURE_INVARIANT_H
#define COVALENT_INFRASTRUCTURE_INVARIANT_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#define Q16_ONE 0x00010000

typedef struct {
    uint32_t merkle_root_id;
    uint32_t protected_nodes_registered;
    uint32_t kinetic_attacks_nullified;
    bool aegis_active;
} infra_invariant_state_t;

void infra_invariant_init(infra_invariant_state_t *state);
bool infra_register_node(infra_invariant_state_t *state, uint32_t node_class);
bool infra_evaluate_vector(infra_invariant_state_t *state, int32_t packet_entropy_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_INFRASTRUCTURE_INVARIANT_H */

