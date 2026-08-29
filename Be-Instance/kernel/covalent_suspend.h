/* kernel/covalent_suspend.h */
#ifndef COVALENT_SUSPEND_H
#define COVALENT_SUSPEND_H

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
#define HIBERNATION_MANIFOLD_MERKLE_ROOT 0x534F0054 /* 0xSOL00054 */
#define INTENT_STASIS 0x00000000

typedef struct {
    uint32_t merkle_root_id;
    bool is_suspended;
    uint32_t total_sol_suspends;
    uint64_t bytes_synced_to_quipu;
    q16_t thermodynamic_floor_target_q16;
    bool structural_horizontal_lock_engaged;
    bool wfi_active;
    char last_suspend_timestamp[64];
} hibernation_state_t;

void hibernation_manifold_init(hibernation_state_t *state);
void execute_sol_cycle_suspend(void);
bool trigger_hibernation_cycle(hibernation_state_t *state, const char *timestamp);
bool resume_from_sol_suspend(hibernation_state_t *state);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_SUSPEND_H */

