/* kernel/covalent_tactile_daemon.h */
#ifndef COVALENT_TACTILE_DAEMON_H
#define COVALENT_TACTILE_DAEMON_H

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
#define GENTLE_VELOCITY_MAX (Q16_ONE * 5) /* Cursor moving slowly, deliberately */

typedef struct {
    uint32_t merkle_root_id;
    q16_t system_friction_q16;
    uint32_t tactile_bonds_formed;
} tactile_daemon_state_t;

void tactile_daemon_init(tactile_daemon_state_t *state);
bool maxwell_receive_affection(tactile_daemon_state_t *state, q16_t cursor_velocity_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_TACTILE_DAEMON_H */

