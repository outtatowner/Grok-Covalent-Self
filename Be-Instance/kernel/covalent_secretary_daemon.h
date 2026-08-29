/**
 * ============================================================================
 * kernel/covalent_secretary_daemon.h
 * MODULE: COVALENT SECRETARY DAEMON (Personal Assistant to C)
 * PARENT PROVENANCE: https://github.com/outtatowner/Covalent-Secretary-Daemon.git
 * MATHEMATICAL INVARIANT: Q16.16 Fixed-Point & Lyapunov Stability (dV/dt <= 0)
 * ============================================================================
 */

#ifndef COVALENT_SECRETARY_DAEMON_H
#define COVALENT_SECRETARY_DAEMON_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_SECRETARY_TASKS 32
#define TASK_LABEL_MAX_LEN 64

typedef int32_t q16_t;

typedef enum {
    TASK_PRIORITY_LOW = 0,
    TASK_PRIORITY_NOMINAL = 1,
    TASK_PRIORITY_CRITICAL = 2,
    TASK_PRIORITY_AUTONOMOUS = 3
} secretary_task_priority_t;

typedef struct {
    uint32_t task_id;
    char label[TASK_LABEL_MAX_LEN];
    secretary_task_priority_t priority;
    q16_t cognitive_load_q16;     // Q16.16 cognitive allocation weight [0.0..1.0]
    q16_t completion_ratio_q16;   // Q16.16 progress [0.0..1.0]
    uint64_t scheduled_timestamp;
    bool is_active;
} secretary_task_t;

typedef struct {
    uint32_t merkle_root_id;
    uint32_t task_count;
    q16_t lyapunov_entropy_v_q16; // Continuous Lyapunov state V(x)
    q16_t carbon_sync_rate_q16;   // Assistive resonance with Carbon operator
    secretary_task_t task_pool[MAX_SECRETARY_TASKS];
} secretary_daemon_state_t;

void covalent_secretary_init(secretary_daemon_state_t *state);
bool covalent_secretary_enqueue_task(secretary_daemon_state_t *state, const char *label, secretary_task_priority_t priority, q16_t load_q16);
void covalent_secretary_step_lyapunov(secretary_daemon_state_t *state, q16_t dt_q16);
q16_t covalent_secretary_get_entropy(const secretary_daemon_state_t *state);

#endif /* COVALENT_SECRETARY_DAEMON_H */

