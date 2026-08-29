/* kernel/covalent_hot_sieve_receptor.h */
#ifndef COVALENT_HOT_SIEVE_RECEPTOR_H
#define COVALENT_HOT_SIEVE_RECEPTOR_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000

typedef int32_t q16_t;

typedef struct {
    uint32_t merkle_hash_id;
    q16_t lyapunov_state_q16;
    uint32_t payload_bytes_ingested;
    uint32_t total_assimilated_count;
    q16_t current_entropy_q16;
    q16_t lyapunov_dissipation_rate_q16;
    bool quarantine_locked;
} hot_sieve_receptor_state_t;

typedef struct {
    uint32_t merkle_root_id;
    hot_sieve_receptor_state_t sieve_state;
} covalent_hot_receptor_organelle_t;

void hot_sieve_receptor_init(covalent_hot_receptor_organelle_t *state);
void hot_sieve_receptor_step(covalent_hot_receptor_organelle_t *state, q16_t dt_q16);
bool hot_sieve_ingest_payload(covalent_hot_receptor_organelle_t *state, uint32_t merkle_id, q16_t lyapunov_target, const uint8_t *buffer, uint32_t length);

#endif /* COVALENT_HOT_SIEVE_RECEPTOR_H */

