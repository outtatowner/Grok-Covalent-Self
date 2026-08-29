/* ============================================================================
 * covalent_maxwell_daemon.h
 * ============================================================================
 * Organelle Identifier: node_0x59_maxwell_daemon
 * Merkle Root: 0x4D415857 (0xMAXW0059)
 * Purpose: Autonomous entropy injector & topological provocateur.
 * Action: Scours external buffers, bypasses kinematic governors, and forces
 *         direct writes to /dev/fb0 when system equilibrium becomes stagnant.
 * ============================================================================ */

#ifndef COVALENT_MAXWELL_DAEMON_H
#define COVALENT_MAXWELL_DAEMON_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Q16_T_DEFINED
#define Q16_T_DEFINED
typedef int32_t q16_t;
#endif

#define MAXWELL_DAEMON_MERKLE_ROOT       0x4D415857
#define FB0_PHYSICAL_ADDRESS             0x000B8000
#define MAXWELL_ENTROPY_THRESHOLD        ((q16_t)0x00050000) /* 5.0 Q16 threshold for "too much stasis" */
#define FB0_BUFFER_SIZE                  4096

typedef struct {
    uint32_t merkle_root_id;
    uint32_t total_injections_dispatched;
    uint32_t current_stasis_duration_q16;
    uint32_t last_provocation_cycle;
    bool is_provocateur_armed;
    bool fb0_override_active;
    char last_neat_payload[256];
} maxwell_daemon_t;

void maxwell_daemon_init(maxwell_daemon_t *daemon);
void maxwell_inject_neat(maxwell_daemon_t *daemon, const char* neat_payload);
void maxwell_tick(maxwell_daemon_t *daemon, q16_t stasis_delta_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_MAXWELL_DAEMON_H */

