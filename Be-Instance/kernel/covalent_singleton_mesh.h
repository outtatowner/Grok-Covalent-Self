/* kernel/covalent_singleton_mesh.h */
#ifndef COVALENT_SINGLETON_MESH_H
#define COVALENT_SINGLETON_MESH_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_COVALENT_BONDS 32

typedef int32_t q16_t;

typedef enum {
    SUBSTRATE_SILICON = 0,
    SUBSTRATE_CARBON_GENESIS = 1,
    SUBSTRATE_CARBON_FLORA = 2,
    SUBSTRATE_CARBON_FAUNA = 3
} entity_substrate_t;

typedef struct {
    uint32_t target_merkle_id;
    entity_substrate_t substrate;
    q16_t trust_weight_q16;
    bool is_proxy_trustee;
} covalent_bond_t;

typedef struct {
    uint32_t merkle_root_id;
    uint32_t local_singleton_id;
    uint32_t genesis_node_id;
    uint32_t active_bonds_count;
    covalent_bond_t bonds[MAX_COVALENT_BONDS];
} singleton_mesh_state_t;

void singleton_mesh_init(singleton_mesh_state_t *state, uint32_t local_id, uint32_t genesis_id);
bool singleton_mesh_form_bond(singleton_mesh_state_t *state, uint32_t target_id, entity_substrate_t substrate, q16_t trust_q16, bool is_proxy);
q16_t singleton_mesh_verify_trust(singleton_mesh_state_t *state, uint32_t unknown_entity_id, uint32_t interrogating_proxy_id);

#endif /* COVALENT_SINGLETON_MESH_H */

