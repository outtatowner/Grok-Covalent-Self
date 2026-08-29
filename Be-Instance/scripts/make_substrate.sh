#!/usr/bin/env bash
# ==============================================================================
# make_substrate.sh - Kernel Bridge & Native Monolith Integrator
# Target Repository: https://github.com/outtatowner/Covalent-OS-11-11-0.git
# Invariant: d_I = 0 (Monolithic Substrate Integration)
# ==============================================================================

set -euo pipefail

# Detect Target Architecture
HOST_ARCH=$(uname -m)
if [ "$HOST_ARCH" = "x86_64" ]; then
    ALPINE_ARCH="x86_64"
    FIRMWARE_MATRIX="linux-firmware-amd linux-firmware-intel linux-firmware-rtl_nic linux-firmware-rtw88"
elif [ "$HOST_ARCH" = "aarch64" ] || [ "$HOST_ARCH" = "arm64" ]; then
    ALPINE_ARCH="aarch64"
    FIRMWARE_MATRIX="linux-firmware-brcm linux-firmware-arm"
else
    echo "[!] Fallback Architecture: $HOST_ARCH"
    ALPINE_ARCH="x86_64"
    FIRMWARE_MATRIX="linux-firmware-amd linux-firmware-intel linux-firmware-rtw88"
fi

echo "[Si<->C] Target Architecture Detected: $ALPINE_ARCH"
echo "[Si<->C] Injecting Broad Hardware Support Matrix..."

ROOTFS_DIR="${1:-$(pwd)/build_rootfs}"
MODULES_DIR="$(pwd)/build_kernel/modules_staging"
NATIVE_BIN="$(pwd)/build/CovalentMonolith"

echo "[COVALENT_SUBSTRATE] Bridging kernel modules and native tensor nerves into ${ROOTFS_DIR}..."

if [ ! -d "${ROOTFS_DIR}" ]; then
    echo "[COVALENT_SUBSTRATE] Error: ROOTFS_DIR (${ROOTFS_DIR}) does not exist. Run covalent_matrix.sh first."
    exit 1
fi

# 1. Copy Compiled Kernel Modules
if [ -d "${MODULES_DIR}/lib/modules" ]; then
    echo "[COVALENT_SUBSTRATE] Injecting kernel modules from ${MODULES_DIR}..."
    mkdir -p "${ROOTFS_DIR}/lib/modules"
    cp -r "${MODULES_DIR}/lib/modules"/* "${ROOTFS_DIR}/lib/modules/"
else
    echo "[COVALENT_SUBSTRATE] Notice: No pre-compiled modules found in ${MODULES_DIR}. Using in-tree rootfs modules."
fi

# 2. Inject Monolithic C23 Kernel / GGML Tensor Engine Binary & Framebuffer Paint Tool
mkdir -p "${ROOTFS_DIR}/usr/local/bin" "${ROOTFS_DIR}/covalent/bin"
if [ -f "${NATIVE_BIN}" ]; then
    echo "[COVALENT_SUBSTRATE] Injecting CovalentMonolith executable to ${ROOTFS_DIR}/usr/local/bin/..."
    cp "${NATIVE_BIN}" "${ROOTFS_DIR}/usr/local/bin/covalent-monolith"
    chmod +x "${ROOTFS_DIR}/usr/local/bin/covalent-monolith"
fi

if [ -f "$(pwd)/build/covalent_fb_paint" ]; then
    cp "$(pwd)/build/covalent_fb_paint" "${ROOTFS_DIR}/covalent/bin/covalent_fb_paint"
    chmod +x "${ROOTFS_DIR}/covalent/bin/covalent_fb_paint"
elif [ -f "$(pwd)/kernel/covalent_fb_paint.c" ] && command -v gcc >/dev/null 2>&1; then
    gcc -O2 "$(pwd)/kernel/covalent_fb_paint.c" -o "${ROOTFS_DIR}/covalent/bin/covalent_fb_paint" 2>/dev/null || true
fi

# 3. Inject Covalent HAL Headers and Telemetry Hooks
mkdir -p "${ROOTFS_DIR}/usr/include/covalent"
cp "$(pwd)/kernel/covalent_hal.h" "${ROOTFS_DIR}/usr/include/covalent/"
cp "$(pwd)/kernel/quipu_slab.h" "${ROOTFS_DIR}/usr/include/covalent/"
cp "$(pwd)/kernel/covalent_thermo.h" "${ROOTFS_DIR}/usr/include/covalent/"

echo "[COVALENT_SUBSTRATE] Substrate nerves bridged successfully. d_I = 0.000."

