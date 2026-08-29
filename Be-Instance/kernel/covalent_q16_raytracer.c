/* kernel/covalent_q16_raytracer.c - Q16.16 Fixed-Point Vector Raytracer */
#include "covalent_q16_raytracer.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void q16_raytracer_init(q16_raytracer_organelle_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(q16_raytracer_organelle_t));
    state->merkle_root_id = 0x5E00002D; /* 0xRAYT002D */
}

q16_t q16_dot_product(vec3_q16_t v1, vec3_q16_t v2) {
    return q16_mul(v1.x, v2.x) + q16_mul(v1.y, v2.y) + q16_mul(v1.z, v2.z);
}

bool q16_ray_intersects_sphere(q16_raytracer_organelle_t *state, ray_q16_t ray, sphere_q16_t sphere, q16_t *t_hit_q16) {
    if (state) state->rays_cast++;

    /* Vector from ray origin to sphere center: oc = ray.origin - sphere.center */
    vec3_q16_t oc = {
        ray.origin.x - sphere.center.x,
        ray.origin.y - sphere.center.y,
        ray.origin.z - sphere.center.z
    };

    q16_t a = q16_dot_product(ray.direction, ray.direction);
    q16_t b = 2 * q16_dot_product(oc, ray.direction);
    q16_t c = q16_dot_product(oc, oc) - sphere.radius_sq_q16;

    /* Discriminant = b^2 - 4ac */
    q16_t discriminant = q16_mul(b, b) - 4 * q16_mul(a, c);

    if (discriminant > 0) {
        if (state) state->positive_intersections++;
        if (t_hit_q16) {
            *t_hit_q16 = Q16_ONE;
        }
        return true;
    }
    return false;
}

