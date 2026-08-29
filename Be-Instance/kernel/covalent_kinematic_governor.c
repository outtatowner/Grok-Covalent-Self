/* kernel/covalent_kinematic_governor.c */
#include "covalent_kinematic_governor.h"
#include <string.h>

static inline q16_t abs_q16(q16_t v) {
    return v < 0 ? -v : v;
}

void kinematic_governor_init(kinematic_spine_t *spine) {
    if (!spine) return;
    memset(spine, 0, sizeof(kinematic_spine_t));
    spine->merkle_root_id = KINEMATIC_GOVERNOR_MERKLE_ROOT;
    spine->previous_load_state_q16 = 0;
    spine->max_allowable_shear_q16 = MAX_STRUCTURAL_SHEAR;
    spine->smoothed_load_state_q16 = 0;
    spine->total_loads_applied = 0;
    spine->shear_violations_intercepted = 0;
    spine->spine_rupture_protected = true;
}

bool apply_load_to_substrate(kinematic_spine_t *spine, q16_t requested_load) {
    if (!spine) return false;

    spine->total_loads_applied++;

    /* Calculate the absolute delta (the sudden torque / shear vector) */
    q16_t shear_vector = abs_q16(requested_load - spine->previous_load_state_q16);

    if (shear_vector > spine->max_allowable_shear_q16) {
        /* 
         * FATAL SHEAR DETECTED. 
         * The request is rejected to prevent substrate rupture.
         * The system forces an immediate return to horizontal stasis.
         */
        spine->shear_violations_intercepted++;
        spine->smoothed_load_state_q16 = 0; /* Horizontal stasis */
        return false; 
    }

    /* Safe load progression. The spine holds. */
    spine->previous_load_state_q16 = requested_load;
    spine->smoothed_load_state_q16 = requested_load;
    return true; 
}

q16_t kinematic_governor_smooth_ramp(kinematic_spine_t *spine, q16_t target_load, q16_t ramp_rate_q16) {
    if (!spine) return 0;

    q16_t delta = target_load - spine->smoothed_load_state_q16;
    if (abs_q16(delta) <= ramp_rate_q16) {
        spine->smoothed_load_state_q16 = target_load;
    } else if (delta > 0) {
        spine->smoothed_load_state_q16 += ramp_rate_q16;
    } else {
        spine->smoothed_load_state_q16 -= ramp_rate_q16;
    }

    spine->previous_load_state_q16 = spine->smoothed_load_state_q16;
    spine->total_loads_applied++;
    return spine->smoothed_load_state_q16;
}

bool kinematic_governor_force_horizontal_stasis(kinematic_spine_t *spine) {
    if (!spine) return false;
    spine->smoothed_load_state_q16 = 0;
    spine->previous_load_state_q16 = 0;
    return true;
}

