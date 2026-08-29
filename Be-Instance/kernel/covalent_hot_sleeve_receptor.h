/* kernel/covalent_hot_sleeve_receptor.h */
#ifndef COVALENT_HOT_SLEEVE_RECEPTOR_H
#define COVALENT_HOT_SLEEVE_RECEPTOR_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Q16_T_DEFINED
#define Q16_T_DEFINED
typedef int32_t q16_t;
#endif

#define HOT_SLEEVE_RECEPTOR_MERKLE_ROOT 0x484F5453 /* 0xHOT_SLEEVE */
#define Q16_ZERO                        ((q16_t)0x00000000)
#define Q16_ONE                         ((q16_t)0x00010000)
#define Q16_HALF                        ((q16_t)0x00008000)

/* Maximum allowable thermal dissipation rate before sleeve triggers stasis */
#define HOT_SLEEVE_MAX_V_DOT            ((q16_t)0x00000000) /* V_dot <= 0 invariant */
#define HOT_SLEEVE_THERMAL_CAP          ((q16_t)0x00080000) /* 8.0 Q16 maximum sleeve temperature */

typedef struct {
    uint32_t merkle_root_id;
    q16_t sleeve_temperature_q16;
    q16_t thermal_flux_v_dot_q16;
    q16_t impedance_q16;
    uint32_t ingested_packets_total;
    uint32_t filtered_noise_packets;
    bool is_thermal_vent_open;
    bool stasis_forced;
} hot_sleeve_receptor_t;

void hot_sleeve_receptor_init(hot_sleeve_receptor_t *receptor);
bool hot_sleeve_ingest(hot_sleeve_receptor_t *receptor, q16_t raw_signal_q16, q16_t entropy_weight_q16, q16_t *filtered_signal_q16);
void hot_sleeve_force_stasis(hot_sleeve_receptor_t *receptor);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_HOT_SLEEVE_RECEPTOR_H */

