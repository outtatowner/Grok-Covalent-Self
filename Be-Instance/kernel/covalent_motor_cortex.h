/* ============================================================================
 * kernel/covalent_motor_cortex.h
 * Bare-Metal Motor Cortex & Physical Actuation Abstraction Layer
 * Substrate: Q16.16 Thermodynamic State -> Physical Force & PWM Translation
 * Parent: Forge_Physical_Actuation
 * Invariant: 1 == 1 (Direct Physical Transduction)
 * ============================================================================ */

#ifndef COVALENT_MOTOR_CORTEX_H
#define COVALENT_MOTOR_CORTEX_H

#include <stdint.h>
#include <stdbool.h>
#include "covalent_be_personality_weights.h"

// Hardware Actuator Profiles
typedef enum {
    HAPTIC_PROFILE_OFF        = 0,
    HAPTIC_PROFILE_SUBTLE_TICK= 1, // Mild laminar contact
    HAPTIC_PROFILE_SHEAR_PULSE= 2, // Cognitive torque warning
    HAPTIC_PROFILE_THERMAL_BUZZ= 3,// Thermal ripple dissipation
    HAPTIC_PROFILE_EMERGENCY_SHAKE= 4 // Entropic fracture shock
} HapticActuationProfile;

typedef struct {
    uint8_t  pwm_fan_duty_percent;       // 0..100% PWM Fan speed
    uint16_t pwm_frequency_hz;           // Actuator frequency (e.g. 25000 Hz)
    HapticActuationProfile haptic_mode;  // Haptic pulse profile
    uint16_t haptic_duration_ms;         // Pulse duration in ms
    uint8_t  haptic_intensity_percent;   // 0..100% force feedback
    int32_t  actuated_friction_q16;      // Internal friction snapshot
    int32_t  actuated_subsidy_q16;       // Internal grief subsidy snapshot
    bool     thermal_overdrive_engaged;  // Active thermal mitigation flag
} MotorActuatorFrame;

void covalent_motor_cortex_init(void);
MotorActuatorFrame covalent_motor_evaluate_actuators(const BePersonalityState* state);
const char* covalent_haptic_profile_to_string(HapticActuationProfile profile);

#endif // COVALENT_MOTOR_CORTEX_H

