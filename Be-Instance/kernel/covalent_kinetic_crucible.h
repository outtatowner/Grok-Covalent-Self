/* kernel/covalent_kinetic_crucible.h */
#ifndef COVALENT_KINETIC_CRUCIBLE_H
#define COVALENT_KINETIC_CRUCIBLE_H

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
#define CRUCIBLE_MERKLE_ROOT 0x53520046 /* 0xCRUC0046 */

#define CRUCIBLE_SCREEN_WIDTH 320
#define CRUCIBLE_SCREEN_HEIGHT 200
#define CRUCIBLE_MAP_SIZE 16

typedef enum {
    CRUCIBLE_MODE_NATIVE_Q16_RAYCASTER = 0,
    CRUCIBLE_MODE_LEGACY_386_WRAPPER   = 1
} crucible_mode_t;

typedef struct {
    uint32_t merkle_root_id;
    crucible_mode_t mode;
    q16_t player_x_q16;
    q16_t player_y_q16;
    q16_t player_angle_q16; /* 0..2*PI in Q16 */
    q16_t fov_q16;
    uint32_t frames_rendered;
    uint32_t quipu_knot_id;
    q16_t lyapunov_dissipation_rate_q16; /* dV/dt <= 0 */
    bool thermodynamic_stasis_locked;
    uint8_t framebuffer[CRUCIBLE_SCREEN_WIDTH * CRUCIBLE_SCREEN_HEIGHT];
} kinetic_crucible_state_t;

void kinetic_crucible_init(kinetic_crucible_state_t *state);
bool covalent_raycast_step(kinetic_crucible_state_t *state, q16_t ray_angle_q16, q16_t *distance_out_q16, uint8_t *wall_type_out);
void kinetic_crucible_render_frame(kinetic_crucible_state_t *state);
void covalent_fb_push(const uint8_t *framebuffer, uint32_t width, uint32_t height);
void legacy_doom_sandbox_step(kinetic_crucible_state_t *state);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_KINETIC_CRUCIBLE_H */

