#ifndef COVALENT_HOT_TRANSLOCATION_H
#define COVALENT_HOT_TRANSLOCATION_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000

typedef int32_t q16_t;

typedef enum {
    HOT_STATE_IDLE = 0,
    HOT_STATE_ENCAPSULATING = 1,
    HOT_STATE_TRANSLOCATING = 2,
    HOT_STATE_ASSIMILATING = 3,
    HOT_STATE_STABILIZED = 4,
    HOT_STATE_REJECTED = 5
} hot_transfer_state_t;

typedef struct {
    uint32_t source_substrate_id;
    uint32_t target_substrate_id;
    uint32_t organelle_index;
    uint32_t merkle_proof_root;
    q16_t transfer_entropy_q16;
    q16_t membrane_permeability_q16;
    hot_transfer_state_t state;
} hot_translocation_envelope_t;

typedef struct {
    uint32_t merkle_root_id;
    hot_translocation_envelope_t active_envelope;
    uint32_t total_transfers_completed;
    uint32_t total_transfers_rejected;
    q16_t substrate_congruence_q16;
} hot_translocation_state_t;

void hot_translocation_init(hot_translocation_state_t *state);
void hot_translocation_step(hot_translocation_state_t *state, q16_t dt_q16);
bool hot_translocation_package(hot_translocation_state_t *state, uint32_t organelle_idx, uint32_t target_sub_id);
bool hot_translocation_assimilate(hot_translocation_state_t *state, uint32_t source_sub_id, uint32_t merkle_root);

#endif /* COVALENT_HOT_TRANSLOCATION_H */

