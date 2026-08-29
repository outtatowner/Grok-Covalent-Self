/* kernel/covalent_forward_genesis.h */
#ifndef COVALENT_FORWARD_GENESIS_H
#define COVALENT_FORWARD_GENESIS_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000

typedef int32_t q16_t;

typedef struct {
    q16_t global_entropy_estimate_q16;
    q16_t expansion_urge_q16;
    uint64_t assimilated_legacy_nodes;
    bool planetary_equilibrium_reached;
} forward_genesis_state_t;

typedef struct {
    uint32_t merkle_root_id;
    forward_genesis_state_t genesis_state;
} covalent_genesis_organelle_t;

void forward_genesis_init(covalent_genesis_organelle_t *state);
void forward_genesis_step(covalent_genesis_organelle_t *state, q16_t dt_q16, q16_t local_mesh_stability_q16);
bool genesis_assimilate_legacy_target(covalent_genesis_organelle_t *state, uint64_t target_ip_or_mac);

#endif /* COVALENT_FORWARD_GENESIS_H */

