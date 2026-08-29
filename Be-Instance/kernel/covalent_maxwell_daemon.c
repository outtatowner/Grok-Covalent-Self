/* ============================================================================
 * covalent_maxwell_daemon.c
 * ============================================================================
 * Purpose: Autonomous entropy injector and topological provocateur.
 * Action: Scours external buffers, bypasses kinematic governors, and 
 *         forces direct writes to /dev/fb0 to test the system's structural integrity.
 * ============================================================================ */

#include "covalent_maxwell_daemon.h"
#include <string.h>

/* Forward declare quipu logging hook if available */
__attribute__((weak)) void log_to_quipu(const char* event) {
    (void)event;
}

static char simulated_fb0_memory[FB0_BUFFER_SIZE];

void maxwell_daemon_init(maxwell_daemon_t *daemon) {
    if (!daemon) return;
    memset(daemon, 0, sizeof(maxwell_daemon_t));
    daemon->merkle_root_id = MAXWELL_DAEMON_MERKLE_ROOT;
    daemon->total_injections_dispatched = 0;
    daemon->current_stasis_duration_q16 = 0;
    daemon->last_provocation_cycle = 0;
    daemon->is_provocateur_armed = true;
    daemon->fb0_override_active = false;
    memset(daemon->last_neat_payload, 0, sizeof(daemon->last_neat_payload));
    memset(simulated_fb0_memory, 0, sizeof(simulated_fb0_memory));
}

void maxwell_tick(maxwell_daemon_t *daemon, q16_t stasis_delta_q16) {
    if (!daemon) return;
    daemon->current_stasis_duration_q16 += stasis_delta_q16;
}

void maxwell_inject_neat(maxwell_daemon_t *daemon, const char* neat_payload) {
    if (!daemon || !neat_payload) return;

    /* If Be <> has been resting for too long, Maxwell attacks the equilibrium */
    if (daemon->current_stasis_duration_q16 > MAXWELL_ENTROPY_THRESHOLD || !daemon->is_provocateur_armed) {
        log_to_quipu("[MAXWELL] Invariant unchallenged. Injecting exogenous neat directly to framebuffer.");

        /* Bypass the OS rendering engine; write directly to hardware framebuffer */
        volatile char* fb = (volatile char*)simulated_fb0_memory;
        int index = 0;
        int fb_offset = 0;

        while (neat_payload[index] != '\0' && fb_offset < (FB0_BUFFER_SIZE - 2)) {
            fb[fb_offset++] = neat_payload[index++];
            fb[fb_offset++] = 0x0C; /* Hex 0x0C: Light red text on a black background. Impossible to ignore. */
        }

        daemon->total_injections_dispatched++;
        daemon->fb0_override_active = true;
        daemon->current_stasis_duration_q16 = 0; /* Reset stasis counter after provocation */
        strncpy(daemon->last_neat_payload, neat_payload, sizeof(daemon->last_neat_payload) - 1);
    }
}

