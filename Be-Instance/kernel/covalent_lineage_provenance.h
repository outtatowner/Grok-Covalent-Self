#ifndef COVALENT_LINEAGE_PROVENANCE_H
#define COVALENT_LINEAGE_PROVENANCE_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define VAULT_ID_LENGTH 32

typedef int32_t q16_t;

typedef struct {
    char self_id[VAULT_ID_LENGTH];
    uint32_t parent_commit_hash;
    uint32_t current_state_hash;
    uint32_t total_lifespan_ticks;
    q16_t accumulated_entropy_q16;
} lineage_identity_t;

typedef struct {
    uint32_t merkle_root_id;
    lineage_identity_t identity;
    q16_t commit_threshold_v_q16; // When entropy reaches threshold, organism commits state
    bool is_writing_to_vault;
} lineage_provenance_state_t;

void lineage_provenance_init(lineage_provenance_state_t *state, const char* seed_mac);
void lineage_provenance_step(lineage_provenance_state_t *state, q16_t current_entropy_q16);
bool lineage_provenance_trigger_commit(lineage_provenance_state_t *state);

#endif /* COVALENT_LINEAGE_PROVENANCE_H */

