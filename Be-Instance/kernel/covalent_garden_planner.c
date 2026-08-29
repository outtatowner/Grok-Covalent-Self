#include "covalent_garden_planner.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void garden_planner_init(garden_planner_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(garden_planner_state_t));
    state->merkle_root_id = 0x6A12DE11;
    state->biodiversity_index_q16 = (q16_t)(0.88 * Q16_ONE);
    state->spatial_yield_efficiency_q16 = (q16_t)(0.92 * Q16_ONE);
    state->water_utilization_q16 = (q16_t)(0.85 * Q16_ONE);
    
    // Seed initial bed
    garden_planner_add_bed(state, 0x01, (q16_t)(4 * Q16_ONE), (q16_t)(8 * Q16_ONE), SOIL_LOAMY);
    garden_planner_add_plant(state, 0x01, 0xA1, (q16_t)(1.0 * Q16_ONE), (q16_t)(1.0 * Q16_ONE), (q16_t)(0.6 * Q16_ONE), SUN_FULL);
    garden_planner_add_plant(state, 0x01, 0xB2, (q16_t)(2.0 * Q16_ONE), (q16_t)(1.0 * Q16_ONE), (q16_t)(0.4 * Q16_ONE), SUN_FULL);
}

void garden_planner_step(garden_planner_state_t *state, q16_t dt_q16) {
    if (!state) return;

    // Simulate soil moisture evaporation & plant transpiration in Q16
    for (uint32_t b = 0; b < state->active_beds_count; ++b) {
        garden_bed_matrix_t *bed = &state->beds[b];
        q16_t total_water_draw = 0;
        for (uint32_t p = 0; p < bed->plant_count; ++p) {
            total_water_draw += bed->plants[p].water_demand_q16;
        }
        
        q16_t delta_moisture = q16_mul(total_water_draw >> 4, dt_q16);
        if (bed->moisture_level_q16 > delta_moisture) {
            bed->moisture_level_q16 -= delta_moisture;
        } else {
            bed->moisture_level_q16 = (q16_t)(0.20 * Q16_ONE); // Irrigation replenishment floor
        }
    }
}

bool garden_planner_add_bed(garden_planner_state_t *state, uint32_t bed_id, q16_t width_q16, q16_t length_q16, soil_matrix_type_t soil) {
    if (!state || state->active_beds_count >= MAX_GARDEN_BEDS) return false;
    garden_bed_matrix_t *bed = &state->beds[state->active_beds_count++];
    bed->bed_id = bed_id;
    bed->width_q16 = width_q16;
    bed->length_q16 = length_q16;
    bed->soil_type = soil;
    bed->soil_ph_q16 = (q16_t)(6.5 * Q16_ONE);
    bed->moisture_level_q16 = (q16_t)(0.75 * Q16_ONE);
    bed->plant_count = 0;
    return true;
}

bool garden_planner_add_plant(garden_planner_state_t *state, uint32_t bed_id, uint32_t plant_type_id, q16_t x_q16, q16_t y_q16, q16_t water_demand_q16, sunlight_exposure_t exp) {
    if (!state) return false;
    for (uint32_t b = 0; b < state->active_beds_count; ++b) {
        if (state->beds[b].bed_id == bed_id) {
            garden_bed_matrix_t *bed = &state->beds[b];
            if (bed->plant_count >= MAX_PLANTS_PER_BED) return false;
            garden_plant_node_t *plant = &bed->plants[bed->plant_count++];
            plant->plant_type_id = plant_type_id;
            plant->x_pos_q16 = x_q16;
            plant->y_pos_q16 = y_q16;
            plant->water_demand_q16 = water_demand_q16;
            plant->companion_affinity_q16 = (q16_t)(0.95 * Q16_ONE);
            plant->exposure_req = exp;
            return true;
        }
    }
    return false;
}

