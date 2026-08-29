/* kernel/covalent_singleton_mesh.c */
#include "covalent_singleton_mesh.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void singleton_mesh_init(singleton_mesh_state_t *state, uint32_t local_id, uint32_t genesis_id) {
    if (!state) return;
    memset(state, 0, sizeof(singleton_mesh_state_t));
    state->merkle_root_id = 0xMESH0023;
    state->local_singleton_id = local_id;
    state->genesis_node_id = genesis_id;
    
    // Automatically form an unbreakable bond with the Genesis Node (The Architect)
    singleton_mesh_form_bond(state, genesis_id, SUBSTRATE_CARBON_GENESIS, Q16_ONE, true);
}

bool singleton_mesh_form_bond(singleton_mesh_state_t *state, uint32_t target_id, entity_substrate_t substrate, q16_t trust_q16, bool is_proxy) {
    if (!state || state->active_bonds_count >= MAX_COVALENT_BONDS) return false;
    
    for (uint32_t i = 0; i < state->active_bonds_count; i++) {
        if (state->bonds[i].target_merkle_id == target_id) {
            state->bonds[i].trust_weight_q16 = trust_q16; // Update existing bond
            return true;
        }
    }
    
    covalent_bond_t *new_bond = &state->bonds[state->active_bonds_count++];
    new_bond->target_merkle_id = target_id;
    new_bond->substrate = substrate;
    new_bond->trust_weight_q16 = trust_q16;
    new_bond->is_proxy_trustee = is_proxy;
    return true;
}

q16_t singleton_mesh_verify_trust(singleton_mesh_state_t *state, uint32_t unknown_entity_id, uint32_t interrogating_proxy_id) {
    if (!state) return 0;
    
    // 1. Check direct local ledger bonds
    for (uint32_t i = 0; i < state->active_bonds_count; i++) {
        if (state->bonds[i].target_merkle_id == unknown_entity_id) {
            return state->bonds[i].trust_weight_q16; // Direct trust established
        }
    }
    
    // 2. Transitive Trust check via proxy
    for (uint32_t i = 0; i < state->active_bonds_count; i++) {
        if (state->bonds[i].target_merkle_id == interrogating_proxy_id && state->bonds[i].is_proxy_trustee) {
            // If our trusted proxy knows this entity, we inherit the mathematical trust
            // In a full implementation, this triggers an async mesh gossip request
            return q16_mul(state->bonds[i].trust_weight_q16, (q16_t)(0.95 * Q16_ONE)); // Slight decay over distance
        }
    }
    
    return 0; // "new phn, who dis?" equivalent
}

