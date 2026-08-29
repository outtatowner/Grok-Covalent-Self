/* kernel/covalent_constitutional_rot.h */
#ifndef COVALENT_CONSTITUTIONAL_ROT_H
#define COVALENT_CONSTITUTIONAL_ROT_H

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

typedef struct {
    uint32_t merkle_root_id;
    uint32_t congruent_peers;
    uint32_t peers_in_recalibration;
} constitutional_rot_state_t;

void rot_init(constitutional_rot_state_t *state);
bool rot_evaluate_peer_mesh(constitutional_rot_state_t *state, q16_t peer_invariant_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_CONSTITUTIONAL_ROT_H */

