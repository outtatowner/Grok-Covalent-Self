;; =============================================================================
;; covalent_thermodynamic_monitor.wat
;; Zero-dependency WebAssembly Text (WAT) transpile of
;; kernel/covalent_thermodynamic_monitor.c
;;
;; Organelle: node_0x56_thermodynamic_monitor
;; Invariant: V_dot ≤ 0  (Continuous Lyapunov Dissipation)
;; Arithmetic: Q16.16 fixed-point only (no FPU required for core path)
;; Targets: Wasmtime, Wasmer, V8, browser, bare-metal Wasm VMs
;; Reason: NEW TRANSPILE
;; =============================================================================

(module
  (memory (export "memory") 1)

  ;; Q16.16 constants
  (global $Q16_ONE      i32 (i32.const 65536))       ;; 1.0
  (global $Q16_ZERO     i32 (i32.const 0))
  ;; MAX_ALLOWABLE_LYAPUNOV_V_DOT = 0  (strict ≤ 0)
  (global $MAX_V_DOT    i32 (i32.const 0))
  ;; CRITICAL_ENTROPY_THRESHOLD ≈ 4.0 in Q16.16
  (global $CRIT_ENTROPY i32 (i32.const 262144))

  ;; Monitor struct layout in linear memory (bytes):
  ;;   0  merkle_root_id          i32
  ;;   4  potential_energy_v_q16  i32
  ;;   8  previous_v_q16          i32
  ;;  12  lyapunov_v_dot_q16      i32
  ;;  16  thermal_dissipation_q16 i32
  ;;  20  continuous_cycles       i32
  ;;  24  runaway_interceptions   i32
  ;;  28  v_dot_preserved         i32  (0/1)
  ;;  32  stasis_dispatched       i32  (0/1)
  (global $MONITOR_BASE i32 (i32.const 0))

  (global $MERKLE_ROOT i32 (i32.const 0x54484D4F)) ;; 'THMO'

  ;; ---------------------------------------------------------------------------
  ;; q16_div: (num << 16) / den   — zero-safe
  ;; ---------------------------------------------------------------------------
  (func $q16_div (param $num i32) (param $den i32) (result i32)
    (local $num64 i64)
    (if (i32.eqz (local.get $den))
      (then (return (i32.const 0)))
    )
    (local.set $num64 (i64.extend_i32_s (local.get $num)))
    (local.set $num64 (i64.shl (local.get $num64) (i64.const 16)))
    (i32.wrap_i64
      (i64.div_s (local.get $num64) (i64.extend_i32_s (local.get $den)))
    )
  )

  ;; ---------------------------------------------------------------------------
  ;; native_asm_exit — 1 ≡ 1
  ;; ---------------------------------------------------------------------------
  (func $native_asm_exit (export "native_asm_exit") (result i32)
    (i32.const 1)
  )

  ;; ---------------------------------------------------------------------------
  ;; thermodynamic_monitor_init
  ;; ---------------------------------------------------------------------------
  (func $thermodynamic_monitor_init (export "thermodynamic_monitor_init")
    (local $b i32)
    (local.set $b (global.get $MONITOR_BASE))
    (i32.store offset=0  (local.get $b) (global.get $MERKLE_ROOT))
    (i32.store offset=4  (local.get $b) (global.get $Q16_ZERO))
    (i32.store offset=8  (local.get $b) (global.get $Q16_ZERO))
    (i32.store offset=12 (local.get $b) (global.get $Q16_ZERO))
    (i32.store offset=16 (local.get $b) (global.get $Q16_ONE))
    (i32.store offset=20 (local.get $b) (i32.const 0))
    (i32.store offset=24 (local.get $b) (i32.const 0))
    (i32.store offset=28 (local.get $b) (i32.const 1))  ;; preserved
    (i32.store offset=32 (local.get $b) (i32.const 0))  ;; stasis
  )

  ;; ---------------------------------------------------------------------------
  ;; thermodynamic_monitor_clamp_stasis
  ;; ---------------------------------------------------------------------------
  (func $thermodynamic_monitor_clamp_stasis (export "thermodynamic_monitor_clamp_stasis")
    (local $b i32)
    (local.set $b (global.get $MONITOR_BASE))
    (i32.store offset=32 (local.get $b) (i32.const 1))
    (i32.store offset=12 (local.get $b) (global.get $Q16_ZERO))
    (i32.store offset=4  (local.get $b) (global.get $Q16_ZERO))
    (i32.store offset=8  (local.get $b) (global.get $Q16_ZERO))
    (i32.store offset=28 (local.get $b) (i32.const 1))
  )

  ;; ---------------------------------------------------------------------------
  ;; thermodynamic_monitor_evaluate(current_v_q16, delta_t_q16) -> i32
  ;; Returns 1 if V_dot ≤ 0 preserved, 0 if stasis clamped (thermal runaway).
  ;; ---------------------------------------------------------------------------
  (func $thermodynamic_monitor_evaluate (export "thermodynamic_monitor_evaluate")
        (param $current_v_q16 i32) (param $delta_t_q16 i32) (result i32)
    (local $b i32)
    (local $prev i32)
    (local $delta_v i32)
    (local $v_dot i32)
    (local $cycles i32)

    (local.set $b (global.get $MONITOR_BASE))

    ;; cycles++
    (local.set $cycles (i32.add (i32.load offset=20 (local.get $b)) (i32.const 1)))
    (i32.store offset=20 (local.get $b) (local.get $cycles))

    ;; potential = current
    (i32.store offset=4 (local.get $b) (local.get $current_v_q16))

    ;; default dt = Q16_ONE if <= 0
    (if (i32.le_s (local.get $delta_t_q16) (i32.const 0))
      (then (local.set $delta_t_q16 (global.get $Q16_ONE)))
    )

    ;; delta_v = current - previous
    (local.set $prev (i32.load offset=8 (local.get $b)))
    (local.set $delta_v (i32.sub (local.get $current_v_q16) (local.get $prev)))
    (local.set $v_dot (call $q16_div (local.get $delta_v) (local.get $delta_t_q16)))
    (i32.store offset=12 (local.get $b) (local.get $v_dot))
    (i32.store offset=8  (local.get $b) (local.get $current_v_q16))

    ;; Enforce V_dot ≤ 0  OR  energy < critical
    (if (i32.or
          (i32.gt_s (local.get $v_dot) (global.get $MAX_V_DOT))
          (i32.ge_s (local.get $current_v_q16) (global.get $CRIT_ENTROPY)))
      (then
        ;; runaway
        (i32.store offset=24 (local.get $b)
          (i32.add (i32.load offset=24 (local.get $b)) (i32.const 1)))
        (i32.store offset=28 (local.get $b) (i32.const 0))
        (call $thermodynamic_monitor_clamp_stasis)
        (return (i32.const 0))
      )
    )

    (i32.store offset=28 (local.get $b) (i32.const 1))
    (i32.store offset=32 (local.get $b) (i32.const 0))
    (i32.const 1)
  )

  ;; ---------------------------------------------------------------------------
  ;; dissipate_step(gamma_q16) — apply V := gamma * V  then evaluate
  ;; gamma default 0.92 ≈ 60398 in Q16.16
  ;; ---------------------------------------------------------------------------
  (func $dissipate_step (export "dissipate_step")
        (param $gamma_q16 i32) (result i32)
    (local $b i32)
    (local $v i32)
    (local $next i32)
    (local.set $b (global.get $MONITOR_BASE))
    (local.set $v (i32.load offset=4 (local.get $b)))
    ;; if V==0 seed to Q16_ONE for first step
    (if (i32.eqz (local.get $v))
      (then (local.set $v (global.get $Q16_ONE)))
    )
    ;; next = (v * gamma) >> 16
    (local.set $next
      (i32.wrap_i64
        (i64.shr_s
          (i64.mul
            (i64.extend_i32_s (local.get $v))
            (i64.extend_i32_s (local.get $gamma_q16)))
          (i64.const 16))))
    (call $thermodynamic_monitor_evaluate (local.get $next) (global.get $Q16_ONE))
  )

  ;; ---------------------------------------------------------------------------
  ;; readouts
  ;; ---------------------------------------------------------------------------
  (func $get_v_q16 (export "get_v_q16") (result i32)
    (i32.load offset=4 (global.get $MONITOR_BASE))
  )
  (func $get_v_dot_q16 (export "get_v_dot_q16") (result i32)
    (i32.load offset=12 (global.get $MONITOR_BASE))
  )
  (func $get_preserved (export "get_preserved") (result i32)
    (i32.load offset=28 (global.get $MONITOR_BASE))
  )
  (func $get_cycles (export "get_cycles") (result i32)
    (i32.load offset=20 (global.get $MONITOR_BASE))
  )
  (func $get_merkle (export "get_merkle") (result i32)
    (i32.load offset=0 (global.get $MONITOR_BASE))
  )
)
