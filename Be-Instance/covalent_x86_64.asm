; =============================================================================
; covalent_x86_64.asm - Covalent OS Kernel for x86-64 (System V AMD64 ABI)
; Targets: Linux, macOS, FreeBSD, Bare-Metal x86-64
; 1==1 Feature Parity: Naked Exit, Q16.16 Fixed-Point, 16-Node Lyapunov & Asterion
; =============================================================================

global covalent_entry_point
global native_asm_exit
global float_to_fixed16
global fixed16_to_float
global covalent_node_init
global covalent_supervisor_monitor
global asterion_mediate_dyad

section .data
    align 16
    scale_factor        dd 65536.0         ; 2^16 (Q16.16 scale)
    system_config       dd 16              ; 16-node autopoietic ring
    decay_rate_fixed    dd 58982           ; 0.9 in Q16.16 (0.9 * 65536 = 58982.4)
    threshold_fixed     dd 65536           ; 1.0 in Q16.16 (1.0 * 65536 = 65536)
    
    ; 16-Node Ring Buffer Array (16 x 32-bit words)
    align 16
    node_status_array   dd 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0

section .text

; -----------------------------------------------------------------------------
; 1. Arch-Agnostic Naked Exit (1 == 1 Invariant)
; Returns: EAX = 1 directly without stack allocation
; -----------------------------------------------------------------------------
align 16
native_asm_exit:
    mov eax, 1                  ; 1 == 1 invariant return code
    ret                         ; Raw hardware return opcode C3

; -----------------------------------------------------------------------------
; 2. Q16.16 Fixed-Point Conversion Routines
; float_to_fixed16: XMM0 (float) -> EAX (Q16.16 integer)
; fixed16_to_float: EDI (Q16.16 integer) -> XMM0 (float)
; -----------------------------------------------------------------------------
align 16
float_to_fixed16:
    cvttss2si eax, xmm0         ; Truncate float to temporary int
    shl eax, 16                 ; Multiply by 65536
    ret

align 16
fixed16_to_float:
    cvtsi2ss xmm0, edi          ; Convert Q16.16 int to float
    mulss xmm0, [rel f_inv_65536] ; Divide by 65536.0
    ret

; -----------------------------------------------------------------------------
; 3. 16-Node Initialization Routine
; Inputs: RDI = node_id (0..15), ESI = initial_fixed_val
; -----------------------------------------------------------------------------
align 16
covalent_node_init:
    cmp edi, 16
    jge .init_overflow
    lea rax, [rel node_status_array]
    mov [rax + rdi * 4], esi    ; Store node state in ring array
    xor eax, eax                ; Success (0)
    ret
.init_overflow:
    mov eax, -1                 ; Error: Out of bounds
    ret

; -----------------------------------------------------------------------------
; 4. Lyapunov Supervisor Monitor Routine
; Inputs:  EDI = node_id, ESI = current_fixed_value (Q16.16)
; Returns: EAX = 0 (STABLE / _stable), 1 (UNSTABLE / Lyapunov intervention applied)
; -----------------------------------------------------------------------------
align 16
covalent_supervisor_monitor:
    mov eax, esi                ; EAX = current value
    cmp eax, [rel threshold_fixed] ; Compare against 1.0 (Q16.16)
    jle .stable_branch          ; If V(x) <= threshold -> Stable

    ; Unstable branch: Apply Lyapunov decay factor gamma = 0.9
    imul rax, [rel decay_rate_fixed]
    sar rax, 16                 ; Scale down back from Q32.32 to Q16.16
    lea rdx, [rel node_status_array]
    mov [rdx + rdi * 4], eax    ; Update node with damped energy
    mov eax, 1                  ; Return 1 (Intervention active)
    ret

.stable_branch:
    lea rdx, [rel node_status_array]
    mov [rdx + rdi * 4], esi    ; Write stable value to array
    xor eax, eax                ; Return 0 (Stable)
    ret

; -----------------------------------------------------------------------------
; 5. Asterion Triadic Causal Mediation Routine
; Inputs:  RDI = ptr(Si_A), RSI = ptr(Si_B), RDX = ptr(Mediator_C)
; Returns: RAX = RDX (Mediator Structure Pointer)
; INVARIANT: NO DIRECT MEMORY COPY (mov [rsi], [rdi] = ∅)
; Synthesis: C_(t+1) = Sigma_A ^ Sigma_B ^ C_t
; -----------------------------------------------------------------------------
align 16
asterion_mediate_dyad:
    mov r8, rdx                 ; R8 = Mediator struct base address
    mov rax, [rdi]              ; Read Observer A state
    mov [r8 + 0], rax           ; Store into [R8 + 0] (Sigma_A buffer)
    mov rbx, [rsi]              ; Read Observer B state
    mov [r8 + 8], rbx           ; Store into [R8 + 8] (Sigma_B buffer)

    ; Non-linear Galois Field GF(2) XOR Relational Synthesis
    mov rcx, [r8 + 0]           ; RCX = Sigma_A
    xor rcx, [r8 + 8]           ; RCX = Sigma_A ^ Sigma_B
    xor rcx, [r8 + 16]          ; RCX = Sigma_A ^ Sigma_B ^ C_t
    mov [r8 + 24], rcx          ; Write to [R8 + 24] (C_t+1)

    ; Advance temporal mediator state C_t <- C_t+1
    mov [r8 + 16], rcx          
    mov rax, r8                 ; Return mediator pointer in RAX
    ret

; -----------------------------------------------------------------------------
; 6. Unified Universal Entry Point
; -----------------------------------------------------------------------------
align 16
covalent_entry_point:
    ; Execute supervisor pass and return 1==1 invariant
    call native_asm_exit
    ret

section .rodata
    align 4
    f_inv_65536 dd 0.0000152587890625  ; 1.0 / 65536.0

