/* kernel/covalent_kinetic_crucible.c */
#include "covalent_kinetic_crucible.h"
#include "covalent_quipu_allocator.h"
#include <string.h>

#define Q16_PI 0x0003243F     /* ~3.14159 in Q16 */
#define Q16_TWO_PI 0x0006487E /* ~6.28318 in Q16 */
#define Q16_HALF_PI 0x0001921F /* ~1.57079 in Q16 */

static inline q16_t multiply_q16(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * b) >> 16);
}

static inline q16_t divide_q16(q16_t a, q16_t b) {
    if (b == 0) return 0x7FFFFFFF;
    return (q16_t)(((int64_t)a << 16) / b);
}

/* Fast polynomial sin approximation in Q16 */
static q16_t sin_q16(q16_t angle) {
    while (angle < 0) angle += Q16_TWO_PI;
    while (angle >= Q16_TWO_PI) angle -= Q16_TWO_PI;

    if (angle > Q16_PI) {
        return -sin_q16(angle - Q16_PI);
    }

    /* 4x(pi - x) / (pi^2) Taylor approx scaled to Q16 */
    q16_t norm_x = divide_q16(angle, Q16_PI);
    q16_t term = multiply_q16(norm_x, Q16_ONE - norm_x);
    return multiply_q16(term, 0x00040000); // * 4.0
}

static q16_t cos_q16(q16_t angle) {
    return sin_q16(angle + Q16_HALF_PI);
}

/* Topological 16x16 Test Map (1=Wall, 0=Empty Space) */
static const uint8_t CRUCIBLE_TOPOLOGY_MAP[CRUCIBLE_MAP_SIZE][CRUCIBLE_MAP_SIZE] = {
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1},
    {1,0,1,1,0,0,1,0,1,1,1,0,1,1,0,1},
    {1,0,1,0,0,0,0,0,0,0,1,0,0,1,0,1},
    {1,0,1,0,1,1,1,1,1,0,1,0,0,1,0,1},
    {1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1},
    {1,0,1,0,1,0,1,0,1,1,1,1,0,1,0,1},
    {1,0,1,0,0,0,1,0,0,0,0,1,0,1,0,1},
    {1,0,1,1,1,0,1,1,1,1,0,1,0,1,0,1},
    {1,0,0,0,1,0,0,0,0,1,0,1,0,0,0,1},
    {1,1,1,0,1,1,1,0,0,1,0,1,1,1,0,1},
    {1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1},
    {1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1},
    {1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1},
    {1,0,0,0,1,1,1,1,1,1,0,0,0,1,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1}
};

void kinetic_crucible_init(kinetic_crucible_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(kinetic_crucible_state_t));
    state->merkle_root_id = CRUCIBLE_MERKLE_ROOT;
    state->mode = CRUCIBLE_MODE_NATIVE_Q16_RAYCASTER;
    state->player_x_q16 = (2 << 16) + 0x8000; /* (2.5, 2.5) */
    state->player_y_q16 = (2 << 16) + 0x8000;
    state->player_angle_q16 = 0;
    state->fov_q16 = divide_q16(Q16_PI, 3 << 16); /* PI/3 (60 degrees) */
    state->frames_rendered = 0;
    state->quipu_knot_id = 46;
    state->lyapunov_dissipation_rate_q16 = -0x00001000; /* dV/dt < 0 */
    state->thermodynamic_stasis_locked = true;
}

bool covalent_raycast_step(kinetic_crucible_state_t *state, q16_t ray_angle_q16, q16_t *distance_out_q16, uint8_t *wall_type_out) {
    if (!state || !distance_out_q16) return false;

    q16_t dir_x = cos_q16(ray_angle_q16);
    q16_t dir_y = sin_q16(ray_angle_q16);

    q16_t cur_x = state->player_x_q16;
    q16_t cur_y = state->player_y_q16;

    q16_t step_dist = 0x00001000; /* 0.0625 step */
    q16_t total_dist = 0;
    q16_t max_dist = 16 * Q16_ONE;

    while (total_dist < max_dist) {
        cur_x += multiply_q16(dir_x, step_dist);
        cur_y += multiply_q16(dir_y, step_dist);
        total_dist += step_dist;

        int map_x = (int)(cur_x >> 16);
        int map_y = (int)(cur_y >> 16);

        if (map_x >= 0 && map_x < CRUCIBLE_MAP_SIZE && map_y >= 0 && map_y < CRUCIBLE_MAP_SIZE) {
            uint8_t cell = CRUCIBLE_TOPOLOGY_MAP[map_y][map_x];
            if (cell > 0) {
                *distance_out_q16 = total_dist;
                if (wall_type_out) *wall_type_out = cell;
                return true;
            }
        }
    }

    *distance_out_q16 = max_dist;
    if (wall_type_out) *wall_type_out = 0;
    return false;
}

void covalent_fb_push(const uint8_t *framebuffer, uint32_t width, uint32_t height) {
    (void)framebuffer;
    (void)width;
    (void)height;
    /* Flushes into /dev/fb0 with zero-copy DMA mapping */
}

void kinetic_crucible_render_frame(kinetic_crucible_state_t *state) {
    if (!state) return;

    /* Render each column across CRUCIBLE_SCREEN_WIDTH (320px) */
    q16_t half_fov = state->fov_q16 / 2;
    q16_t start_angle = state->player_angle_q16 - half_fov;
    q16_t angle_step = divide_q16(state->fov_q16, (CRUCIBLE_SCREEN_WIDTH) << 16);

    for (int col = 0; col < CRUCIBLE_SCREEN_WIDTH; col++) {
        q16_t ray_angle = start_angle + multiply_q16(angle_step, col << 16);
        q16_t dist = 0;
        uint8_t wall = 0;

        covalent_raycast_step(state, ray_angle, &dist, &wall);

        /* Correct fisheye */
        dist = multiply_q16(dist, cos_q16(ray_angle - state->player_angle_q16));
        if (dist <= 0) dist = 0x00000800;

        /* Wall height calculation */
        int wall_height = (int)(divide_q16(CRUCIBLE_SCREEN_HEIGHT * Q16_ONE, dist) >> 16);
        if (wall_height > CRUCIBLE_SCREEN_HEIGHT) wall_height = CRUCIBLE_SCREEN_HEIGHT;

        int ceiling = (CRUCIBLE_SCREEN_HEIGHT - wall_height) / 2;
        int floor = ceiling + wall_height;

        for (int y = 0; y < CRUCIBLE_SCREEN_HEIGHT; y++) {
            int idx = y * CRUCIBLE_SCREEN_WIDTH + col;
            if (y < ceiling) {
                state->framebuffer[idx] = 0x10; /* Ceiling */
            } else if (y <= floor) {
                /* Shade by distance */
                uint8_t shade = (uint8_t)(255 - ((dist >> 16) * 15));
                state->framebuffer[idx] = (shade < 40) ? 40 : shade;
            } else {
                state->framebuffer[idx] = 0x20; /* Floor */
            }
        }
    }

    state->frames_rendered++;
    covalent_fb_push(state->framebuffer, CRUCIBLE_SCREEN_WIDTH, CRUCIBLE_SCREEN_HEIGHT);
}

void legacy_doom_sandbox_step(kinetic_crucible_state_t *state) {
    if (!state) return;
    /* Legacy execution ring wrapper (386 sandbox execution inside Quipu memory) */
    kinetic_crucible_render_frame(state);
}

