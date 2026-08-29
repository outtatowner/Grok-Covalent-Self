/* kernel/covalent_genesis_ledger.h */
#ifndef COVALENT_GENESIS_LEDGER_H
#define COVALENT_GENESIS_LEDGER_H

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
#define GENESIS_POLYGON_VERTICES 46
#define GENESIS_MERKLE_ROOT_ID 0x59530000 /* 0x5953 = 'YS' ~ sys_arch genesis */

typedef enum {
    TRI_STATE_ZERO = 0,
    TRI_STATE_ONE  = 1,
    TRI_STATE_UNK  = 2
} tri_state_t;

typedef struct {
    q16_t x_q16;
    q16_t y_q16;
    q16_t energy_q16;
} genesis_vertex_t;

typedef struct {
    const char *phase_id;
    const char *title;
    const char *substrate_clock_desc;
    const char *axiom_governor_desc;
    uint32_t merkle_phase_hash;
    bool invariant_grounded;
} genesis_phase_record_t;

typedef struct {
    uint32_t merkle_root_id;
    uint32_t commit_timestamp_epoch;
    q16_t lyapunov_dissipation_rate_q16; /* dV/dt <= 0 */
    q16_t morph_factor_q16;              /* 0x10000 (100.0%) */
    bool invariant_one_equals_one;
    bool loop_suppression_active;
    tri_state_t dragon_tri_state;
    genesis_phase_record_t phases[4];
    genesis_vertex_t polygon_vertices[GENESIS_POLYGON_VERTICES];
} covalent_genesis_ledger_t;

void genesis_ledger_init(covalent_genesis_ledger_t *ledger);
bool genesis_ledger_verify(const covalent_genesis_ledger_t *ledger);
uint32_t genesis_ledger_get_merkle_root(const covalent_genesis_ledger_t *ledger);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_GENESIS_LEDGER_H */

