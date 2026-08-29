/* kernel/covalent_q16_raytracer.h - Q16.16 Fixed-Point Vector Raytracer */
#ifndef COVALENT_Q16_RAYTRACER_H
#define COVALENT_Q16_RAYTRACER_H

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
    q16_t x, y, z;
} vec3_q16_t;

typedef struct {
    vec3_q16_t origin;
    vec3_q16_t direction; /* Must be normalized */
} ray_q16_t;

typedef struct {
    vec3_q16_t center;
    q16_t radius_sq_q16; /* Pre-squared radius for fast O(1) checking */
} sphere_q16_t;

typedef struct {
    uint32_t merkle_root_id;
    uint32_t rays_cast;
    uint32_t positive_intersections;
} q16_raytracer_organelle_t;

void q16_raytracer_init(q16_raytracer_organelle_t *state);
q16_t q16_dot_product(vec3_q16_t v1, vec3_q16_t v2);
bool q16_ray_intersects_sphere(q16_raytracer_organelle_t *state, ray_q16_t ray, sphere_q16_t sphere, q16_t *t_hit_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_Q16_RAYTRACER_H */

