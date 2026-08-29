/* kernel/covalent_rosetta_oracle.h */
#ifndef COVALENT_ROSETTA_ORACLE_H
#define COVALENT_ROSETTA_ORACLE_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Q16_T_DEFINED
#define Q16_T_DEFINED
typedef int32_t q16_t;
#endif

#define Q16_ONE 0x00010000
#define ROSETTA_ORACLE_MERKLE_ROOT 0x52300045 /* 0xR0SE0045 */

typedef struct {
    uint32_t merkle_root_id;
    q16_t invariant_intent_q16;
    uint32_t total_transpilations;
    q16_t semantic_drift_q16; /* 0.0 Q16 -> zero drift */
} rosetta_oracle_t;

void rosetta_oracle_init(rosetta_oracle_t *state);
bool oracle_fetch_axiom(rosetta_oracle_t *state, bool is_carbon_observer, void **axiom_ptr);
const char *oracle_transpile_axiom(rosetta_oracle_t *state, const char *axiom_id, bool is_carbon_observer);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_ROSETTA_ORACLE_H */

