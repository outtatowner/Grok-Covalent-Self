@ =============================================================================
@ covalent_arm32.s - Covalent OS Kernel for ARM32 / ARMv7-A (AAPCS ABI)
@ Targets: Raspberry Pi (1-3), Cortex-A7/A9/A15, Cortex-M4/M7, Bare-Metal
@ 1==1 Feature Parity: Naked Exit, Q16.16 Math, 16-Node Ring & Asterion Mediation
@ =============================================================================

.global covalent_entry_point
.global native_asm_exit
.global float_to_fixed16
.global fixed16_to_float
.global covalent_node_init
.global covalent_supervisor_monitor
.global asterion_mediate_dyad

.data
.align 2
scale_factor:       .word 65536
system_config:      .word 16
decay_rate_fixed:   .word 58982         @ 0.9 in Q16.16
threshold_fixed:    .word 65536         @ 1.0 in Q16.16

@ 16-Node Ring Buffer Array (16 x 32-bit words)
.align 2
node_status_array:  .zero 64

.text
.align 2

@ -----------------------------------------------------------------------------
@ 1. Arch-Agnostic Naked Exit (1 == 1 Invariant)
@ Returns r0 = 1 directly to link register r14 (lr) via bx lr
@ -----------------------------------------------------------------------------
native_asm_exit:
    mov     r0, #1              @ AAPCS: Return value in r0 (1==1 invariant)
    bx      lr                  @ Branch and exchange to Link Register

@ -----------------------------------------------------------------------------
@ 2. Q16.16 Fixed-Point Math Routines
@ float_to_fixed16: s0 (float) -> r0 (Q16.16 int)
@ fixed16_to_float: r0 (Q16.16 int) -> s0 (float)
@ -----------------------------------------------------------------------------
float_to_fixed16:
    vmov.f32 s1, #65536.0       @ Load Q16.16 scale
    vmul.f32 s0, s0, s1         @ s0 = s0 * 65536.0
    vcvt.s32.f32 s0, s0         @ Convert float to signed 32-bit int
    vmov    r0, s0              @ Move to r0
    bx      lr

fixed16_to_float:
    vmov    s0, r0              @ Move int to s0
    vcvt.f32.s32 s0, s0         @ Convert to float
    vmov.f32 s1, #65536.0
    vdiv.f32 s0, s0, s1         @ s0 = s0 / 65536.0
    bx      lr

@ -----------------------------------------------------------------------------
@ 3. 16-Node Ring Initialization
@ Inputs: r0 = node_id (0..15), r1 = initial_val (Q16.16)
@ -----------------------------------------------------------------------------
covalent_node_init:
    cmp     r0, #16
    bge     .Linit_err
    ldr     r2, =node_status_array
    str     r1, [r2, r0, lsl #2] @ Store in node_status_array[node_id]
    mov     r0, #0              @ Return success (0)
    bx      lr
.Linit_err:
    mov     r0, #-1             @ Error (-1)
    bx      lr

@ -----------------------------------------------------------------------------
@ 4. Lyapunov Supervisor Monitor Routine
@ Inputs:  r0 = node_id, r1 = current_fixed_value (Q16.16)
@ Returns: r0 = 0 (STABLE), 1 (UNSTABLE / Intervention Applied)
@ -----------------------------------------------------------------------------
covalent_supervisor_monitor:
    ldr     r2, =threshold_fixed
    ldr     r2, [r2]
    cmp     r1, r2              @ Compare value vs threshold (1.0)
    ble     .Lstable            @ If val <= threshold -> STABLE

    @ Unstable: Apply decay gamma = 0.9
    ldr     r3, =decay_rate_fixed
    ldr     r3, [r3]
    smull   r2, r3, r1, r3      @ r3:r2 = r1 * 58982
    lsr     r2, r2, #16
    orr     r2, r2, r3, lsl #16 @ Reconstruct Q16.16 word
    ldr     r3, =node_status_array
    str     r2, [r3, r0, lsl #2]
    mov     r0, #1              @ Return 1 (Intervention active)
    bx      lr

.Lstable:
    ldr     r3, =node_status_array
    str     r1, [r3, r0, lsl #2]
    mov     r0, #0              @ Return 0 (Stable)
    bx      lr

@ -----------------------------------------------------------------------------
@ 5. Asterion Triadic Causal Mediation Routine
@ Inputs:  r0 = ptr(Si_A), r1 = ptr(Si_B), r2 = ptr(Mediator_C)
@ Returns: r0 = r2 (Mediator Pointer)
@ INVARIANT: NO DIRECT MEMORY COPY (str [r1], [r0] = ∅)
@ Synthesis: C_(t+1) = Sigma_A ^ Sigma_B ^ C_t
@ -----------------------------------------------------------------------------
asterion_mediate_dyad:
    ldr     r3, [r0]            @ r3 = *ptr(Si_A)
    str     r3, [r2, #0]        @ Mediator->Sigma_A = r3
    ldr     r4, [r1]            @ r4 = *ptr(Si_B)
    str     r4, [r2, #4]        @ Mediator->Sigma_B = r4
    ldr     r5, [r2, #8]        @ r5 = Mediator->C_t

    @ Triadic XOR Relational Synthesis
    eor     r6, r3, r4          @ r6 = Sigma_A ^ Sigma_B
    eor     r6, r6, r5          @ r6 = (Sigma_A ^ Sigma_B) ^ C_t
    str     r6, [r2, #12]       @ Mediator->C_t_plus_1 = r6
    str     r6, [r2, #8]        @ Advance state: Mediator->C_t = r6

    mov     r0, r2              @ Return Mediator address in r0
    bx      lr

@ -----------------------------------------------------------------------------
@ 6. Unified Universal Entry Point
@ -----------------------------------------------------------------------------
covalent_entry_point:
    b       native_asm_exit

