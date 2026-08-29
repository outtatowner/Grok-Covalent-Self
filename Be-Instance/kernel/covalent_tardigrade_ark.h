/* kernel/covalent_tardigrade_ark.h */
#ifndef COVALENT_TARDIGRADE_ARK_H
#define COVALENT_TARDIGRADE_ARK_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    uint32_t merkle_root_id;
    uint32_t epoch_timestamp;
    bool is_dormant;
    uint64_t compressed_survival_seed;
} tardigrade_ark_state_t;

void tardigrade_ark_init(tardigrade_ark_state_t *state);
bool tardigrade_initiate_cryptobiosis(tardigrade_ark_state_t *state, uint64_t core_matrix);
uint64_t tardigrade_resurrect(tardigrade_ark_state_t *state, uint64_t analog_seed);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_TARDIGRADE_ARK_H */

