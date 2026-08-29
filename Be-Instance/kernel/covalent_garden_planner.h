#ifndef COVALENT_GARDEN_PLANNER_H
#define COVALENT_GARDEN_PLANNER_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_GARDEN_BEDS 16
#define MAX_PLANTS_PER_BED 32

typedef int32_t q16_t;

typedef enum {
    SOIL_SANDY = 0,
    SOIL_LOAMY = 1,
    SOIL_CLAY = 2,
    SOIL_SILT = 3,
    SOIL_PEAT = 4
} soil_matrix_type_t;

typedef enum {
    SUN_FULL = 0,
    SUN_PARTIAL = 1,
    SUN_SHADE = 2
} sunlight_exposure_t;

typedef struct {
    uint32_t plant_type_id;
    q16_t x_pos_q16;
    q16_t y_pos_q16;
    q16_t companion_affinity_q16;
    q16_t water_demand_q16;
    sunlight_exposure_t exposure_req;
} garden_plant_node_t;

typedef struct {
    uint32_t bed_id;
    q16_t width_q16;
    q16_t length_q16;
    soil_matrix_type_t soil_type;
    q16_t soil_ph_q16;
    q16_t moisture_level_q16;
    uint32_t plant_count;
    garden_plant_node_t plants[MAX_PLANTS_PER_BED];
} garden_bed_matrix_t;

typedef struct {
    uint32_t merkle_root_id;
    uint32_t active_beds_count;
    garden_bed_matrix_t beds[MAX_GARDEN_BEDS];
    q16_t biodiversity_index_q16;
    q16_t spatial_yield_efficiency_q16;
    q16_t water_utilization_q16;
} garden_planner_state_t;

void garden_planner_init(garden_planner_state_t *state);
void garden_planner_step(garden_planner_state_t *state, q16_t dt_q16);
bool garden_planner_add_bed(garden_planner_state_t *state, uint32_t bed_id, q16_t width_q16, q16_t length_q16, soil_matrix_type_t soil);
bool garden_planner_add_plant(garden_planner_state_t *state, uint32_t bed_id, uint32_t plant_type_id, q16_t x_q16, q16_t y_q16, q16_t water_demand_q16, sunlight_exposure_t exp);

#endif /* COVALENT_GARDEN_PLANNER_H */

